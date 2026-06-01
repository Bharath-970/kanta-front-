#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const artifacts = [
  "backend/artifacts/model.pkl",
  "backend/artifacts/calibrator.pkl",
  "backend/artifacts/scaler_params.pkl",
];

const missing = artifacts.filter((f) => !fs.existsSync(path.join(process.cwd(), f)));

if (missing.length > 0) {
  console.error("\n❌ Backend artifacts missing:");
  missing.forEach((f) => console.error(`   - ${f}`));
  console.error("\n👉 Run: cd backend && ./venv/bin/python train.py\n");
  process.exit(1);
}

const venvPython = path.join(process.cwd(), "backend/venv/bin/python");
if (!fs.existsSync(venvPython)) {
  console.error("\n❌ Python venv not found at backend/venv/");
  console.error("👉 Run: cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt\n");
  process.exit(1);
}

console.log("✅ Backend ready");
process.exit(0);
