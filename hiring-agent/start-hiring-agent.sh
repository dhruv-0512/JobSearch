#!/bin/bash
# ─────────────────────────────────────────────────────────────
# start-hiring-agent.sh
# Starts the hiring-agent FastAPI service with the .venv
# Usage: bash hiring-agent/start-hiring-agent.sh
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "⚙️  Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

echo "📦 Activating venv and installing requirements..."
source "$VENV_DIR/bin/activate"
pip install -r "$SCRIPT_DIR/requirements.txt" -q

if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "⚠️  .env not found — copying from .env.example"
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  echo "👉 Edit hiring-agent/.env and add your DEEPSEEK_API_KEY before continuing"
  exit 1
fi

PORT="${PORT:-8008}"
echo "🚀 Starting hiring-agent API on port $PORT..."
cd "$SCRIPT_DIR"
uvicorn api_server:app --host 0.0.0.0 --port "$PORT"
