export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  
  constructor() {
    console.log('Initializing Task Manager');
  }
  
  createTask(
    title: string,
    description: string,
    assignedTo: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    dependencies: string[] = []
  ): Task {
    const id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    
    const task: Task = {
      id,
      title,
      description,
      assignedTo,
      status: 'pending',
      priority,
      dependencies,
      createdAt: now,
      updatedAt: now,
    };
    
    this.tasks.set(id, task);
    console.log(`Created task: ${title} (${id}) assigned to ${assignedTo}`);
    
    return task;
  }
  
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }
  
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  getTasksByAgent(agentName: string): Task[] {
    return this.getAllTasks().filter(task => task.assignedTo === agentName);
  }
  
  updateTaskStatus(id: string, status: 'pending' | 'in-progress' | 'completed' | 'failed'): Task | undefined {
    const task = this.tasks.get(id);
    
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      this.tasks.set(id, task);
      console.log(`Updated task ${id} status to ${status}`);
      return task;
    }
    
    return undefined;
  }
  
  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }
  
  getNextTasks(): Task[] {
    // Get tasks that are pending and have all dependencies completed
    return this.getAllTasks().filter(task => {
      if (task.status !== 'pending') {
        return false;
      }
      
      // Check if all dependencies are completed
      return task.dependencies.every(depId => {
        const depTask = this.tasks.get(depId);
        return depTask && depTask.status === 'completed';
      });
    });
  }
}

// Create a singleton instance
export const taskManager = new TaskManager();
