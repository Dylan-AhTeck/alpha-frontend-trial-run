"""LangGraph chat agent with OpenAI GPT-4o-mini integration.

Processes conversation messages and returns AI responses.
"""

from __future__ import annotations

import os
from typing import Annotated, Sequence, TypedDict, Optional

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, add_messages
from langgraph.graph.message import MessagesState
from pydantic import SecretStr


class State(MessagesState):
    """The agent state.
    
    Extends MessagesState to handle conversation messages.
    """
    pass


async def call_model(state: State, config: RunnableConfig) -> dict:
    """Call OpenAI GPT-4o-mini with the conversation messages."""
    
    # Get API key and convert to SecretStr if present
    api_key = os.getenv("OPENAI_API_KEY")
    
    secret_key = SecretStr(api_key) if api_key is not None else None
    
    # Initialize OpenAI model with hardcoded model name
    model = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
        api_key=secret_key
    )
    
    # Get the current messages
    messages = state["messages"]
    
    # Call the model
    response = await model.ainvoke(messages)
    
    # Return the response message
    return {"messages": [response]}


# Define the graph
graph = (
    StateGraph(State)
    .add_node("call_model", call_model)
    .add_edge("__start__", "call_model")
    .compile(name="ChatAgent")
)
