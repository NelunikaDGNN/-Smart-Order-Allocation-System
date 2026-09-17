"""
Trains a TF-IDF + Logistic Regression classifier on the customer message
dataset, and saves the fitted vectorizer + model to disk for predict.py.

Chosen approach: classic ML (TF-IDF features + a linear classifier) rather
than embeddings or a deep learning model. Rationale (see README):
  - Small dataset (~450 rows, 8 classes) -- a linear model on TF-IDF
    features is well-matched to this size and far less prone to overfitting
    than a heavier model would be.
  - Fully explainable: you can inspect which words drive each prediction,
    which matters for justifying the approach in the technical interview.
  - Fast to train and to run inference on (no GPU, sub-second predictions),
    fitting a subprocess-per-request architecture.

Handles the 10 rows in the dataset with no label by dropping them from
training (they can't inform a supervised model) -- documented in README.

Usage:
    python3 train_classifier.py path/to/Customer_Message_Dataset.csv
"""
import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.pipeline import Pipeline
import joblib


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 train_classifier.py <dataset.csv>")
        sys.exit(1)

    dataset_path = sys.argv[1]
    df = pd.read_csv(dataset_path)

    before = len(df)
    df = df.dropna(subset=["category"])
    df = df[df["category"].str.strip() != ""]
    dropped = before - len(df)
    if dropped:
        print(f"Dropped {dropped} unlabeled rows (cannot be used for supervised training).")

    X = df["message"].astype(str)
    y = df["category"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            min_df=1,
            stop_words="english",
        )),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("\n--- Classification report (held-out test set) ---")
    print(classification_report(y_test, y_pred))

    joblib.dump(pipeline, "model.pkl")
    print("Saved trained pipeline to model.pkl")

    with open("categories.json", "w") as f:
        json.dump(sorted(y.unique().tolist()), f)
    print("Saved category list to categories.json")


if __name__ == "__main__":
    main()
