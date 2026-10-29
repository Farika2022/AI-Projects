import os
from pathlib import Path
from io import BytesIO # to create memoey for audio , like buffer
import streamlit as st
from dotenv import load_dotenv
from groq import Groq
from gtts import gTTS # text to speech

st.set_page_config(
    page_title = " Voice assistant",
    page_icon=" 🤖",
    layout="centered"
)
# Find the .env file beside app.py
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)
#st.write("Env file exists:", env_path.is_file())
#st.write("API key loaded:", bool(os.getenv("GROQ_API_KEY")))
groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    st.error(f"GROQ_API_KEY was not found. Check this file: {env_path}")
    st.stop()

client = Groq(api_key=groq_api_key) # to interact with model

def generate_ai_response(question):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role":"system",
                "content":(
                    "You are a helpful AI voice assistant."
                    "Answer clearly and concisely using simple language."
                )
            },
            {
                "role": "user",
                "content":question
            }
        ],
        model="openai/gpt-oss-20b",
        temperature=0.3, # how creative model need to respond
        max_tokens=300
    )
    return chat_completion.choices[0].message.content
def convert_text_to_speech(text):
    audio_buffer=BytesIO()

    speech = gTTS(
        text=text,
        lang="en"
    )
    speech.write_to_fp(audio_buffer)
    audio_buffer.seek(0) # rewind from start
    audio_bytes = audio_buffer.getvalue()

    if not audio_bytes:
        raise ValueError("Generated audio is empty.")

    return audio_bytes

st.title("🤖 AI Voice Assistant")
st.write(
    "Ask a question using your voice,"
    "and the AI assistant will respond. "
)

audio_value=st.audio_input("Record your question")

if audio_value is not None:
    st.audio(audio_value)
    with st.spinner ("Converting speech to text..."): # convert voice into bites
        transcription = client.audio.transcriptions.create(
            file=(
                "recording.wav",
                audio_value.getvalue()
            ),
            model="whisper-large-v3-turbo",
            response_format="json",
            temperature=0.0
        )

        # to display the converted text
    transcribed_text=transcription.text.strip()
    st.subheader("You asked")

    if transcribed_text:
        st.write(transcribed_text)
        with st.spinner(" Genrating AI response...."):
            ai_response=generate_ai_response(
                transcribed_text
            )
        st.subheader("AI Assistant")
        st.write(ai_response)
        with st.spinner("Generating voice response..."):
            try:
                response_audio = convert_text_to_speech(ai_response)

                st.audio(
                    response_audio,
                    format="audio/mpeg"
                )

            except Exception as e:
                st.error(f"Could not generate audio: {e}")
    else:
        st.warning(
            "No speech was detected."
            "Please record your question again."
        )