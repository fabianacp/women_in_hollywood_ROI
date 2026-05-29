"""
backend/src/train.py
Train ROI prediction model on Women in Hollywood dataset.
Run from backend/: python src/train.py
Outputs:
    models/best_model.pkl           — best model pipeline (joblib)
    data/processed/results.csv      — test-set predictions + residuals
    data/processed/model_scores.csv — cross-val comparison of all 5 models
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor
from catboost import CatBoostRegressor


# ── 1. Load processed data — build from raw if notebook hasn't been run yet ───
import os
processed_path = "data/processed/films_clean.csv"

if not os.path.exists(processed_path):
    raw = pd.read_csv("data/raw/films.csv")
    df  = raw[(raw["streaming"] == "No") & (raw["budget_m"] > 0) & (raw["worldwide_gross_m"] > 0)].copy()
    df["roi"] = (df["worldwide_gross_m"] / df["budget_m"]).round(2)
    os.makedirs("data/processed", exist_ok=True)
    df.to_csv(processed_path, index=False)
    print(f"Generated films_clean.csv from raw data — {len(df)} theatrical films")
else:
    df = pd.read_csv(processed_path)
    print(f"Loaded {len(df)} theatrical films")


# ── 2. Define features and target ─────────────────────────────────────────────
NUMERIC_FEATURES     = ["budget_m", "year"]
CATEGORICAL_FEATURES = ["actress", "genre", "source", "role"]
TARGET               = "roi"

X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES].copy()
y = df[TARGET].copy()

# Log-transform ROI — distribution is right-skewed (Barbie 10x is an outlier)
# Model learns on log scale; we exponentiate predictions back at evaluation
y_log = np.log(y)


# ── 3. Train / test split — 80/20, stratified on ROI buckets ─────────────────
# Bin ROI into 3 buckets so all ranges are represented in both sets
roi_bins = pd.cut(y_log, bins=3, labels=["low", "mid", "high"])

X_train, X_test, y_train, y_test = train_test_split(
    X, y_log, test_size=0.2, random_state=42, stratify=roi_bins
)
print(f"Train: {len(X_train)} films  |  Test (hidden): {len(X_test)} films")


# ── 4. Preprocessing pipeline ─────────────────────────────────────────────────
# Numeric: impute median → scale
# Categorical: impute most_frequent → one-hot encode
numeric_pipe = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale",  StandardScaler()),
])

categorical_pipe = Pipeline([
    ("impute", SimpleImputer(strategy="most_frequent")),
    ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

preprocessor = ColumnTransformer([
    ("num", numeric_pipe,      NUMERIC_FEATURES),
    ("cat", categorical_pipe,  CATEGORICAL_FEATURES),
])


# ── 5. Define all 5 model pipelines ───────────────────────────────────────────
models = {
    "Linear Regression": Pipeline([
        ("prep",  preprocessor),
        ("model", LinearRegression()),
    ]),
    "Random Forest": Pipeline([
        ("prep",  preprocessor),
        ("model", RandomForestRegressor(random_state=42)),
    ]),
    "Gradient Boosting": Pipeline([
        ("prep",  preprocessor),
        ("model", GradientBoostingRegressor(random_state=42)),
    ]),
    "XGBoost": Pipeline([
        ("prep",  preprocessor),
        ("model", XGBRegressor(random_state=42, verbosity=0)),
    ]),
    # CatBoost receives pre-processed data via the pipeline
    # In production, pass cat_features directly for native handling
    "CatBoost": Pipeline([
        ("prep",  preprocessor),
        ("model", CatBoostRegressor(random_state=42, verbose=0)),
    ]),
}


# ── 6. GridSearchCV hyperparameter grids ──────────────────────────────────────
param_grids = {
    "Linear Regression": {},   # no hyperparameters to tune
    "Random Forest": {
        "model__n_estimators": [100, 200],
        "model__max_depth":    [3, 5, None],
    },
    "Gradient Boosting": {
        "model__n_estimators":  [100, 200],
        "model__learning_rate": [0.05, 0.1],
        "model__max_depth":     [3, 5],
    },
    "XGBoost": {
        "model__n_estimators":  [100, 200],
        "model__learning_rate": [0.05, 0.1],
        "model__max_depth":     [3, 5],
        "model__reg_alpha":     [0, 0.1],
    },
    "CatBoost": {
        "model__iterations":    [100, 200],
        "model__learning_rate": [0.05, 0.1],
        "model__depth":         [4, 6],
    },
}


# ── 7. Cross-validate all 5 models and pick the best ──────────────────────────
print("\n=== Cross-validation results (cv=5, scoring=MAE on log ROI) ===")
cv_scores = {}

for name, pipeline in models.items():
    grid = GridSearchCV(
        pipeline, param_grids[name],
        cv=5, scoring="neg_mean_absolute_error",
        n_jobs=-1, refit=True,
    )
    grid.fit(X_train, y_train)

    cv_mae  = -grid.best_score_
    cv_r2   = cross_val_score(grid.best_estimator_, X_train, y_train,
                               cv=5, scoring="r2").mean()
    cv_scores[name] = {
        "cv_mae":    round(cv_mae, 4),
        "cv_r2":     round(cv_r2,  4),
        "best_params": grid.best_params_,
        "estimator": grid.best_estimator_,
    }
    print(f"  {name:<22}  MAE={cv_mae:.4f}  R²={cv_r2:.4f}  {grid.best_params_}")


# ── 8. Select best model by lowest cross-val MAE ─────────────────────────────
best_name = min(cv_scores, key=lambda n: cv_scores[n]["cv_mae"])
best_model = cv_scores[best_name]["estimator"]
print(f"\nBest model: {best_name}")


# ── 9. Evaluate best model on test set — done ONCE only ──────────────────────
# This is the only time the test set is touched
y_pred_log = best_model.predict(X_test)

# Convert log predictions back to ROI scale for interpretability
y_pred_roi = np.exp(y_pred_log)
y_test_roi = np.exp(y_test)

test_mae = mean_absolute_error(y_test_roi, y_pred_roi)
test_r2  = r2_score(y_test_roi, y_pred_roi)

print(f"\n=== Test set evaluation ({len(X_test)} films) ===")
print(f"  MAE : {test_mae:.3f}x  (average prediction error in ROI)")
print(f"  R²  : {test_r2:.3f}")

# Human-readable: if ROI=3x mean, MAE in dollars for a $100M film
print(f"\n  On a $100M film, average prediction error ≈ ${test_mae * 100:.0f}M")


# ── 10. Save residuals and predictions for the dashboard ──────────────────────
results = X_test.copy()
results["title"]         = df.loc[X_test.index, "title"]
results["actress"]       = df.loc[X_test.index, "actress"]
results["roi_actual"]    = y_test_roi.values
results["roi_predicted"] = y_pred_roi.round(2)
results["residual"]      = (y_test_roi.values - y_pred_roi).round(2)
results["budget_m"]      = df.loc[X_test.index, "budget_m"].values
results["worldwide_gross_m"] = df.loc[X_test.index, "worldwide_gross_m"].values

results.to_csv("data/processed/results.csv", index=False)
print(f"\nSaved test predictions → data/processed/results.csv")


# ── 11. Save model comparison scores ─────────────────────────────────────────
scores_df = pd.DataFrame([
    {"model": name, "cv_mae": s["cv_mae"], "cv_r2": s["cv_r2"]}
    for name, s in cv_scores.items()
]).sort_values("cv_mae")

scores_df.to_csv("data/processed/model_scores.csv", index=False)
print("Saved model comparison → data/processed/model_scores.csv")
print("\n" + scores_df.to_string(index=False))


# ── 12. Save best model ───────────────────────────────────────────────────────
joblib.dump(best_model, "models/best_model.pkl")
print(f"\nSaved best model ({best_name}) → models/best_model.pkl")
