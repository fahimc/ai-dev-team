# Project Architecture Overview

This document outlines the current architecture of the Autonomous AI Development Team Tool based on the project specification and existing codebase. This document should be continuously updated as the project evolves.

## Project Summary

This project is a Node.js-based autonomous development system powered by LangChain and advanced LLM APIs (GPT-4, Gemini, Claude). It simulates a fully functioning AI software engineering team with role-based agents that work collaboratively to build, test, and validate code in real-time. A web-based chat-style UI allows users to watch the development process unfold live, intervene when needed, and adjust project specs on the fly.

## Main Components

1.  **Agent Framework (LangChain / LangGraph)**
    *   Role-specific agents with unique memory, task lists, execution history, goal-driven planning, reflection, and ReAct-style reasoning.
2.  **Task Manager & Scheduler**
    *   Maintains task queues per role, prioritizes, delegates, and reassigns tasks.
3.  **File & Code Execution Layer**
    *   Uses Node.js (`fs`, `child_process`, sandboxed VM) for agents to write, update, and execute code. Includes auto-run tests and error logging.
4.  **Repo Indexer & Context Optimizer**
    *   Embedding-based code/document indexer (Chroma, Weaviate). Evolving design documents reduce prompt size.
5.  **Validation and Review Agents**
    *   Reviewer: Reviews commits.
    *   Architect: Validates architecture + reviews final code.
    *   Manager: Oversees progress and decisions.
6.  **Memory & Context Management**
    *   Per-agent memory (JSON/db), shared evolving documents, token-efficient summaries for long-term memory.
7.  **Error Handling & Auto-Fix**
    *   Logs errors, retry mechanism with improved reasoning, auto-generated tests and patches.

## Technical Specification

### Tech Stack

*   Node.js (App backend)
*   LangChain (JS version)
*   LLM APIs: GPT-4.1, Gemini 2.5 Pro, Claude 3.7
*   Pinecone / Chroma (vector store)
*   SQLite / Postgres (task & memory persistence)
*   React + Tailwind (UI)

### File Structure

```
/agents/
  microManager.js
  intern.js
  junior.js
  senior.js
  architect.js
  researcher.js
/tasks/
  index.js
  taskScheduler.js
/memory/
  contextMemory.js
  vectorStore.js
/codebase/
  ... (agent-generated code)
/utils/
  execRunner.js
  codeValidator.js
  errorHandler.js
  fileManager.js
index.js
```
*(Note: The actual file structure in the workspace includes TypeScript files in `src/` and test files in `tests/`, which aligns with this conceptual structure.)*

### Agent Responsibilities

| Role        | Model                  | Responsibilities                            |
|-------------|------------------------|---------------------------------------------|
| Intern      | Gemini Flash 2.5       | Simple file creation, documentation         |
| Junior      | Gemini Flash 2.5       | Implement basic features                    |
| Mid Level   | GPT-4.1                | Handle complex logic                        |
| Senior      | Gemini 2.5 Pro         | Integrate systems, refactor code            |
| Architect   | Gemini 2.5 Pro         | Design architecture, validate implementations|
| Researcher  | Gemini Flash 2.5       | Research libraries and technical approaches |
| Manager     | Gemini 2.5 Pro         | Oversee and validate all agents/tasks       |
| Designer    | Claude 3.7 Sonnet      | Generate UI designs and frontend structure  |

## Phases Completed (Based on project-spec.md)

*   **Phase 1: Core Agent System**
    *   Setup Node.js + LangChain base
    *   Build base agent structure
    *   Execute simple commands (print, write files)
*   **Phase 2: File System Execution**
    *   Implement code writing/updating
    *   Add execution layer with logging
    *   Basic retry logic on errors

## Tests Written

*   `tests/agents/baseAgent.test.ts`: Covers core `BaseAgent` functionality.
*   `tests/utils/execRunner.test.ts`: Covers command execution and logging.
*   `tests/utils/fileManager.test.ts`: Covers file creation, updating, reading, and deletion.
*   `tests/utils/errorHandler.test.ts`: Attempted to write tests for basic retry logic, but encountered issues reading the source file `src/utils/errorHandler.ts`.

## Outstanding Tasks

*   Fix tests in `tests/utils/errorHandler.test.ts` (requires content of `src/utils/errorHandler.ts`).
*   Write tests for remaining phases (Phase 3 onwards).
*   Continuously update this `architecture.md` file.