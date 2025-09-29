
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PanelCard } from './panel-card';
import { GameControlPanel } from './game-control-panel';
import { FeedbackSystem, GameCompletionModal } from './feedback-system';
import { ConveyXGameEngine } from '@/lib/game-engine';
import { GameState, GameScenario, Panel, FeedbackMessage } from '@/lib/types';
import { defaultScenarios, getRandomScenario, createRandomScenario } from '@/lib/scenarios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shuffle, Users, Zap } from 'lucide-react';

export function MainGame() {
  const [gameEngine] = React.useState(() => new ConveyXGameEngine());
  const [gameState, setGameState] = React.useState<GameState>(() => gameEngine.getGameState());
  const [panels, setPanels] = React.useState<Panel[]>(() => gameEngine.getPanels());
  const [selectedScenario, setSelectedScenario] = React.useState<GameScenario | null>(null);
  const [feedbackMessages, setFeedbackMessages] = React.useState<FeedbackMessage[]>([]);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [availableScenarios, setAvailableScenarios] = React.useState<GameScenario[]>(defaultScenarios);

  React.useEffect(() => {
    const updateState = () => {
      setGameState(gameEngine.getGameState());
      setPanels(gameEngine.getPanels());
    };

    const handleFeedback = (feedback: FeedbackMessage) => {
      setFeedbackMessages(prev => [...prev, feedback]);

      // Auto-dismiss non-critical messages after 5 seconds
      if (feedback.type === 'info' || feedback.type === 'warning') {
        setTimeout(() => {
          setFeedbackMessages(prev => prev.filter(msg => msg !== feedback));
        }, 5000);
      }
    };

    const unsubscribe = gameEngine.onFeedback(handleFeedback);

    // Ensure the latest engine state is reflected immediately
    updateState();

    // Set up polling for state updates
    const interval = setInterval(updateState, 100);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [gameEngine]);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (gameState.gameActive && gameState.startTime) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - gameState.startTime!.getTime()) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.gameActive, gameState.startTime]);

  React.useEffect(() => {
    if (!selectedScenario && availableScenarios.length > 0) {
      setSelectedScenario(availableScenarios[0]);
    }
  }, [selectedScenario, availableScenarios]);

  React.useEffect(() => {
    if (gameState.gameCompleted) {
      setShowCompletionModal(true);
    }
  }, [gameState.gameCompleted]);

  const handleStartGame = (scenario: GameScenario) => {
    gameEngine.startGame(scenario);
    setTimeElapsed(0);
  };

  const handleResetGame = () => {
    gameEngine.resetGame();
    setSelectedScenario(null);
    setTimeElapsed(0);
    setShowCompletionModal(false);
  };

  const handleBypassToggle = (panelId: number) => {
    gameEngine.toggleBypass(panelId);
  };

  const handleDismissFeedback = (index: number) => {
    setFeedbackMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRandomScenario = () => {
    const randomScenario = createRandomScenario();
    setAvailableScenarios(prev => [...prev, randomScenario]);
    setSelectedScenario(randomScenario);
  };

  const masterPanel = panels.find(p => p.type === 'master');
  const childPanels = panels.filter(p => p.type === 'child');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ConveyX Mod-LinX Training
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fault Isolation Simulator
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddRandomScenario}
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Random Challenge
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>Multi-User Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Game Control Panel - Left Sidebar */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <GameControlPanel
              gameState={gameState}
              onStartGame={handleStartGame}
              onResetGame={handleResetGame}
              availableScenarios={availableScenarios}
              selectedScenario={selectedScenario}
              onScenarioSelect={setSelectedScenario}
            />
          </div>

          {/* Main Panel Grid */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Panel Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Master Panel */}
                  {masterPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        Master Control Panel
                      </h3>
                      <div className="max-w-md mx-auto">
                        <PanelCard
                          panel={masterPanel}
                          onBypassToggle={handleBypassToggle}
                          gameActive={gameState.gameActive}
                          showFaults={gameState.gameActive}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Child Panels Grid */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Child Panels
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {childPanels.map((panel, index) => (
                        <motion.div
                          key={panel.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.05 
                          }}
                        >
                          <PanelCard
                            panel={panel}
                            onBypassToggle={handleBypassToggle}
                            gameActive={gameState.gameActive}
                            showFaults={gameState.gameActive}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Instructions */}
            {!gameState.gameActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      How to Play
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li>• Select a training scenario from the control panel</li>
                      <li>• When the game starts, the entire conveyor zone will be dead</li>
                      <li>• Toggle bypass switches (ON/OFF) to isolate faulted panels</li>
                      <li>• Watch relay indicators: CR-1, CR-2 (control relays), CR-BP (bypass relay)</li>
                      <li>• Successfully isolate all faults to restore system operation</li>
                      <li>• Green panels = running, Red panels = not running</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback System */}
      <FeedbackSystem
        messages={feedbackMessages}
        onDismiss={handleDismissFeedback}
      />

      {/* Game Completion Modal */}
      <GameCompletionModal
        isOpen={showCompletionModal}
        success={gameState.score > 0}
        score={gameState.score}
        timeElapsed={timeElapsed}
        onClose={() => setShowCompletionModal(false)}
        onRestart={handleResetGame}
      />
    </div>
  );
}
