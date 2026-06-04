from pathlib import Path
import pandas as pd
from ml.predict import Predictor

DATA_PATH = Path(__file__).parent.parent / "artifacts" / "synthetic_data.csv"


class HospitalRanker:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            inst = super().__new__(cls)
            inst._ranking = cls._compute()
            cls._instance = inst
        return cls._instance

    @staticmethod
    def _compute() -> list:
        df = pd.read_csv(DATA_PATH)
        predictor = Predictor()
        # Single vectorized call — replaces 10k individual predict calls
        df["risk_score"] = predictor.predict_batch_df(df)
        ranking = (
            df.groupby("hospital_id")["risk_score"]
            .agg(avg_risk_score="mean", claim_count="count")
            .reset_index()
            .sort_values("avg_risk_score", ascending=False)
        )
        ranking["avg_risk_score"] = ranking["avg_risk_score"].round(1)
        return ranking.to_dict(orient="records")

    def get_ranking(self, limit: int = 100) -> list:
        return self._ranking[:limit]
