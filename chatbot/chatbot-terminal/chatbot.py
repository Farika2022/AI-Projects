# Chatbot with LangChain and Streamlit
# StrOutputParser is added to the langchain pipeline to provide a clean and natural output
#streamlit is used for UI interface for our chatbot. It provides a simple and interactive way to communicate with the chatbot.
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
import streamlit as st

st.title("Chatbot with LangChain and Streamlit")
input_txt = st.text_input("Enter your queries here...")

prompt = ChatPromptTemplate .from_messages(
    [
        ("system", "You are a helpful AI assistant."),
        ("user", "{input}"),
# {input} is a placeholder for the user input, which will be replaced with the actual input when the prompt is executed.
# Also, {input} is considered as a variable in the prompt template, which can be used to customize the prompt based on user input.
    ]
)

# Invoke the model 

llm = ChatOllama(model="qwen2.5-coder:7b", temperature=0.7)
output_parser = StrOutputParser()
chain= prompt | llm | output_parser
# chain is a main important component of the LangChain framework, which allows us to combine different components (like prompts, models, and output parsers) into a single pipeline. It takes the user input, passes it through the prompt template, then sends it to the model for processing, and finally parses the output using the output parser.

if input_txt:
    st.write(chain.invoke({"input": input_txt}))