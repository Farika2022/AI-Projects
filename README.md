# AI Projects

This is a collection of my AI projects. Each project is a small app that uses AI to solve one real problem, like summarizing a PDF, answering questions with your voice, or sorting customer support tickets.

Most projects are built with **Python** and **Streamlit** (a simple way to make a web page with Python). The bigger projects use **React** for the website and a separate backend.

## Projects at a glance

| # | Project | What it does | Main tools |
|---|---|---|---|
| 1 | [Chatbot](#1-chatbot) | Chat with an AI that runs on your own computer | LangChain, Ollama, Streamlit |
| 2 | [Feedback Analyzer](#2-feedback-analyzer) | Tells if customer reviews are positive or negative | Hugging Face, Streamlit, pandas |
| 3 | [Image Classifier](#3-image-classifier) | Tells you what is in a photo | Hugging Face, Streamlit |
| 4 | [Document Summarizer](#4-document-summarizer) | Makes a short summary of a PDF | Hugging Face, Streamlit |
| 5 | [Voice Assistant](#5-voice-assistant) | Ask a question with your voice and hear the answer | Groq, Whisper, gTTS, Streamlit |
| 6 | [RAG Chatbot](#6-rag-chatbot) | Ask questions about your own PDF | Groq, FAISS, Sentence Transformers, Streamlit |
| 7 | [SmartDesk](#7-smartdesk) | Customer support desk where AI sorts tickets and writes replies | React, .NET, PostgreSQL, Groq |
| 8 | [Guess the Spot](#8-guess-the-spot) | 3D globe geography quiz game | React, three.js, Tailwind |
| 9 | [Gen AI Public Redesign](#9-gen-ai-public-redesign) | Thesis project: redesign public places by editing photos with AI | React, FLUX AI models, Vercel |

---

## 1. Chatbot

📁 `chatbot/chatbot-terminal`

**What it is:** A simple chatbot website. You type a question and the AI answers.

**Why I built it:** To learn the basics of **LangChain**, a popular library for building AI apps.

**How it works:**
- The question goes into a **prompt template** (a ready-made message with a space for your question).
- LangChain sends it to an AI model (`qwen2.5-coder`) that runs **on your own computer** using Ollama. No internet or API key needed.
- The answer is cleaned and shown on the page.

**Run it:**
```bash
ollama pull qwen2.5-coder:7b
pip install streamlit langchain-core langchain-ollama
streamlit run chatbot.py
```

---

## 2. Feedback Analyzer

📁 `Feedback analyzer`

**What it is:** A tool that reads customer reviews and says if each one is **positive 😊** or **negative 😞**, with a confidence score.

**Why it is useful:** A business can quickly see how customers feel without reading hundreds of reviews by hand.

**Features:**
- Paste one review and check it.
- Upload a **CSV file** with many reviews and check them all at once.
- See the total count of positive and negative reviews.
- Empty rows are skipped automatically.
- A sample file (`sample_reviews.csv`) is included for testing.

**AI model:** `distilbert-base-uncased-finetuned-sst-2-english` (a small, fast sentiment model from Hugging Face).

**Run it:**
```bash
pip install -r requirements.txt
streamlit run app.py
```

---

## 3. Image Classifier

📁 `Image Classifier`

**What it is:** Upload a photo, and the AI tells you what is in it (for example "golden retriever" or "coffee mug").

**Features:**
- Accepts JPG and PNG images.
- Shows the **top 3 guesses** with a confidence bar for each.

**AI model:** Google's **Vision Transformer** (`google/vit-base-patch16-224`), which knows 1,000 everyday objects and animals.

**Run it:**
```bash
pip install -r requirement.txt
streamlit run app.py
```

---

## 4. Document Summarizer

📁 `Document summarizer`

**What it is:** Upload a PDF, and the AI writes a short summary of it.

**Why it is useful:** Saves time when you need the main points of a long document.

**How it works:**
1. Reads all the text from the PDF.
2. Splits the text into smaller parts, because the AI can only read a limited amount at once.
3. Summarizes each part and joins the summaries together.

**Features:**
- Shows file name, page count and word count.
- Shows how much shorter the summary is (for example "85% reduction").
- Lets you view the original text next to the summary.
- Warns you if the PDF is scanned (only pictures, no real text).

**AI model:** `sshleifer/distilbart-cnn-12-6` (a summarization model from Hugging Face).

**Run it:**
```bash
pip install -r requirement.txt
streamlit run app.py
```

---

## 5. Voice Assistant

📁 `Voice assistant`

**What it is:** Ask a question **with your voice**. The app writes down what you said, gets an answer from AI, and **reads the answer out loud**.

**How it works:**
1. 🎤 You record your question in the browser.
2. 📝 **Whisper** (on Groq) turns your speech into text.
3. 🤖 An AI model (`gpt-oss-20b` on Groq) writes the answer.
4. 🔊 **gTTS** (Google Text-to-Speech) turns the answer into audio.

**Handles common problems:**
- Recordings that are empty, too short, too long or silent.
- When Whisper "hears" words in silence (for example "Thank you.").
- Groq errors: wrong API key, too many requests, no internet.
- Empty or cut-off AI answers.
- Text-to-speech failures (the text answer is still shown).

**Run it:**
1. Get a free API key from [Groq](https://console.groq.com).
2. Create a `.env` file with `GROQ_API_KEY=your_key_here`.
3. Then:
```bash
pip install -r requirement.txt
streamlit run app.py
```

---

## 6. RAG Chatbot

📁 `RAG chatbot`

**What it is:** Upload a PDF and **chat with it**. Ask any question, and the AI answers using **only** what is written in your document.

**What is RAG?** RAG means *Retrieval-Augmented Generation*. Instead of letting the AI guess, the app first **finds the right parts of your document**, then gives only those parts to the AI to write the answer. This helps stop the AI from making things up.

**How it works:**
1. Reads the PDF and splits the text into small overlapping pieces.
2. Turns each piece into numbers (called **embeddings**) that capture its meaning.
3. Saves them in **FAISS**, a fast search index.
4. When you ask a question, it finds the 3 most related pieces.
5. Sends those pieces and your question to an AI model on Groq (`llama-3.3-70b-versatile`).
6. If the answer is not in the document, the AI says so instead of guessing.

**Features:**
- Chat-style layout with message history.
- Chat history clears when you upload a new file.

**Run it:**
1. Copy `.env.example` to `.env` and add your `GROQ_API_KEY`.
2. Then:
```bash
pip install -r requirement.txt
streamlit run app.py
```

---

## 7. SmartDesk

📁 `SmartDesk app/smartdisk`

**What it is:** A full **customer support desk** for a company that makes electric walkers and wheelchairs. Customers send support tickets, and **AI sorts them automatically**.

**What the AI does for each new ticket:**
- Sets the **urgency**: HIGH (safety risk), MEDIUM, or LOW.
- Picks a **category**: hardware, software, billing, shipping, or other.
- Writes a short, friendly **suggested reply** for the support team.

If the AI is not available, the ticket is still saved with default values, so nothing is lost.

**Features:**
- Login with secure tokens (JWT).
- See all tickets with their urgency, status (open or resolved) and summary numbers.
- Create new tickets with a form.

**Tech stack:**
- **Frontend:** React + TypeScript + Vite, hosted on Vercel. Storybook for building components.
- **Backend:** .NET Web API (C#), hosted on Railway with Docker.
- **Database:** PostgreSQL (Neon) with Entity Framework.
- **AI:** Groq (`gpt-oss-20b`).

---

## 8. Guess the Spot

📁 `Guess the spot/guess-the-spot` · 🌐 **Live demo:** [guesswith.vercel.app](https://guesswith.vercel.app)

**What it is:** A fun **3D geography game**. Spin the globe, click a famous landmark, and answer a question about its photo before time runs out.

**Features:**
- A 3D globe you can drag and zoom.
- 20 famous landmarks in 20 countries.
- Two game modes:
  - **Quiz:** 15 seconds to answer.
  - **Jigsaw:** fix a mixed-up 3×3 photo puzzle, then answer.
- A random funny nickname for each player (like "Wobbly Penguin").
- A results screen with your score, time and confetti 🎉.
- Landmark photos come live from Wikipedia.

**Tech stack:** React, TypeScript, Vite, react-three-fiber (three.js), Tailwind CSS, Vercel.

**Run it:**
```bash
npm install
npm run dev
```

More details are in the project's own [README](Guess%20the%20spot/guess-the-spot/README.md).

---

## 9. Gen AI Public Redesign

📁 `Gen AI public redesign/PublicRedesign`

**What it is:** My **master's thesis project** at Aalborg University (2025/2026), made with Cody Jackson and Ma Shalah. The title is *"Optimizing Input in Generative AI Powered Public Redesign"*.

**The idea:** People can take a photo of a public place (like a street or a park) and use AI to show how they would like it to look. We studied **which way of giving instructions to the AI works best** for regular people.

**Ways to tell the AI what to change:**
- ✍️ Type a text description.
- 🎙️ Speak your idea.
- 🖌️ Paint over the area you want to change.
- 🧩 Drag and drop objects onto the photo.

**Features:**
- Before/after slider to compare the original and edited photo.
- Gallery of edited designs.
- User accounts, an admin page, and a survey for study participants.

**AI models:** Black Forest Labs **FLUX.2** and **FLUX.1 Fill** for image editing.

**Tech stack:** React, TypeScript, Vite, Tailwind, Vercel, and a Node.js backend on an Ubuntu server.

The full report (PDF) and setup steps are in the project's own [README](Gen%20AI%20public%20redesign/PublicRedesign/README.md).

---

## General setup for the Python projects

1. Install **Python 3.10 or newer**.
2. Go into the project folder:
   ```bash
   cd "Voice assistant"
   ```
3. Create and turn on a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
4. Install the packages and run the app (see each project above).
5. The app opens in your browser at `http://localhost:8501`.

> **Note:** The first time you run a Hugging Face project, it downloads the AI model. This can take a few minutes.

> **Keep your keys safe:** Never share or upload your `.env` file. It holds your private API keys.
