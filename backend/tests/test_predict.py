import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.predict import Predictor

def test_predict_returns_score_and_band():
    p = Predictor()
    result = p.predict({
        "claim_amount": 200000, "length_of_stay": 1,
        "provider_experience": 5, "historical_denials": 15,
        "readmission_flag": 1, "repeat_procedure_flag": 1,
    })
    assert 1 <= result["score"] <= 999
    assert result["band"] in ("Low", "Medium", "High", "Critical")
    assert 0.0 <= result["raw_prob"] <= 1.0

def test_low_risk_claim():
    p = Predictor()
    result = p.predict({
        "claim_amount": 5000, "length_of_stay": 5,
        "provider_experience": 25, "historical_denials": 0,
        "readmission_flag": 0, "repeat_procedure_flag": 0,
    })
    assert result["band"] in ("Low", "Medium")

def test_high_risk_claim():
    p = Predictor()
    result = p.predict({
        "claim_amount": 280000, "length_of_stay": 0,
        "provider_experience": 2, "historical_denials": 18,
        "readmission_flag": 1, "repeat_procedure_flag": 1,
    })
    assert result["score"] > 500

def test_feature_importances_all_features():
    from ml.features import FEATURE_COLS
    p = Predictor()
    fi = p.feature_importances
    assert set(fi.keys()) == set(FEATURE_COLS)
