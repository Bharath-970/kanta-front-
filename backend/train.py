import pandas as pd
import numpy as np
import random
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.calibration import IsotonicRegression
from xgboost import XGBClassifier

ARTIFACTS = Path(__file__).parent / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)

np.random.seed(42)
random.seed(42)
n = 10000
hospital_ids = [f"HOSP_{i}" for i in range(1, 101)]

rows = []
for i in range(n):
    claim_amount = np.random.randint(2000, 300000)
    los = np.random.randint(0, 15)
    provider_exp = np.random.randint(1, 30)
    denials = np.random.randint(0, 20)
    readmission = np.random.choice([0, 1], p=[0.85, 0.15])
    repeat_proc = np.random.choice([0, 1], p=[0.9, 0.1])
    fraud = int(
        (claim_amount > 150000 and los <= 1)
        or (denials > 10)
        or (repeat_proc == 1 and readmission == 1)
    )
    rows.append([
        f"CLM_{i}", random.choice(hospital_ids),
        claim_amount, los, provider_exp, denials,
        readmission, repeat_proc, fraud,
    ])

df = pd.DataFrame(rows, columns=[
    "claim_id", "hospital_id", "claim_amount", "length_of_stay",
    "provider_experience", "historical_denials",
    "readmission_flag", "repeat_procedure_flag", "fraud_flag",
])

scaler = {
    "claim_mean": float(df["claim_amount"].mean()),
    "claim_std": float(df["claim_amount"].std()),
    "los_mean": float(df["length_of_stay"].mean()),
    "max_exp": float(df["provider_experience"].max()),
    "max_denials": float(df["historical_denials"].max()),
}

def engineer(df_in: pd.DataFrame, s: dict) -> pd.DataFrame:
    d = df_in.copy()
    claim_std = s["claim_std"] or 1
    d["amount_zscore"] = (d["claim_amount"] - s["claim_mean"]) / claim_std
    d["los_ratio"] = d["length_of_stay"] / (s["los_mean"] + 1)
    d["provider_exp_norm"] = d["provider_experience"] / (s["max_exp"] or 1)
    d["denial_risk"] = d["historical_denials"] / (s["max_denials"] or 1)
    d["high_claim_short_stay"] = (
        (d["claim_amount"] > 120000) & (d["length_of_stay"] <= 1)
    ).astype(int)
    return d[[
        "amount_zscore", "los_ratio", "provider_exp_norm", "denial_risk",
        "readmission_flag", "repeat_procedure_flag", "high_claim_short_stay",
    ]]

X = engineer(df, scaler)
y = df["fraud_flag"]

X_train, X_cal, y_train, y_cal = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",
    random_state=42,
)
model.fit(X_train, y_train)

raw_probs = model.predict_proba(X_cal)[:, 1]
calibrator = IsotonicRegression(out_of_bounds="clip")
calibrator.fit(raw_probs, y_cal)

joblib.dump(model, ARTIFACTS / "model.pkl")
joblib.dump(calibrator, ARTIFACTS / "calibrator.pkl")
joblib.dump(scaler, ARTIFACTS / "scaler_params.pkl")
df.to_csv(ARTIFACTS / "synthetic_data.csv", index=False)

print(f"Artifacts saved to {ARTIFACTS}")
print(f"Train size: {len(X_train)}, Cal size: {len(X_cal)}")
print(f"Fraud rate: {y.mean():.2%}")
