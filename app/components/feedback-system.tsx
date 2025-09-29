
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackMessage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

interface FeedbackSystemProps {
  messages: FeedbackMessage[];
  onDismiss: (index: number) => void;
}

export function FeedbackSystem({ messages, onDismiss }: FeedbackSystemProps) {
  const getIcon = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={`${message.timestamp.getTime()}-${index}`}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Card className={`${getBackgroundColor(message.type)} border shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {getIcon(message.type)}
                    <div>
                      <h4 className="font-semibold text-sm">{message.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(index)}
                    className="h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface GameCompletionModalProps {
  isOpen: boolean;
  success: boolean;
  score: number;
  timeElapsed: number;
  onClose: () => void;
  onRestart: () => void;
}

export function GameCompletionModal({
  isOpen,
  success,
  score,
  timeElapsed,
  onClose,
  onRestart
}: GameCompletionModalProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="mb-4">
                    {success ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                      >
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                      >
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                      </motion.div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold">
                    {success ? 'Mission Accomplished!' : 'Mission Failed'}
                  </h2>

                  <div className="space-y-2">
                    {success && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold text-green-600"
                      >
                        Score: {score}
                      </motion.div>
                    )}
                    
                    <div className="text-gray-600 dark:text-gray-400">
                      Time: {formatTime(timeElapsed)}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {success 
                        ? 'Excellent work isolating the fault and restoring system operation!'
                        : 'The fault isolation was unsuccessful. Review the panel states and try again.'
                      }
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center pt-4">
                    <Button onClick={onRestart} className="flex-1">
                      Try Another Scenario
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
