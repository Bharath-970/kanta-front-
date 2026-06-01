export interface ClaimInput {
  claim_amount: number;
  length_of_stay: number;
  provider_experience: number;
  historical_denials: number;
  readmission_flag: 0 | 1;
  repeat_procedure_flag: 0 | 1;
}

export interface PredictResponse {
  score: number;
  band: "Low" | "Medium" | "High" | "Critical";
  raw_prob: number;
  calibrated_prob: number;
}

export interface ExplainResponse {
  shap_values: Record<string, number>;
  prediction: PredictResponse;
}

export interface HospitalEntry {
  hospital_id: string;
  avg_risk_score: number;
  claim_count: number;
}

export type FeatureImportances = Record<string, number>;
