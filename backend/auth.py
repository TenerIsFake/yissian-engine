"""
TOTP authentication for Gemini chat.
Single-user setup: first call to /api/chat/auth/setup generates a secret + QR.
Subsequent logins verify a 6-digit TOTP code and return a JWT.
"""
import os
import io
import base64
import time
import functools
from datetime import datetime

import jwt
import pyotp
import qrcode
import qrcode.image.svg
from flask import request, jsonify
from peewee import Model, CharField, DateTimeField, BooleanField

from models import db, BaseModel

JWT_SECRET = os.environ.get('JWT_SECRET', os.urandom(32).hex())
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY = 86400 * 7  # 7 days
TOTP_ISSUER = 'Jenkins Homelab'
TOTP_ACCOUNT = 'gemini-chat'


class AuthUser(BaseModel):
    """Single-row table storing the TOTP secret. Only one user supported."""
    totp_secret = CharField()
    created_at = DateTimeField(default=datetime.utcnow)
    verified = BooleanField(default=False)


def init_auth_db():
    """Create auth table if it doesn't exist."""
    db.create_tables([AuthUser])


def _get_user():
    """Get the single auth user, or None if not set up."""
    try:
        return AuthUser.get_by_id(1)
    except AuthUser.DoesNotExist:
        return None


def _generate_qr_data_uri(uri):
    """Generate a QR code as a base64 SVG data URI (no Pillow needed)."""
    qr = qrcode.QRCode(box_size=6, border=2)
    qr.add_data(uri)
    qr.make(fit=True)
    factory = qrcode.image.svg.SvgPathImage
    img = qr.make_image(image_factory=factory)
    buf = io.BytesIO()
    img.save(buf)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/svg+xml;base64,{b64}"


def _create_token():
    """Create a signed JWT token."""
    payload = {
        'sub': 'gemini-chat',
        'iat': int(time.time()),
        'exp': int(time.time()) + JWT_EXPIRY,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _verify_token(token):
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def require_auth(f):
    """Decorator: require valid JWT in Authorization header."""
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        # If no user is set up yet, allow unauthenticated access
        user = _get_user()
        if not user or not user.verified:
            return f(*args, **kwargs)

        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required", "auth_required": True}), 401
        token = auth_header[7:]
        payload = _verify_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token", "auth_required": True}), 401
        return f(*args, **kwargs)
    return wrapper


# ── Flask route handlers (registered in server.py) ──

def auth_status():
    """GET /api/chat/auth/status — Check if auth is set up and if current token is valid."""
    user = _get_user()
    if not user:
        return jsonify({"setup": False, "authenticated": False})

    auth_header = request.headers.get('Authorization', '')
    authenticated = False
    if auth_header.startswith('Bearer '):
        payload = _verify_token(auth_header[7:])
        authenticated = payload is not None

    return jsonify({
        "setup": user.verified,
        "authenticated": authenticated,
    })


def auth_setup():
    """POST /api/chat/auth/setup — Generate TOTP secret and QR code. Only works once."""
    user = _get_user()
    if user and user.verified:
        return jsonify({"error": "Already set up. Use /verify to log in."}), 400

    # Generate new secret (or reuse unverified one)
    if user:
        secret = user.totp_secret
    else:
        secret = pyotp.random_base32()
        AuthUser.create(totp_secret=secret, verified=False)

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=TOTP_ACCOUNT, issuer_name=TOTP_ISSUER)
    qr_data_uri = _generate_qr_data_uri(uri)

    return jsonify({
        "secret": secret,
        "qr": qr_data_uri,
        "uri": uri,
    })


def auth_verify():
    """POST /api/chat/auth/verify — Verify a 6-digit TOTP code. Returns JWT on success."""
    data = request.json or {}
    code = str(data.get('code', '')).strip()
    if not code or len(code) != 6:
        return jsonify({"error": "6-digit code required"}), 400

    user = _get_user()
    if not user:
        return jsonify({"error": "Run /setup first"}), 400

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code, valid_window=1):
        return jsonify({"error": "Invalid code"}), 401

    # Mark as verified on first successful login
    if not user.verified:
        user.verified = True
        user.save()

    token = _create_token()
    return jsonify({
        "token": token,
        "expires_in": JWT_EXPIRY,
    })


def auth_reset():
    """POST /api/chat/auth/reset — Reset auth (requires valid JWT). Deletes TOTP secret."""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        payload = _verify_token(auth_header[7:])
        if not payload:
            return jsonify({"error": "Valid token required to reset"}), 401
    else:
        # Also allow reset if no user exists
        user = _get_user()
        if user and user.verified:
            return jsonify({"error": "Valid token required to reset"}), 401

    AuthUser.delete().execute()
    return jsonify({"ok": True, "message": "Auth reset. Run /setup to reconfigure."})
