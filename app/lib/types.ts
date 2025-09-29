
export interface Panel {
  id: number;
  type: 'master' | 'child';
  name: string;
  bypassState: 'ON' | 'OFF';
  relays: {
    CR1: boolean;
    CR2: boolean;
    CRBP: boolean;
  };
  status: 'running' | 'not_running';
  hasFault: boolean;
  isIsolated: boolean;
}

export interface GameState {
  panels: Panel[];
  gameActive: boolean;
  gameCompleted: boolean;
  score: number;
  startTime: Date | null;
  endTime: Date | null;
  currentScenario: GameScenario | null;
  userActions: UserAction[];
}

export interface GameScenario {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  faultPanels: number[];
  successConditions: {
    isolatedPanels: number[];
    runningPanels: number[];
    timeLimit?: number;
  };
}

export interface UserAction {
  timestamp: Date;
  panelId: number;
  action: 'bypass_on' | 'bypass_off' | 'reset' | 'start_game';
  previousState?: any;
  newState?: any;
}

export interface FeedbackMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export interface GameStats {
  totalActions: number;
  correctActions: number;
  timeElapsed: number;
  efficiency: number;
}
