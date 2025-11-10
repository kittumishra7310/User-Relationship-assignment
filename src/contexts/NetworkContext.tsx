"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useUndoRedo, Action } from '@/hooks/useUndoRedo';

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  popularityScore: number;
  createdAt: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

interface NetworkContextType {
  users: User[];
  edges: Edge[];
  loading: boolean;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  fetchGraphData: () => Promise<void>;
  createUser: (username: string, age: number, hobbies: string[]) => Promise<void>;
  updateUser: (id: string, username: string, age: number, hobbies: string[]) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  linkUsers: (userId1: string, userId2: string) => Promise<void>;
  unlinkUsers: (userId1: string, userId2: string) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { addAction, undo, redo, canUndo, canRedo } = useUndoRedo();

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/graph');
      if (!response.ok) throw new Error('Failed to fetch graph data');
      const data = await response.json();
      setUsers(data.users);
      setEdges(data.edges);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (username: string, age: number, hobbies: string[]) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, age, hobbies }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }
      
      const { user } = await response.json();
      
      // Add undo/redo action
      addAction({
        type: 'CREATE_USER',
        data: { userId: user.id, username, age, hobbies },
        undo: async () => {
          await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
          await fetchGraphData();
          toast.info('User creation undone');
        },
        redo: async () => {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, age, hobbies }),
          });
          await fetchGraphData();
          toast.info('User creation redone');
        },
      });
      
      toast.success(`User "${username}" created successfully`);
      await fetchGraphData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
      throw error;
    }
  }, [fetchGraphData, addAction]);

  const updateUser = useCallback(async (id: string, username: string, age: number, hobbies: string[]) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, age, hobbies }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
      
      toast.success(`User "${username}" updated successfully`);
      await fetchGraphData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
      throw error;
    }
  }, [fetchGraphData]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      
      toast.success('User deleted successfully');
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      await fetchGraphData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
      throw error;
    }
  }, [fetchGraphData, selectedUser]);

  const linkUsers = useCallback(async (userId1: string, userId2: string) => {
    try {
      const response = await fetch(`/api/users/${userId1}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId2 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to link users');
      }
      
      // Add undo/redo action
      addAction({
        type: 'CREATE_FRIENDSHIP',
        data: { userId1, userId2 },
        undo: async () => {
          await fetch(`/api/users/${userId1}/unlink`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId: userId2 }),
          });
          await fetchGraphData();
          toast.info('Friendship creation undone');
        },
        redo: async () => {
          await fetch(`/api/users/${userId1}/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId: userId2 }),
          });
          await fetchGraphData();
          toast.info('Friendship creation redone');
        },
      });
      
      toast.success('Users linked successfully');
      await fetchGraphData();
    } catch (error) {
      console.error('Error linking users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to link users');
      throw error;
    }
  }, [fetchGraphData, addAction]);

  const unlinkUsers = useCallback(async (userId1: string, userId2: string) => {
    try {
      const response = await fetch(`/api/users/${userId1}/unlink`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId2 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unlink users');
      }
      
      // Add undo/redo action
      addAction({
        type: 'DELETE_FRIENDSHIP',
        data: { userId1, userId2 },
        undo: async () => {
          await fetch(`/api/users/${userId1}/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId: userId2 }),
          });
          await fetchGraphData();
          toast.info('Friendship deletion undone');
        },
        redo: async () => {
          await fetch(`/api/users/${userId1}/unlink`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId: userId2 }),
          });
          await fetchGraphData();
          toast.info('Friendship deletion redone');
        },
      });
      
      toast.success('Users unlinked successfully');
      await fetchGraphData();
    } catch (error) {
      console.error('Error unlinking users:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unlink users');
      throw error;
    }
  }, [fetchGraphData, addAction]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return (
    <NetworkContext.Provider
      value={{
        users,
        edges,
        loading,
        selectedUser,
        setSelectedUser,
        fetchGraphData,
        createUser,
        updateUser,
        deleteUser,
        linkUsers,
        unlinkUsers,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}