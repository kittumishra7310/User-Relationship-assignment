"use client"

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from '@/contexts/NetworkContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNetwork } from '@/contexts/NetworkContext';

interface UserNodeData {
  user: User;
}

export default function UserNode({ data }: NodeProps<UserNodeData>) {
  const { user } = data;
  const { setSelectedUser, selectedUser } = useNetwork();
  const isHighScore = user.popularityScore >= 30;
  const isSelected = selectedUser?.id === user.id;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3"
      />
      
      <Card
        className={`min-w-[180px] p-3 cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : ''
        } ${
          isHighScore
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700'
            : 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-slate-300 dark:border-slate-700'
        }`}
        onClick={() => setSelectedUser(user)}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {user.username}
              </h3>
              <p className="text-xs text-muted-foreground">
                Age: {user.age}
              </p>
            </div>
            <Badge
              variant={isHighScore ? 'default' : 'secondary'}
              className={`text-xs ${
                isHighScore
                  ? 'bg-green-600 text-white dark:bg-green-500'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {user.popularityScore}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {user.hobbies.length === 0 ? (
              <span className="italic">No hobbies</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {user.hobbies.slice(0, 3).map((hobby, idx) => (
                  <span
                    key={idx}
                    className="bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs"
                  >
                    {hobby}
                  </span>
                ))}
                {user.hobbies.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{user.hobbies.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
}
