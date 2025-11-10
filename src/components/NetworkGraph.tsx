"use client"

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNetwork } from '@/contexts/NetworkContext';
import HighScoreNode from './HighScoreNode';
import LowScoreNode from './LowScoreNode';

// Define node types outside component for performance
const nodeTypes: NodeTypes = {
  highScoreNode: HighScoreNode,
  lowScoreNode: LowScoreNode,
};

export default function NetworkGraph() {
  const { users, edges: graphEdges, linkUsers, loading } = useNetwork();

  // Convert users to React Flow nodes with different types based on score
  const initialNodes: Node[] = useMemo(() => {
    return users.map((user, index) => {
      const angle = (index / users.length) * 2 * Math.PI;
      const radius = Math.max(200, users.length * 30);
      
      return {
        id: user.id.toString(),
        type: user.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode',
        position: {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius,
        },
        data: { user },
      };
    });
  }, [users]);

  // Convert friendships to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return graphEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    }));
  }, [graphEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when users change
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when graph edges change
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (connection.source && connection.target) {
        // IDs are already strings (UUIDs), no need to parse
        await linkUsers(connection.source, connection.target);
      }
    },
    [linkUsers]
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading network...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return node.type === 'highScoreNode' ? '#10b981' : '#94a3b8';
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  );
}