import './style.css';
import { setupAgentSystem } from './agents';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
    <h1>AI Development Team Simulator</h1>
    <div class="agent-system">
      <div class="agent-output" id="agent-output">
        <h2>Agent Output</h2>
        <div class="output-content" id="output-content"></div>
      </div>
      <div class="control-panel">
        <h2>Control Panel</h2>
        <button id="run-agents">Run Agents</button>
        <button id="clear-output">Clear Output</button>
      </div>
    </div>
  </div>
`;

// Setup the agent system
setupAgentSystem();

// Add event listeners
document.querySelector<HTMLButtonElement>('#run-agents')!.addEventListener('click', async () => {
  const outputContent = document.querySelector<HTMLDivElement>('#output-content')!;
  outputContent.innerHTML += '<div class="message">Starting agent system...</div>';
  
  try {
    const result = await fetch('/api/run-agents', { method: 'POST' });
    const data = await result.json();
    outputContent.innerHTML += `<div class="message success">${data.message}</div>`;
  } catch (error) {
    outputContent.innerHTML += `<div class="message error">Error: ${error instanceof Error ? error.message : String(error)}</div>`;
  }
});

document.querySelector<HTMLButtonElement>('#clear-output')!.addEventListener('click', () => {
  document.querySelector<HTMLDivElement>('#output-content')!.innerHTML = '';
});
