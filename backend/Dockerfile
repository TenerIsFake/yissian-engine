FROM python:3.12-slim
WORKDIR /app
RUN useradd --no-create-home -u 1000 appuser
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py .
RUN chown appuser:appuser /app/server.py
USER appuser
EXPOSE 5000
CMD ["gunicorn", "--workers=2", "--timeout=60", "--bind=0.0.0.0:5000", "server:app"]
