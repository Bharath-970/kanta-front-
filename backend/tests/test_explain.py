import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.explain import Explainer
from ml.features import FEATURE_COLS

def test_explain_returns_all_features():
    e = Explainer()
    shap_vals = e.explain({
        "claim_amount": 200000, "length_of_stay": 1,
        "provider_experience": 5, "historical_denials": 15,
        "readmission_flag": 1, "repeat_procedure_flag": 1,
    })
    assert set(shap_vals.keys()) == set(FEATURE_COLS)

def test_explain_values_are_floats():
    e = Explainer()
    shap_vals = e.explain({
        "claim_amount": 5000, "length_of_stay": 5,
        "provider_experience": 25, "historical_denials": 0,
        "readmission_flag": 0, "repeat_procedure_flag": 0,
    })
    assert all(isinstance(v, float) for v in shap_vals.values())

def test_singleton_same_instance():
    assert Explainer() is Explainer()
