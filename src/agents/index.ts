import { BaseAgent } from './baseAgent';
import { InternAgent } from './internAgent';
import { JuniorAgent } from './juniorAgent';
import { SeniorAgent } from './seniorAgent';
import { ArchitectAgent } from './architectAgent';
import { MicroManagerAgent } from './microManagerAgent';

// Create a registry of all agents
const agents: Record<string, BaseAgent> = {
  intern: new InternAgent(),
  junior: new JuniorAgent(),
  senior: new SeniorAgent(),
  architect: new ArchitectAgent(),
  microManager: new MicroManagerAgent(),
};

export function setupAgentSystem() {
  console.log('Setting up agent system...');
  
  // Initialize all agents
  Object.values(agents).forEach(agent => {
    agent.initialize();
  });
  
  console.log('Agent system initialized');
}

export function getAgent(name: string): BaseAgent | undefined {
  return agents[name];
}

export function getAllAgents(): BaseAgent[] {
  return Object.values(agents);
}

export { BaseAgent } from './baseAgent';
export { InternAgent } from './internAgent';
export { JuniorAgent } from './juniorAgent';
export { SeniorAgent } from './seniorAgent';
export { ArchitectAgent } from './architectAgent';
export { MicroManagerAgent } from './microManagerAgent';
