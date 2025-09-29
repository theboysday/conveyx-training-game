
import { Panel, GameState, GameScenario, UserAction, FeedbackMessage } from './types';

export class ConveyXGameEngine {
  private gameState: GameState;
  private feedbackCallbacks: ((feedback: FeedbackMessage) => void)[] = [];

  constructor() {
    this.gameState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    const panels: Panel[] = [];
    
    // Create Master Panel (ID: 0)
    panels.push({
      id: 0,
      type: 'master',
      name: 'Master Panel',
      bypassState: 'OFF',
      relays: { CR1: false, CR2: false, CRBP: false },
      status: 'not_running',
      hasFault: false,
      isIsolated: false
    });

    // Create 15 Child Panels (IDs: 1-15)
    for (let i = 1; i <= 15; i++) {
      panels.push({
        id: i,
        type: 'child',
        name: `Panel ${i}`,
        bypassState: 'OFF',
        relays: { CR1: false, CR2: false, CRBP: false },
        status: 'not_running',
        hasFault: false,
        isIsolated: false
      });
    }

    return {
      panels,
      gameActive: false,
      gameCompleted: false,
      score: 0,
      startTime: null,
      endTime: null,
      currentScenario: null,
      userActions: []
    };
  }

  public startGame(scenario: GameScenario): void {
    this.gameState = this.initializeGameState();
    this.gameState.gameActive = true;
    this.gameState.startTime = new Date();
    this.gameState.currentScenario = scenario;
    
    // Apply faults to specified panels
    scenario.faultPanels.forEach(panelId => {
      const panel = this.gameState.panels.find(p => p.id === panelId);
      if (panel) {
        panel.hasFault = true;
      }
    });

    // All panels start as "not running" (entire zone dead)
    this.updateSystemState();
    
    this.addFeedback({
      type: 'info',
      title: 'Game Started',
      message: `Scenario: ${scenario.name}. Zone is dead - isolate the fault by toggling bypasses.`,
      timestamp: new Date()
    });
  }

  public toggleBypass(panelId: number): boolean {
    if (!this.gameState.gameActive || this.gameState.gameCompleted) {
      return false;
    }

    const panel = this.gameState.panels.find(p => p.id === panelId);
    if (!panel) return false;

    const previousState = { ...panel };
    panel.bypassState = panel.bypassState === 'ON' ? 'OFF' : 'ON';
    
    this.logUserAction({
      timestamp: new Date(),
      panelId,
      action: panel.bypassState === 'ON' ? 'bypass_on' : 'bypass_off',
      previousState: previousState.bypassState,
      newState: panel.bypassState
    });

    this.updateSystemState();
    this.checkGameCompletion();
    
    return true;
  }

  private updateSystemState(): void {
    // Update relay states based on bypass positions and faults
    this.gameState.panels.forEach(panel => {
      // CR-BP (Bypass Relay) - ON when bypass is engaged
      panel.relays.CRBP = panel.bypassState === 'ON';
      
      // CR-1 and CR-2 logic (simplified ConveyX logic)
      if (panel.hasFault && panel.bypassState === 'OFF') {
        // Fault present and not bypassed - relays trip
        panel.relays.CR1 = false;
        panel.relays.CR2 = false;
        panel.status = 'not_running';
        panel.isIsolated = false;
      } else if (panel.hasFault && panel.bypassState === 'ON') {
        // Fault present but bypassed - panel isolated but system can run
        panel.relays.CR1 = true;
        panel.relays.CR2 = true;
        panel.status = 'not_running';
        panel.isIsolated = true;
      } else if (!panel.hasFault) {
        // No fault - normal operation
        panel.relays.CR1 = true;
        panel.relays.CR2 = true;
        panel.status = 'running';
        panel.isIsolated = false;
      }
    });

    // System-wide status logic
    const faultPanels = this.gameState.panels.filter(p => p.hasFault);
    const isolatedFaultPanels = faultPanels.filter(p => p.isIsolated);
    const systemCanRun = faultPanels.length === isolatedFaultPanels.length;

    if (systemCanRun) {
      // System can run - energize all non-faulty panels
      this.gameState.panels.forEach(panel => {
        if (!panel.hasFault) {
          panel.status = 'running';
        }
      });
    } else {
      // System dead - all panels down
      this.gameState.panels.forEach(panel => {
        if (!panel.isIsolated) {
          panel.status = 'not_running';
        }
      });
    }
  }

  private checkGameCompletion(): void {
    if (!this.gameState.currentScenario) return;

    const scenario = this.gameState.currentScenario;
    const faultPanels = this.gameState.panels.filter(p => p.hasFault);
    const isolatedFaults = faultPanels.filter(p => p.isIsolated);
    const runningPanels = this.gameState.panels.filter(p => p.status === 'running');

    // Check if all faults are isolated and system is running
    const allFaultsIsolated = faultPanels.length === isolatedFaults.length && faultPanels.length > 0;
    const systemRunning = runningPanels.length > 0;

    if (allFaultsIsolated && systemRunning) {
      this.completeGame(true);
    }
  }

  private completeGame(success: boolean): void {
    this.gameState.gameActive = false;
    this.gameState.gameCompleted = true;
    this.gameState.endTime = new Date();

    if (success) {
      const timeElapsed = this.gameState.endTime.getTime() - (this.gameState.startTime?.getTime() || 0);
      const baseScore = 1000;
      const timeBonus = Math.max(0, 300 - Math.floor(timeElapsed / 1000)) * 10;
      const actionPenalty = Math.max(0, (this.gameState.userActions.length - 10) * 5);
      
      this.gameState.score = Math.max(100, baseScore + timeBonus - actionPenalty);
      
      this.addFeedback({
        type: 'success',
        title: 'Mission Accomplished!',
        message: `Fault successfully isolated! Score: ${this.gameState.score}`,
        timestamp: new Date()
      });
    } else {
      this.addFeedback({
        type: 'error',
        title: 'Mission Failed',
        message: 'Time limit exceeded or incorrect isolation.',
        timestamp: new Date()
      });
    }
  }

  public resetGame(): void {
    this.gameState = this.initializeGameState();
    this.addFeedback({
      type: 'info',
      title: 'Game Reset',
      message: 'Ready for new scenario.',
      timestamp: new Date()
    });
  }

  private logUserAction(action: UserAction): void {
    this.gameState.userActions.push(action);
  }

  private addFeedback(feedback: FeedbackMessage): void {
    this.feedbackCallbacks.forEach(callback => callback(feedback));
  }

  public onFeedback(callback: (feedback: FeedbackMessage) => void): () => void {
    this.feedbackCallbacks.push(callback);

    return () => {
      this.feedbackCallbacks = this.feedbackCallbacks.filter(cb => cb !== callback);
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public getPanels(): Panel[] {
    return [...this.gameState.panels];
  }
}

export const gameEngine = new ConveyXGameEngine();
