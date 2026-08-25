# app.py — a chatbot website using Streamlit (UI) + LangChain (Claude API glue)
#
# The three concepts you asked about, in this file:
# - Prompt template: `prompt` below — a reusable message shape with a
#   placeholder ("history") that gets filled in on every request.
# - Chain: `chain = prompt | model | StrOutputParser()` — pipes the prompt
#   into the model, then parses the model's reply down to plain text.
# - Streamlit UI: everything using `st.*` — turns this script into a
#   web page with a chat box, no HTML/CSS/JS written by hand.

import os
import streamlit as st
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

load_dotenv()

st.set_page_config(page_title="AI Chatbot", page_icon="💬")
st.title("💬 AI Chatbot")
st.caption("Built with Streamlit + LangChain + Claude")

# --- Prompt template ---
# "system" sets the assistant's behavior once.
# MessagesPlaceholder("history") is where the full conversation gets
# inserted at request time — LangChain fills this in for us.
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful, concise assistant."),
        MessagesPlaceholder(variable_name="history"),
    ]
)

model = ChatAnthropic(
    model="claude-sonnet-4-5",
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
)

# --- Chain ---
# The `|` pipes output of one step into the next:
# prompt (builds the message list) -> model (calls Claude) ->
# StrOutputParser (extracts plain text from the response object)
chain = prompt | model | StrOutputParser()

# --- Conversation memory ---
# Streamlit re-runs this whole script on every interaction, so anything
# that must survive between messages (like chat history) has to live in
# st.session_state, not a plain variable.
if "messages" not in st.session_state:
    st.session_state.messages = []  # list of HumanMessage / AIMessage

# Re-render every past message so the chat log stays visible after each rerun
for msg in st.session_state.messages:
    role = "user" if isinstance(msg, HumanMessage) else "assistant"
    with st.chat_message(role):
        st.markdown(msg.content)

# Chat input box, pinned to the bottom of the page
user_input = st.chat_input("Type a message...")

if user_input:
    st.session_state.messages.append(HumanMessage(content=user_input))
    with st.chat_message("user"):
        st.markdown(user_input)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            reply = chain.invoke({"history": st.session_state.messages})
            st.markdown(reply)

    st.session_state.messages.append(AIMessage(content=reply))
