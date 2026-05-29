# Women in Hollywood ROI — Claude Code Instructions

## What this project does
A supervised machine learning model that predicts the ROI of films starring
or produced by leading Hollywood women. We train on historical budget and
box office data, then answer: if you invested $5M in a film featuring one
of these actresses, what return would you expect?

## Actresses covered
Meryl Streep · Nicole Kidman · Margot Robbie · Cate Blanchett ·
Charlize Theron · Sydney Sweeney · Ana de Armas

## Dataset
Manually curated from trade publications (Variety, Deadline, The Hollywood
Reporter) and verified against Wikipedia individual film pages.
- File: backend/data/raw/films.csv — 95 films, 7 actresses
- Processed: backend/data/processed/films_clean.csv
- Target variable: ROI (worldwide_gross_m / budget_m)
- Key features: budget_m, genre, source, role, studio, release year, actress, streaming

## Tech stack
- Backend: Python · scikit-learn Pipeline · FastAPI · joblib
- Frontend: React · Vite · Framer Motion · Plotly.js
- Do NOT use Dash — this project uses the React/Vite frontend

## Coding rules — follow these every time
- Use sklearn Pipeline for all preprocessing + model code
- Always add a comment above every code block explaining what it does
- Use the least amount of code possible — prefer built-in sklearn tools
- Never modify test data after the train/test split
- Save the best model to backend/models/best_model.pkl using joblib
- All React components use Framer Motion for entrance animations
- Plotly charts use the razzle-dazzle palette: deep navy bg, gold/rose accents

## Project structure
- backend/notebooks/01_eda.ipynb     — Agent 1: data exploration only
- backend/src/train.py               — Agent 2: pipeline, models, GridSearchCV
- backend/api/main.py                — Agent 3: FastAPI, serves predictions
- frontend/src/                      — Agent 4: React + Vite + Framer Motion UI

## How to run
```bash
# Backend
cd backend
pip install -r requirements.txt
python src/train.py
uvicorn api.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## NOD requirements checklist
- [ ] Real dataset, not synthetic
- [ ] Regression or classification — clearly stated
- [ ] EDA of features and target variable
- [ ] Baseline model defined
- [ ] Train/test split
- [ ] Preprocessing: scaling, OneHotEncoding, imputation
- [ ] At least 4 models tried on validation data
- [ ] GridSearchCV with K-fold cross validation
- [ ] Final model evaluated on test data once
- [ ] Trello board
- [ ] GitHub with README
