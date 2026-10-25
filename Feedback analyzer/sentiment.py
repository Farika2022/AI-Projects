from transformers import pipeline

# A small, fast model trained on movie reviews. It only predicts POSITIVE or NEGATIVE.
MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"


def load_model():
    """Download (first time only) and load the sentiment model."""
    return pipeline("sentiment-analysis", model=MODEL_NAME)


def analyze_review(text, model):
    """Return the sentiment label and confidence score for one review."""
    # truncation=True cuts very long reviews down to the model's 512-token limit
    result = model(text, truncation=True)[0]
    return {"label": result["label"], "score": result["score"]}


def analyze_reviews(texts, model):
    """Analyze a list of reviews in one go. Returns a list of {label, score} dicts."""
    # Passing a whole list is much faster than calling the model once per review
    results = model(texts, truncation=True)
    return [{"label": r["label"], "score": r["score"]} for r in results]


# This block only runs when you do `python sentiment.py`, not when app.py imports this file.
if __name__ == "__main__":
    model = load_model()

    samples = [
        "I love this product! It works perfectly.",
        "Terrible service. I want my money back.",
        "The delivery was late but the quality is great.",
    ]

    for review in samples:
        prediction = analyze_review(review, model)
        print(f"{prediction['label']:<9} {prediction['score']:.1%}  |  {review}")

# You can test the model without the UI. In Step 2 you checked the model with plain python sentiment.py in the terminal, with no browser. When something breaks, this tells you whether the problem is the model or the page.