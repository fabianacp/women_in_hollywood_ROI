"""
backend/api/main.py
FastAPI — serves all data and predictions to the React frontend.
Run from backend/: uvicorn api.main:app --reload
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI(title="Women in Hollywood ROI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
def load_all():
    global model
    try:
        model = joblib.load("models/best_model.pkl")
    except FileNotFoundError:
        pass


def load_csv(path):
    if not os.path.exists(path):
        return None
    return pd.read_csv(path)


def df_to_json(df):
    # pandas .to_json converts NaN → null correctly; standard json.dumps does not
    return JSONResponse(content=json.loads(df.to_json(orient="records")))


@app.get("/")
def root():
    return {"status": "Women in Hollywood ROI API", "model_loaded": model is not None}


@app.get("/films")
def get_films():
    df = load_csv("data/processed/films_clean.csv")
    if df is None: raise HTTPException(status_code=404, detail="Run src/train.py first")
    return df_to_json(df)


@app.get("/actresses")
def get_actresses():
    df = load_csv("data/processed/films_clean.csv")
    if df is None: raise HTTPException(status_code=404, detail="Run src/train.py first")
    stats = (
        df.groupby("actress")["roi"]
        .agg(mean_roi="mean", median_roi="median", film_count="count",
             min_roi="min", max_roi="max")
        .round(2).reset_index()
        .sort_values("mean_roi", ascending=False)
    )
    stats["return_5m"] = (stats["mean_roi"] * 5).round(2)
    stats["profit_5m"] = (stats["return_5m"] - 5).round(2)
    return df_to_json(stats)


@app.get("/model-scores")
def get_model_scores():
    df = load_csv("data/processed/model_scores.csv")
    if df is None: raise HTTPException(status_code=404, detail="Run src/train.py first")
    return df_to_json(df)


@app.get("/results")
def get_results():
    df = load_csv("data/processed/results.csv")
    if df is None: raise HTTPException(status_code=404, detail="Run src/train.py first")
    return df_to_json(df)


@app.get("/studios")
def get_studios():
    df = load_csv("data/raw/studio_marketing.csv")
    if df is None: raise HTTPException(status_code=404, detail="studio_marketing.csv not found")
    return df_to_json(df)


@app.get("/accounting")
def get_accounting():
    df = load_csv("data/raw/hollywood_accounting.csv")
    if df is None: raise HTTPException(status_code=404, detail="hollywood_accounting.csv not found")
    return df_to_json(df)


class PredictionRequest(BaseModel):
    budget_m: float
    year: int
    actress: str
    genre: str
    source: str
    role: str


@app.post("/predict")
def predict_roi(req: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run src/train.py first.")
    input_df = pd.DataFrame([{
        "budget_m": req.budget_m,
        "year":     req.year,
        "actress":  req.actress,
        "genre":    req.genre,
        "source":   req.source,
        "role":     req.role,
    }])
    predicted_roi   = float(np.exp(model.predict(input_df)[0]))
    predicted_gross = round(req.budget_m * predicted_roi, 1)
    return {
        "predicted_roi":        round(predicted_roi, 2),
        "predicted_gross_m":    predicted_gross,
        "investment_return_5m": round(5 * predicted_roi, 2),
        "investment_profit_5m": round(5 * predicted_roi - 5, 2),
    }
