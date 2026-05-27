# Stage 1: Build dependencies
FROM python:3.12-slim AS builder

WORKDIR /build

# Install compilation essentials if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into local prefix
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final runtime container
FROM python:3.12-slim AS runner

WORKDIR /workspace

# Copy installed libraries from builder stage
COPY --from=builder /root/.local /root/.local
COPY . /workspace

# Update PATH env
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/workspace

EXPOSE 8000

# Start server command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
