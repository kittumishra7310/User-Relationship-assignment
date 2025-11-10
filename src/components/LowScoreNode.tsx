"use client"

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from '@/contexts/NetworkContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNetwork } from '@/contexts/NetworkContext';
import { motion } from 'framer-motion';

interface LowScoreNodeData {
  user: User;
}

function LowScoreNode({ data }: NodeProps<LowScoreNodeData>) {
  const { user } = data;
  const { setSelectedUser, selectedUser, updateUser } = useNetwork();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const isSelected = selectedUser?.id === user.id;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const hobby = e.dataTransfer.getData('hobby');
    if (hobby) {
      if (user.hobbies.includes(hobby)) {
        // Remove hobby if already exists (toggle)
        await updateUser(user.id, user.username, user.age, user.hobbies.filter(h => h !== hobby));
      } else {
        // Add hobby if not exists
        await updateUser(user.id, user.username, user.age, [...user.hobbies, hobby]);
      }
    }
  };

  return (
    <motion.div 
      className="relative"
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3"
      />
      
      <Card
        className={`min-w-[180px] p-3 cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : ''
        } ${
          isDragOver ? 'ring-2 ring-blue-500' : ''
        } bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-slate-300 dark:border-slate-700`}
        onClick={() => setSelectedUser(user)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
              variant="secondary"
              className="text-xs bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
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
    </motion.div>
  );
}


export default React.memo(LowScoreNode);
