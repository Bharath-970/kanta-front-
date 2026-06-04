import shap
import numpy as np
from ml.predict import Predictor
from ml.features import FEATURE_COLS, engineer_row


class Explainer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            inst = super().__new__(cls)
            predictor = Predictor()
            # TreeExplainer uses tree structure directly — no background data, no sampling
            inst._explainer = shap.TreeExplainer(predictor.model)
            inst._scaler = predictor.scaler
            cls._instance = inst
        return cls._instance

    def explain(self, row: dict) -> dict:
        X = engineer_row(row, self._scaler).astype(float)
        sv = self._explainer.shap_values(X)
        vals = np.array(sv)
        # XGBoost binary output: (1, n_features) or (1, n_features, 2)
        if vals.ndim == 3:
            vals = vals[0, :, 1]
        else:
            vals = vals[0]
        return {feat: float(v) for feat, v in zip(FEATURE_COLS, vals)}
