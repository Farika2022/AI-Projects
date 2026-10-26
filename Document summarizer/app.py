import streamlit as st
from PyPDF2 import PdfReader
from transformers import pipeline

st.set_page_config(
    page_title="AI Document Summarizer",
    page_icon="📄",
    layout="wide",
)

st.title("📄 AI Document Summarizer")
st.write("Upload a PDF document and generate a concise summary.")

@st.cache_resource
def load_summarizer():
    return pipeline(
        "summarization",
        model="sshleifer/distilbart-cnn-12-6",
    )

def split_text(text, chunk_size=350):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks

def generate_summary(text):
    text_chunks = split_text(text)
    summaries = []
    

    for chunk in text_chunks:
        result = summarizer(
            chunk,
            max_length=150,
            min_length=30,
            do_sample=False,
            truncation=True
        )

        summaries.append(result[0]["summary_text"])

    return " ".join(summaries)

summarizer = load_summarizer()


uploaded_file = st.file_uploader(
    "Choose a PDF document",
    type=["pdf"],
)

if uploaded_file is not None:
    pdf_reader = PdfReader(uploaded_file)

    page_count = len(pdf_reader.pages)    

    document_text = ""

    for page in pdf_reader.pages:
        page_text = page.extract_text()

        if page_text:
            document_text += page_text + "\n"

    if document_text.strip():
        # Display document metadata
        st.info("✅ Text successfully extracted from PDF")
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("File Name", uploaded_file.name)
        with col2:
            st.metric("Pages", page_count)
        with col3:
            word_count = len(document_text.split())
            st.metric("Total Words", word_count)
        with col4:
            st.metric("Status", "Ready")
        
        st.divider()

        if st.button("Generate Summary", type="primary"):
            with st.spinner("Generating summary..."):
                summary = generate_summary(document_text)
            
            # Create tabs for summary and original text
            tab1, tab2 = st.tabs(["📄 AI Summary", "📋 Original Text"])
            
            with tab1:
                st.write(summary)
                
                # Display generation metrics
                st.divider()
                st.subheader("Summary Metrics")
                
                original_words = len(document_text.split())
                summary_words = len(summary.split())
                reduction_pct = round((1 - summary_words / original_words) * 100, 1)
                
                # Calculate number of chunks
                text_chunks = split_text(document_text)
                num_chunks = len(text_chunks)
                
                metric_col1, metric_col2, metric_col3, metric_col4 = st.columns(4)
                with metric_col1:
                    st.metric("Original Words", original_words)
                with metric_col2:
                    st.metric("Summary Words", summary_words)
                with metric_col3:
                    st.metric("Reduction", f"{reduction_pct}%")
                with metric_col4:
                    st.metric("Chunks Processed", num_chunks)
            
            with tab2:
                st.text_area("Original Text", document_text, height=400, disabled=True)
    else:
        st.error(
            "No readable text was found in this PDF. "
            "The document may be scanned or image-based."
        )