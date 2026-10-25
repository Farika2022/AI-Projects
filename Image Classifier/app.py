import streamlit as st
from PIL import Image # to handle image files
from transformers import pipeline # to use pre-trained models
st.set_page_config(page_title="Image Classifier", page_icon="📷", layout="centered")

@st.cache_resource # Cache the model loading to avoid reloading on every run
def load_model():
    # Load the pre-trained image classification model
     return pipeline(task="image-classification", model="google/vit-base-patch16-224")
classifier = load_model()

st.title("AI Image Classifier")
st.write("Upload an image and let the AI classify it for you!")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])
if uploaded_file is not None:
    try:
        image = Image.open(uploaded_file).convert("RGB") # Convert image to RGB format
        st.image(image, caption='Uploaded Image.', use_column_width=True)

        with st.spinner('Classifying...'):
            predictions = classifier(image,top_k=3) # Get top 3 predictions
        st.subheader ("Top Predictions:")
        for prediction in predictions:
            label = prediction['label']
            score = prediction['score']*100
            st.write(f"**{label}**")
            st.progress(float(prediction['score'])) # Show progress bar for confidence score
            st.caption(f"Confidence: {score:.2f}%")
    except Exception as e:
        st.error(f"Error processing the image: {e}")
        st.exception(e)
else:
    st.info("Please upload an image file to classify.")