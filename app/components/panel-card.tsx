
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Panel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  ZapOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  Power,
  RotateCcw
} from 'lucide-react';

interface PanelCardProps {
  panel: Panel;
  onBypassToggle: (panelId: number) => void;
  gameActive: boolean;
  showFaults?: boolean;
}

export function PanelCard({ panel, onBypassToggle, gameActive, showFaults = false }: PanelCardProps) {
  const isMaster = panel.type === 'master';
  
  const getStatusColor = () => {
    if (panel.status === 'running') return 'text-green-500';
    return 'text-red-500';
  };
  
  const getStatusIcon = () => {
    return panel.status === 'running' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const getRelayColor = (relayState: boolean) => {
    return relayState ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={`h-full ${isMaster ? 'ring-2 ring-blue-500' : ''}`}
    >
      <Card className={`h-full transition-all duration-300 ${
        isMaster ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-white dark:bg-gray-900'
      } ${panel.hasFault && showFaults ? 'ring-2 ring-red-400' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isMaster ? <Settings className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              <span>{panel.name}</span>
            </div>
            {isMaster && <Badge variant="outline">MASTER</Badge>}
            {panel.hasFault && showFaults && (
              <Badge variant="destructive" className="text-xs">FAULT</Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`text-sm font-bold capitalize ${getStatusColor()}`}>
                {panel.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Bypass Controls */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bypass Control</label>
            <div className="flex gap-2">
              <Button
                variant={panel.bypassState === 'OFF' ? 'default' : 'outline'}
                size="sm"
                disabled={!gameActive}
                onClick={() => panel.bypassState === 'ON' && onBypassToggle(panel.id)}
                className="flex-1"
              >
                <ZapOff className="h-3 w-3 mr-1" />
                OFF
              </Button>
              <Button
                variant={panel.bypassState === 'ON' ? 'default' : 'outline'}
                size="sm"
                disabled={!gameActive}
                onClick={() => panel.bypassState === 'OFF' && onBypassToggle(panel.id)}
                className="flex-1"
              >
                <Zap className="h-3 w-3 mr-1" />
                ON
              </Button>
            </div>
          </div>

          {/* Relay Indicators */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Relay Status</label>
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                animate={{ scale: panel.relays.CR1 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center p-2 rounded bg-gray-50 dark:bg-gray-800"
              >
                <div className={`w-3 h-3 rounded-full ${getRelayColor(panel.relays.CR1)} mb-1`} />
                <span className="text-xs">CR-1</span>
              </motion.div>
              
              <motion.div
                animate={{ scale: panel.relays.CR2 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center p-2 rounded bg-gray-50 dark:bg-gray-800"
              >
                <div className={`w-3 h-3 rounded-full ${getRelayColor(panel.relays.CR2)} mb-1`} />
                <span className="text-xs">CR-2</span>
              </motion.div>
              
              <motion.div
                animate={{ scale: panel.relays.CRBP ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center p-2 rounded bg-gray-50 dark:bg-gray-800"
              >
                <div className={`w-3 h-3 rounded-full ${getRelayColor(panel.relays.CRBP)} mb-1`} />
                <span className="text-xs">CR-BP</span>
              </motion.div>
            </div>
          </div>

          {/* Isolation Status */}
          {panel.isIsolated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
            >
              <RotateCcw className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">ISOLATED</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
