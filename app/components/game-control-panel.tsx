
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState, GameScenario } from '@/lib/types';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Clock, 
  Target, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Timer
} from 'lucide-react';

interface GameControlPanelProps {
  gameState: GameState;
  onStartGame: (scenario: GameScenario) => void;
  onResetGame: () => void;
  availableScenarios: GameScenario[];
  selectedScenario: GameScenario | null;
  onScenarioSelect: (scenario: GameScenario) => void;
}

export function GameControlPanel({
  gameState,
  onStartGame,
  onResetGame,
  availableScenarios,
  selectedScenario,
  onScenarioSelect
}: GameControlPanelProps) {
  const [timeElapsed, setTimeElapsed] = React.useState(0);

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

  const faultPanels = gameState.panels.filter(p => p.hasFault);
  const isolatedPanels = gameState.panels.filter(p => p.isIsolated);
  const runningPanels = gameState.panels.filter(p => p.status === 'running');

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Game Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            ConveyX Mod-LinX Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Scenario Info */}
          {gameState.currentScenario && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                {gameState.currentScenario.name}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {gameState.currentScenario.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  className={`text-white ${getDifficultyColor(gameState.currentScenario.difficulty)}`}
                >
                  {gameState.currentScenario.difficulty.toUpperCase()}
                </Badge>
                {gameState.currentScenario.successConditions.timeLimit && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {Math.floor(gameState.currentScenario.successConditions.timeLimit / 60)}m
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Game Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-lg font-bold">{formatTime(timeElapsed)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-lg font-bold text-red-600">{faultPanels.length}</div>
              <div className="text-sm text-gray-600">Faults</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-lg font-bold text-yellow-600">{isolatedPanels.length}</div>
              <div className="text-sm text-gray-600">Isolated</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600">{runningPanels.length}</div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex gap-2">
            {!gameState.gameActive ? (
              <Button 
                onClick={() => selectedScenario && onStartGame(selectedScenario)}
                disabled={!selectedScenario}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Game
              </Button>
            ) : (
              <Button 
                variant="destructive"
                onClick={onResetGame}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Game
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={onResetGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Score Display */}
          {gameState.gameCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Game Complete!
                </span>
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                Score: {gameState.score}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      {!gameState.gameActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Training Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableScenarios.map((scenario) => (
                <motion.div
                  key={scenario.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    variant={selectedScenario?.id === scenario.id ? 'default' : 'outline'}
                    onClick={() => onScenarioSelect(scenario)}
                    className="w-full justify-start p-4 h-auto"
                  >
                    <div className="text-left">
                      <div className="font-semibold">{scenario.name}</div>
                      <div className="text-sm opacity-70 mt-1">{scenario.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="secondary"
                          className={`text-white text-xs ${getDifficultyColor(scenario.difficulty)}`}
                        >
                          {scenario.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {scenario.faultPanels.length} fault{scenario.faultPanels.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
