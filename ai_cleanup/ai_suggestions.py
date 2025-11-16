import os
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

def suggest_cleanup_actions(analysis_result: dict):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.4)

    prompt = ChatPromptTemplate.from_template("""
You are an AI cleanup assistant.
Given this storage scan result, generate a concise plan:
- Which images can be deleted or archived?
- Mention reasoning for each.

Scan result:
{result}
    """)

    final_prompt = prompt.format_messages(result=str(analysis_result))
    response = llm.invoke(final_prompt)
    return response.content.strip()
