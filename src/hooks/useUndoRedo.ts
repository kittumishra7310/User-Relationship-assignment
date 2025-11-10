import { useState, useCallback } from 'react';

export interface Action {
  type: 'CREATE_USER' | 'DELETE_USER' | 'UPDATE_USER' | 'CREATE_FRIENDSHIP' | 'DELETE_FRIENDSHIP' | 'MOVE_NODE';
  data: any;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

export function useUndoRedo() {
  const [history, setHistory] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  const addAction = useCallback((action: Action) => {
    setHistory(prev => {
      // Remove any actions after current index (they're now invalid)
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new action
      newHistory.push(action);
      // Limit history to last 50 actions
      if (newHistory.length > 50) {
        newHistory.shift();
        setCurrentIndex(prev => prev);
        return newHistory;
      }
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback(async () => {
    if (!canUndo) return;
    
    const action = history[currentIndex];
    await action.undo();
    setCurrentIndex(prev => prev - 1);
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(async () => {
    if (!canRedo) return;
    
    const action = history[currentIndex + 1];
    await action.redo();
    setCurrentIndex(prev => prev + 1);
  }, [canRedo, currentIndex, history]);

  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    historyLength: history.length,
  };
}
