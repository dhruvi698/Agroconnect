#!/bin/bash
# start.sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting AgroConnect..."

# 1. Check for backend/venv and create if missing
if [ ! -d "backend/venv" ] || [ ! -f "backend/venv/bin/activate" ]; then
    echo "Creating virtual environment in backend/venv..."
    python3 -m venv backend/venv
fi

# 2. Activate virtual environment
echo "Activating virtual environment..."
source backend/venv/bin/activate

# 3. Install dependencies
echo "Installing/updating dependencies..."
pip install -r requirements.txt

# 4. Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    # Export env vars ignoring comments
    export $(grep -v '^#' .env | xargs)
fi

# 5. Start the server
echo "Starting Flask server..."
cd backend
echo "=========================================="
echo " The server will be running at:"
echo " http://127.0.0.1:5000"
echo "=========================================="
exec python app.py
