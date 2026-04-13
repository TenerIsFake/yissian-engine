"""
Chat persistence layer — Peewee + SQLite WAL mode.
Tables: ChatSession, ChatMessage.
"""
import os
from datetime import datetime
from peewee import (
    SqliteDatabase, Model, AutoField, CharField, TextField,
    DateTimeField, ForeignKeyField, IntegerField,
)

DB_PATH = os.environ.get('CHAT_DB_PATH', '/data/chat.db')
db = SqliteDatabase(DB_PATH, pragmas={
    'journal_mode': 'wal',
    'cache_size': -1024 * 8,   # 8 MB
    'foreign_keys': 1,
    'busy_timeout': 5000,
})


class BaseModel(Model):
    class Meta:
        database = db


class ChatSession(BaseModel):
    id = AutoField()
    persona = CharField(default='media_assistant')
    title = CharField(default='New Chat')
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'persona': self.persona,
            'title': self.title,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'message_count': self.messages.count(),
        }


class CustomPersona(BaseModel):
    id = AutoField()
    key = CharField(unique=True)          # e.g. 'custom_pirate'
    name = CharField()                    # display name, e.g. 'The Pirate'
    instruction = TextField()             # system instruction text
    greeting = CharField(default='Ready.')
    glyph = CharField(default='🤖')       # emoji avatar
    hue = IntegerField(default=200)       # avatar ring hue
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'name': self.name,
            'instruction': self.instruction,
            'greeting': self.greeting,
            'glyph': self.glyph,
            'hue': self.hue,
        }


class ChatMessage(BaseModel):
    id = AutoField()
    session = ForeignKeyField(ChatSession, backref='messages', on_delete='CASCADE')
    role = CharField()          # 'user' or 'bot'
    text = TextField()
    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'text': self.text,
            'created_at': self.created_at.isoformat(),
        }


def init_db():
    """Create tables if they don't exist."""
    db.connect(reuse_if_open=True)
    db.create_tables([ChatSession, ChatMessage, CustomPersona])
