#!/bin/bash
cd "$(dirname "$0")/../backend" || exit 1
exec ./venv/bin/uvicorn main:app --reload --reload-include "*.py" --port 8000
