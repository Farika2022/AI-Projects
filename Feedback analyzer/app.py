import pandas as pd
import streamlit as st

from sentiment import analyze_review, analyze_reviews, load_model

st.set_page_config(page_title="Feedback Analyzer", page_icon="💬")


# Streamlit reruns this script on every click. cache_resource keeps the model
# in memory so it's only loaded the first time.
@st.cache_resource(show_spinner="Loading the AI model (first time only)...")
def get_model():
    return load_model()


model = get_model()

st.title("💬 Customer Feedback Analyzer")
st.write("Paste a customer review below to find out if it's **positive** or **negative**.")

review = st.text_area("Customer review", placeholder="e.g. The product arrived quickly and works great!")

if st.button("Analyze"):
    if not review.strip():
        st.warning("Please enter a review")
    else:
        with st.spinner("Analyzing..."):
            result = analyze_review(review, model)

        if result["label"] == "POSITIVE":
            st.success("😊 Positive")
        else:
            st.error("😞 Negative")

        st.metric("Confidence", f"{result['score']:.1%}")
        st.progress(result["score"])

st.divider()

st.header("📄 Analyze many reviews")
st.write("Upload a CSV file with one review per row.")

uploaded_file = st.file_uploader("Choose a CSV file", type="csv")

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)

    st.write(f"Found **{len(df)} rows**. Here's a preview:")
    st.dataframe(df.head(10))

    # Pre-select a text column whose name contains "review" (so "review_id" numbers are skipped)
    columns = list(df.columns)
    default_index = next(
        (i for i, col in enumerate(columns) if "review" in col.lower() and df[col].dtype == object),
        0,
    )
    review_column = st.selectbox("Which column has the reviews?", columns, index=default_index)

    if st.button("Analyze all reviews"):
        # Ignore empty reviews (blank cells or cells with only spaces)
        texts = df[review_column].fillna("").astype(str).str.strip()
        results_df = df[texts != ""].copy()
        skipped = len(df) - len(results_df)

        if results_df.empty:
            st.warning("No reviews found in that column.")
        else:
            with st.spinner(f"Analyzing {len(results_df)} reviews..."):
                predictions = analyze_reviews(texts[texts != ""].tolist(), model)

            results_df["sentiment"] = [p["label"] for p in predictions]
            results_df["confidence"] = [round(p["score"] * 100, 1) for p in predictions]

            positive = (results_df["sentiment"] == "POSITIVE").sum()
            negative = (results_df["sentiment"] == "NEGATIVE").sum()

            col1, col2, col3 = st.columns(3)
            col1.metric("Total reviews", len(results_df))
            col2.metric("😊 Positive", positive)
            col3.metric("😞 Negative", negative)

            if skipped:
                st.caption(f"Skipped {skipped} empty review(s).")

            st.dataframe(
                results_df,
                column_config={"confidence": st.column_config.NumberColumn(format="%.1f%%")},
                hide_index=True,
            )
