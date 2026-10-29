import os
import re
import math
import wave
import array
import hashlib
from pathlib import Path
from io import BytesIO # to create memoey for audio , like buffer
import streamlit as st
from dotenv import load_dotenv
import groq
from groq import Groq
from gtts import gTTS, gTTSError # text to speech

MAX_AUDIO_BYTES = 25 * 1024 * 1024 # Groq upload limit
MIN_AUDIO_SECONDS = 0.5
SILENCE_RMS_THRESHOLD = 100 # 16-bit samples range from -32768 to 32767
# Whisper often "hears" these phrases in silence or background noise
WHISPER_SILENCE_PHRASES = {
    "you", "thank you", "thank you.", "thanks for watching", "thanks for watching!"
}

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
                    "You are a helpful AI voice assistant. "
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
        max_tokens=1024 # gpt-oss is a reasoning model; too few tokens can leave the answer empty
    )
    if not chat_completion.choices:
        return "", False

    choice = chat_completion.choices[0]
    answer = (choice.message.content or "").strip()
    truncated = choice.finish_reason == "length"
    return answer, truncated

def check_audio(audio_bytes):
    # Returns a problem message, or None if the recording looks usable
    if not audio_bytes or len(audio_bytes) < 1024:
        return "The recording is empty. Please record your question again."
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        return "The recording is too long. Please ask a shorter question."

    try:
        with wave.open(BytesIO(audio_bytes), "rb") as wav:
            channels = wav.getnchannels()
            sample_width = wav.getsampwidth()
            frame_rate = wav.getframerate()
            frames = wav.readframes(wav.getnframes())
    except (wave.Error, EOFError):
        return "Could not read the recording. Please try again."

    duration = len(frames) / (frame_rate * sample_width * channels)
    if duration < MIN_AUDIO_SECONDS:
        return "The recording is too short. Please hold the recorder a bit longer."

    if sample_width == 2: # 16-bit PCM, what the browser recorder produces
        samples = array.array("h", frames)
        if samples:
            rms = math.sqrt(sum(s * s for s in samples) / len(samples))
            if rms < SILENCE_RMS_THRESHOLD:
                return "Only silence was detected. Please speak closer to the microphone."
    return None

def is_real_speech(text):
    # Needs at least one letter/digit and must not be a known Whisper hallucination
    return bool(re.search(r"\w", text)) and text.lower() not in WHISPER_SILENCE_PHRASES

def friendly_groq_error(error):
    if isinstance(error, groq.AuthenticationError):
        return "Groq rejected the API key. Check GROQ_API_KEY in your .env file."
    if isinstance(error, groq.RateLimitError):
        return "Too many requests to Groq. Please wait a moment and try again."
    if isinstance(error, groq.APIConnectionError): # also covers timeouts
        return "Could not reach Groq. Check your internet connection and try again."
    if isinstance(error, groq.BadRequestError):
        return f"Groq could not process the request: {error.message}"
    if isinstance(error, groq.APIStatusError):
        return f"Groq service error ({error.status_code}). Please try again later."
    return f"Unexpected Groq error: {error}"

def clean_text_for_speech(text):
    # Remove Markdown symbols so they are not read aloud
    text = re.sub(r"^\s*[-•]\s+", "", text, flags=re.MULTILINE)
    return re.sub(r"[*_#`>~|]", "", text).strip()

def convert_text_to_speech(text):
    audio_buffer=BytesIO()

    text = clean_text_for_speech(text)
    if not re.search(r"\w", text):
        raise ValueError("There is no speakable text in the response.")

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
st.caption("If recording doesn't start, allow microphone access in your browser.")

if audio_value is not None:
    st.audio(audio_value)
    audio_bytes = audio_value.getvalue()
    audio_hash = hashlib.sha1(audio_bytes).hexdigest()

    # Streamlit reruns the script on every interaction, so reuse results for the same recording
    result = st.session_state.get("last_result")
    if not result or result["hash"] != audio_hash:
        audio_problem = check_audio(audio_bytes)
        if audio_problem:
            st.warning(audio_problem)
            st.stop()

        with st.spinner ("Converting speech to text..."): # convert voice into bites
            try:
                transcription = client.audio.transcriptions.create(
                    file=(
                        "recording.wav",
                        audio_bytes
                    ),
                    model="whisper-large-v3-turbo",
                    response_format="json",
                    temperature=0.0
                )
            except groq.APIError as e:
                st.error(friendly_groq_error(e))
                st.stop()

        transcribed_text = (transcription.text or "").strip()
        result = {
            "hash": audio_hash,
            "text": transcribed_text if is_real_speech(transcribed_text) else "",
            "response": "",
            "truncated": False,
            "audio": None,
            "audio_error": None
        }

        if result["text"]:
            with st.spinner("Generating AI response...."):
                try:
                    result["response"], result["truncated"] = generate_ai_response(
                        result["text"]
                    )
                except groq.APIError as e:
                    st.error(friendly_groq_error(e))
                    st.stop()

        if result["response"]:
            with st.spinner("Generating voice response..."):
                try:
                    result["audio"] = convert_text_to_speech(result["response"])
                except gTTSError as e:
                    result["audio_error"] = f"The voice service is unavailable right now ({e}). The text answer is shown above."
                except Exception as e:
                    result["audio_error"] = f"Could not generate audio: {e}"

        st.session_state["last_result"] = result

    # to display the converted text
    st.subheader("You asked")

    if result["text"]:
        st.write(result["text"])
        st.subheader("AI Assistant")

        if result["response"]:
            st.write(result["response"])
            if result["truncated"]:
                st.caption("The answer was cut short because it reached the length limit.")

            if result["audio"]:
                st.audio(
                    result["audio"],
                    format="audio/mpeg"
                )
            else:
                st.error(result["audio_error"])
        else:
            st.warning(
                "The assistant returned an empty answer. "
                "Please record your question again."
            )
    else:
        st.warning(
            "No speech was detected. "
            "Please record your question again."
        )

        ''' 
        TEST CASES
        In Voice assistant application
          - identify important edge cases and failure scenario related to:
            -microphone recording, 
            -empty or silent audio, 
            -speech transcription, 
            -Groq API failures, 
            -empty AI responses, 
            -text to speech errors.
        Do not rewrite the entire application.

        
        '''