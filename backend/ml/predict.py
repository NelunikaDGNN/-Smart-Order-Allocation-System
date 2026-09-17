"""
Loads the trained model and classifies a single message, printing a single
JSON line to stdout: {"category": "...", "confidence": 0.xx}

Called as a subprocess from Node (classificationService.js). Low-confidence
handling (below ML_CONFIDENCE_THRESHOLD) is done on the Node side, not here
-- this script always returns its best guess + true confidence so the
threshold can be tuned without retraining.

Usage:
    python3 predict.py "customer message text here"
"""
import sys
import json
import os
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"category": None, "confidence": None, "error": "no_message"}))
        sys.exit(1)

    message = sys.argv[1]

    if not os.path.exists(MODEL_PATH):
        print(json.dumps({
            "category": None, "confidence": None,
            "error": "model_not_trained. Run train_classifier.py first.",
        }))
        sys.exit(1)

    pipeline = joblib.load(MODEL_PATH)

    probs = pipeline.predict_proba([message])[0]
    classes = pipeline.classes_
    best_idx = probs.argmax()

    result = {
        "category": str(classes[best_idx]),
        "confidence": round(float(probs[best_idx]), 4),
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
