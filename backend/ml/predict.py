from pathlib import Path
import joblib
import numpy as np
from ml.features import engineer_row, engineer_batch, FEATURE_COLS

ARTIFACTS = Path(__file__).parent.parent / "artifacts"

BANDS = [
    (851, "Critical"),
    (651, "High"),
    (351, "Medium"),
    (0,   "Low"),
]


def _band(score: int) -> str:
    for threshold, label in BANDS:
        if score >= threshold:
            return label
    return "Low"


class Predictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            inst = super().__new__(cls)
            inst.model = joblib.load(ARTIFACTS / "model.pkl")
            inst.calibrator = joblib.load(ARTIFACTS / "calibrator.pkl")
            inst.scaler = joblib.load(ARTIFACTS / "scaler_params.pkl")
            cls._instance = inst
        return cls._instance

    def predict(self, row: dict) -> dict:
        X = engineer_row(row, self.scaler)
        raw = float(self.model.predict_proba(X)[:, 1][0])
        cal = float(self.calibrator.transform([raw])[0])
        score = min(int(cal * 999 + 1), 999)
        return {
            "score": score,
            "band": _band(score),
            "raw_prob": raw,
            "calibrated_prob": cal,
        }

    def predict_batch_df(self, df) -> np.ndarray:
        X = engineer_batch(df, self.scaler)
        raw = self.model.predict_proba(X)[:, 1]
        cal = self.calibrator.transform(raw)
        return np.clip((cal * 999 + 1).astype(int), 1, 999)

    @property
    def feature_importances(self) -> dict:
        return dict(zip(FEATURE_COLS, self.model.feature_importances_.tolist()))
