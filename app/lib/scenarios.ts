
import { GameScenario } from './types';

export const defaultScenarios: GameScenario[] = [
  {
    id: 'scenario-1',
    name: 'Single Panel Fault',
    description: 'A single conveyor panel has developed a fault. Isolate it to restore system operation.',
    difficulty: 'beginner',
    faultPanels: [7],
    successConditions: {
      isolatedPanels: [7],
      runningPanels: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
      timeLimit: 300
    }
  },
  {
    id: 'scenario-2',
    name: 'Dual Panel Failure',
    description: 'Two conveyor panels have faulted simultaneously. Quick isolation is critical.',
    difficulty: 'intermediate',
    faultPanels: [3, 12],
    successConditions: {
      isolatedPanels: [3, 12],
      runningPanels: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15],
      timeLimit: 240
    }
  },
  {
    id: 'scenario-3',
    name: 'Master Panel Integration',
    description: 'Multiple panels including master have issues. Advanced troubleshooting required.',
    difficulty: 'advanced',
    faultPanels: [0, 5, 11],
    successConditions: {
      isolatedPanels: [0, 5, 11],
      runningPanels: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15],
      timeLimit: 180
    }
  },
  {
    id: 'scenario-4',
    name: 'Sequential Cascade',
    description: 'Adjacent panels failing in sequence. Prevent system-wide shutdown.',
    difficulty: 'intermediate',
    faultPanels: [8, 9, 10],
    successConditions: {
      isolatedPanels: [8, 9, 10],
      runningPanels: [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 13, 14, 15],
      timeLimit: 200
    }
  },
  {
    id: 'scenario-5',
    name: 'Random Multi-Fault',
    description: 'Multiple random faults across the system. Test your diagnostic skills.',
    difficulty: 'advanced',
    faultPanels: [2, 6, 13, 15],
    successConditions: {
      isolatedPanels: [2, 6, 13, 15],
      runningPanels: [0, 1, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14],
      timeLimit: 150
    }
  }
];

export function getRandomScenario(difficulty?: 'beginner' | 'intermediate' | 'advanced'): GameScenario {
  let availableScenarios = defaultScenarios;
  
  if (difficulty) {
    availableScenarios = defaultScenarios.filter(s => s.difficulty === difficulty);
  }
  
  const randomIndex = Math.floor(Math.random() * availableScenarios.length);
  return availableScenarios[randomIndex];
}

export function createRandomScenario(): GameScenario {
  const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
  const selectedDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  
  let numFaults: number;
  let timeLimit: number;
  
  switch (selectedDifficulty) {
    case 'beginner':
      numFaults = 1;
      timeLimit = 300;
      break;
    case 'intermediate':
      numFaults = Math.floor(Math.random() * 2) + 2; // 2-3 faults
      timeLimit = 240;
      break;
    case 'advanced':
      numFaults = Math.floor(Math.random() * 3) + 3; // 3-5 faults
      timeLimit = 180;
      break;
  }
  
  // Randomly select fault panels
  const faultPanels: number[] = [];
  while (faultPanels.length < numFaults) {
    const randomPanel = Math.floor(Math.random() * 16);
    if (!faultPanels.includes(randomPanel)) {
      faultPanels.push(randomPanel);
    }
  }
  
  const runningPanels = Array.from({length: 16}, (_, i) => i).filter(id => !faultPanels.includes(id));
  
  return {
    id: `random-${Date.now()}`,
    name: `Random ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Challenge`,
    description: `${numFaults} random fault${numFaults > 1 ? 's' : ''} to isolate. You have ${timeLimit/60} minutes.`,
    difficulty: selectedDifficulty,
    faultPanels,
    successConditions: {
      isolatedPanels: faultPanels,
      runningPanels,
      timeLimit
    }
  };
}
