# AI Chatbot Website

A chatbot with a browser-based UI, built with Streamlit (frontend) and LangChain + Claude (the AI layer). Portfolio project — swaps out the terminal chatbot version for a website version.

## What it demonstrates

- **Prompt template** — a reusable message structure (`ChatPromptTemplate`) instead of hand-building prompt strings every time
- **Chain** — piping steps together (`prompt | model | parser`) using LangChain Expression Language (LCEL)
- **Streamlit** — building a chat website with no HTML/CSS/JS
- Managing conversation state across a UI that re-runs its script on every click (`st.session_state`)

## Setup

1. Create a virtual environment and install dependencies:
   ```
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Add your API key:
   ```
   cp .env.example .env
   ```
   then paste your key into `.env` as `ANTHROPIC_API_KEY=sk-ant-...`

3. Run it:
   ```
   streamlit run app.py
   ```
   This opens a browser tab at `http://localhost:8501` with the chat UI.

## How it works

- **Prompt template** (`prompt` in `app.py`): defines a fixed system instruction plus a placeholder (`MessagesPlaceholder("history")`) that gets filled with the conversation so far on every request.
- **Chain** (`chain = prompt | model | StrOutputParser()`): the `|` operator pipes the output of each step into the next — build the prompt, call Claude, extract plain text from the response.
- **Session state**: Streamlit reruns the entire script top-to-bottom every time you interact with the page. `st.session_state.messages` is the one thing that survives between reruns, so it holds the chat history.

## Next steps (ideas to extend it)

- Add a sidebar to let the user pick a system prompt/persona
- Add streaming responses (`chain.stream()`) so replies appear word-by-word
- Deploy it publicly with Streamlit Community Cloud
