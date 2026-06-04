import pandas as pd

FEATURE_COLS = [
    "amount_zscore",
    "los_ratio",
    "provider_exp_norm",
    "denial_risk",
    "readmission_flag",
    "repeat_procedure_flag",
    "high_claim_short_stay",
]


def engineer_batch(df: pd.DataFrame, scaler: dict) -> pd.DataFrame:
    d = df.copy()
    claim_std = scaler["claim_std"] or 1
    d["amount_zscore"] = (d["claim_amount"] - scaler["claim_mean"]) / claim_std
    d["los_ratio"] = d["length_of_stay"] / (scaler["los_mean"] + 1)
    d["provider_exp_norm"] = d["provider_experience"] / (scaler["max_exp"] or 1)
    d["denial_risk"] = d["historical_denials"] / (scaler["max_denials"] or 1)
    d["high_claim_short_stay"] = (
        (d["claim_amount"] > 120000) & (d["length_of_stay"] <= 1)
    ).astype(int)
    return d[FEATURE_COLS]


def engineer_row(row: dict, scaler: dict) -> pd.DataFrame:
    return engineer_batch(pd.DataFrame([row]), scaler)
