from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ml.predict import Predictor
from ml.explain import Explainer
from ml.hospital import HospitalRanker


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm all singletons at startup — heavy I/O and computation happens here
    Predictor()
    Explainer()
    HospitalRanker()
    yield


app = FastAPI(title="Risk Scoring API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimInput(BaseModel):
    claim_amount: int = Field(..., ge=1000, le=300000)
    length_of_stay: int = Field(..., ge=0, le=30)
    provider_experience: int = Field(..., ge=1, le=30)
    historical_denials: int = Field(..., ge=0, le=20)
    readmission_flag: int = Field(..., ge=0, le=1)
    repeat_procedure_flag: int = Field(..., ge=0, le=1)


class PredictResponse(BaseModel):
    score: int
    band: str
    raw_prob: float
    calibrated_prob: float


class ExplainResponse(BaseModel):
    shap_values: dict
    prediction: PredictResponse


class HospitalEntry(BaseModel):
    hospital_id: str
    avg_risk_score: float
    claim_count: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(claim: ClaimInput):
    return Predictor().predict(claim.model_dump())


@app.post("/explain", response_model=ExplainResponse)
def explain(claim: ClaimInput):
    row = claim.model_dump()
    return {
        "shap_values": Explainer().explain(row),
        "prediction": Predictor().predict(row),
    }


@app.get("/hospitals", response_model=list[HospitalEntry])
def hospitals(limit: int = 20):
    if not 1 <= limit <= 100:
        raise HTTPException(400, "limit must be 1–100")
    return HospitalRanker().get_ranking(limit=limit)


@app.get("/features")
def features():
    return Predictor().feature_importances
