export type RunStatus = 'success' | 'failed' | 'warning';

export type NodeType = 'llm' | 'tool' | 'decision' | 'output' | 'error';

export interface NodeData {
  id: string;
  label: string;
  type: NodeType;
  timestamp: string;
  latencyMs: number;
  prompt?: string;
  response?: string;
  toolParameters?: object;
  toolResponse?: any;
  stateSnapshot?: object;
  aiAnalysis?: string;
  annotation?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  isDiverged?: boolean; // Used for overlaying runs
}

export interface RunGraph {
  nodes: { data: NodeData; position?: { x: number; y: number } }[];
  edges: { data: EdgeData }[];
}

export interface RunData {
  id: string;
  title: string;
  date: string;
  status: RunStatus;
  stepsCount: number;
  totalLatencyMs: number;
  fidelityScore: number;
  graph: RunGraph;
  divergedGraph?: RunGraph; // Optional, to overlay a "fix" graph
}
