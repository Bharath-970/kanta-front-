import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import pytest
from ml.features import engineer_row, engineer_batch, FEATURE_COLS

SCALER = {
    "claim_mean": 150000.0, "claim_std": 80000.0,
    "los_mean": 7.0, "max_exp": 29.0, "max_denials": 19.0,
}

def _row():
    return {
        "claim_amount": 200000, "length_of_stay": 1,
        "provider_experience": 5, "historical_denials": 15,
        "readmission_flag": 1, "repeat_procedure_flag": 1,
    }

def test_engineer_row_returns_all_features():
    result = engineer_row(_row(), SCALER)
    assert list(result.columns) == FEATURE_COLS

def test_high_claim_short_stay_flag():
    result = engineer_row(_row(), SCALER)
    assert result["high_claim_short_stay"].iloc[0] == 1

def test_low_claim_no_flag():
    row = _row()
    row["claim_amount"] = 50000
    result = engineer_row(row, SCALER)
    assert result["high_claim_short_stay"].iloc[0] == 0

def test_engineer_batch_same_result():
    df = pd.DataFrame([_row()])
    batch = engineer_batch(df, SCALER)
    single = engineer_row(_row(), SCALER)
    assert batch.equals(single)
