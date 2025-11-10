"use client"

import React from 'react';
import { NetworkProvider } from '@/contexts/NetworkContext';
import NetworkGraph from './NetworkGraph';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function NetworkApp() {
  return (
    <NetworkProvider>
      <div className="h-screen w-full flex overflow-hidden">
        <div className="flex-1 relative">
          <NetworkGraph />
          
          {/* Header Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-border">
            <h1 className="text-xl font-bold">
              User Network Graph
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect nodes by dragging from one to another
            </p>
          </div>
        </div>
        
        <Sidebar />
      </div>
      <Toaster />
    </NetworkProvider>
  );
}
