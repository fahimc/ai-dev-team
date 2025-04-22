# Autonomous AI Development Team Tool

## Project Summary

This project is a **Node.js-based autonomous development system** powered by **LangChain** and advanced **LLM APIs** (GPT-4, Gemini, Claude). It simulates a fully functioning AI software engineering team with role-based agents (Intern, Junior, Senior, Architect, etc.) that work collaboratively to build, test, and validate code in real-time.

Each agent has a unique responsibility and memory, is capable of reasoning, executing system-level actions, and evolving documentation. A web-based **chat-style UI** allows users to watch the development process unfold live, intervene when needed, and adjust project specs on the fly.

The system is designed to:
- Autonomously build real-world applications.
- Execute code, manage files, validate work, and self-correct errors.
- Maintain project memory and minimize context window costs with evolving documents and repo indexing.
- Follow a role-based hierarchy with architecture reviews, code validation, and error handling.
- Provide real-time feedback and control via a modern frontend interface.

---

## 1. System Architecture Overview

### Main Components

1. **Agent Framework (LangChain / LangGraph)**
   - Role-specific agents with:
     - Unique memory store (contextual memory)
     - Task list + execution history
     - Goal-driven planning and reflection
     - ReAct-style reasoning

2. **Task Manager & Scheduler**
   - Maintains task queues per role
   - Prioritizes, delegates, and reassigns tasks

3. **File & Code Execution Layer**
   - Uses Node.js (`fs`, `child_process`, sandboxed VM)
   - Agents can write, update, and execute code
   - Auto-run tests and log errors

4. **Repo Indexer & Context Optimizer**
   - Embedding-based code/document indexer (Chroma, Weaviate)
   - Evolving design documents reduce prompt size

5. **Validation and Review Agents**
   - Reviewer: Reviews commits
   - Architect: Validates architecture + reviews final code
   - Manager: Oversees progress and decisions

6. **Memory & Context Management**
   - Per-agent memory (JSON/db)
   - Shared evolving documents
   - Token-efficient summaries for long-term memory

7. **Error Handling & Auto-Fix**
   - Logs errors
   - Retry mechanism with improved reasoning
   - Auto-generated tests and patches

---

## 2. Technical Specification

### Tech Stack
- Node.js (App backend)
- LangChain (JS version)
- LLM APIs: GPT-4.1, Gemini 2.5 Pro, Claude 3.7
- Pinecone / Chroma (vector store)
- SQLite / Postgres (task & memory persistence)
- React + Tailwind (UI)

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
index.js
```

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

---

## 3. Phased Development Plan

### Phase 1: Core Agent System
- Setup Node.js + LangChain base
- Build base agent structure
- Execute simple commands (print, write files)

### Phase 2: File System Execution
- Implement code writing/updating
- Add execution layer with logging
- Basic retry logic on errors

### Phase 3: Memory + Context
- Implement per-agent memory
- Add shared evolving document context
- Summarize and embed for reuse

### Phase 4: Hierarchy & Validation
- Enable role-based task flow
- Add Architect + Reviewer layers
- Add MicroManager as coordinator

### Phase 5: Repo Indexing
- Add vector store integration
- Index evolving documents + code
- Use for prompt context optimization

### Phase 6: Auto-Fix + Testing
- Parse execution errors
- Suggest and apply fixes
- Auto-generate and run unit tests

### Phase 7: UI Integration
- React frontend with Tailwind UI
- Socket.io live communication
- Real-time logs, task list, and feedback

---

## 4. UI Design & Interaction

### Main Layout

1. **Agent Chat Window**
   - Chat thread per agent (Slack-style)
   - Color-coded, real-time updates
   - Typing indicators, reasoning logs

2. **Task Panel (Right)**
   - Shows tasks per agent
   - Task status, execution time, outcome

3. **Specs Panel (Left)**
   - JSON spec editor (project overview)
   - Real-time editable
   - "Apply Changes" button

4. **Terminal/Output View (Bottom)**
   - Execution logs
   - Code diffs, file changes
   - Error traces + auto-fix attempts

### Controls
- Pause/Resume Agents
- Manual task injection
- Spec edit + reflow logic
- Manual fix/review overrides

---

## 5. Backend Socket Events

```js
// Backend emits
socket.emit("agent_update", {
  agent: "Senior",
  message: "Implemented OAuth logic.",
  fileChanges: ["auth.js"],
  status: "complete",
});

// Frontend sends
socket.emit("user_override", {
  action: "pause_agent",
  agent: "Junior",
});
```

---

## 6. Future Enhancements
- GitHub integration for commit, PR review
- Voice assistant or CLI mode
- Authentication and workspace management
- Realtime chat with each agent (conversation-based control)
- Snapshot generation for project downloads

---

Let me know if you'd like a scaffolded repo or sample code block to begin implementation.

