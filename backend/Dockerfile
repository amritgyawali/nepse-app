FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 5000

# Run the application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]