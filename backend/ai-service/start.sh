#!/bin/bash

# Ensure we have the port variable set, default to 10000 if not
PORT="${PORT:-10000}"

echo "Starting AI Service on port $PORT..."

# Run uvicorn with the dynamic port
# worker-class uvicorn.workers.UvicornWorker is for Gunicorn, but here we use uvicorn directly
# We bind to 0.0.0.0 so external traffic can reach it
exec uvicorn app:app --host 0.0.0.0 --port $PORT
