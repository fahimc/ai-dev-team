export interface MemoryEntry {
  id: string;
  agentName: string;
  type: 'task' | 'observation' | 'thought' | 'action' | 'result';
  content: string;
  timestamp: Date;
  tags?: string[]; // Added tags for better filtering/context
}

export class ContextMemory {
  private memory: MemoryEntry[] = [];

  addEntry(entry: MemoryEntry): void {
    this.memory.push(entry);
  }

  getEntriesByAgent(agentName: string): MemoryEntry[] {
    return this.memory.filter(entry => entry.agentName === agentName);
  }

  getAllEntries(): MemoryEntry[] {
    return this.memory;
  }

  clearMemory(): void {
    this.memory = [];
  }

  // Optional: Add methods to query by type, tags, or time range if needed later
}

// Create a singleton instance
export const contextMemory = new ContextMemory();