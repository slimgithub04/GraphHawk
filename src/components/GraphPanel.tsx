import React, { useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { RunData, NodeData } from '../types';

cytoscape.use(dagre);

interface GraphPanelProps {
  run: RunData | null;
  onSelectNode: (node: NodeData | null) => void;
  selectedNodeId: string | null;
  isReplaying: boolean;
  layoutName: string;
  onCyInit?: (cy: cytoscape.Core) => void;
}

export function GraphPanel({ run, onSelectNode, selectedNodeId, isReplaying, layoutName, onCyInit }: GraphPanelProps) {
  const cyRef = useRef<cytoscape.Core | null>(null);
  
  const graphToRender = run ? (isReplaying && run.divergedGraph ? run.divergedGraph : run.graph) : null;

  // Sync selectedNodeId prop with active Cytoscape node
  useEffect(() => {
    if (cyRef.current && graphToRender) {
      cyRef.current.elements().unselect();
      if (selectedNodeId) {
        const cytoscapeNode = cyRef.current.getElementById(selectedNodeId);
        if (cytoscapeNode.length > 0) {
           cytoscapeNode.select();
        }
      }
    }
  }, [selectedNodeId, run, isReplaying, graphToRender]);

  if (!run || !graphToRender) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center relative pattern-grid">
         <div className="text-gray-400 font-medium">No run selected</div>
      </div>
    );
  }

  const elements = [
    ...graphToRender.nodes.map(n => ({
      data: { ...n.data, id: n.data.id, label: n.data.label },
      classes: n.data.type
    })),
    ...graphToRender.edges.map(e => ({
      data: { ...e.data, source: e.data.source, target: e.data.target, label: e.data.label },
      classes: e.data.isDiverged ? 'diverged' : ''
    }))
  ];

  const stylesheet: any[] = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 8,
        'font-family': 'Inter, sans-serif',
        'font-size': '11px',
        'font-weight': 600,
        'color': '#1e293b',
        'background-color': '#f1f5f9',
        'border-width': 2,
        'border-color': '#cbd5e1',
        'shape': 'ellipse',
        'width': '56px',
        'height': '56px',
        'text-wrap': 'wrap',
        'text-max-width': '100px',
        'transition-property': 'background-color, border-color, border-width',
        'transition-duration': 300,
      }
    },
    {
      selector: 'node.llm',
      style: {
        'background-color': '#e0e7ff',
        'border-color': '#6366f1',
      }
    },
    {
      selector: 'node.tool',
      style: {
        'background-color': '#f3e8ff',
        'border-color': '#a855f7',
      }
    },
    {
      selector: 'node.error',
      style: {
        'background-color': '#ffe4e6',
        'border-color': '#f43f5e',
      }
    },
    {
      selector: 'node.output',
      style: {
        'background-color': '#d1fae5',
        'border-color': '#10b981',
      }
    },
    {
      selector: 'node.decision',
      style: {
        'background-color': '#f1f5f9',
        'border-color': '#94a3b8',
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#cbd5e1',
        'target-arrow-color': '#cbd5e1',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'font-family': 'Inter, sans-serif',
        'font-weight': 600,
        'color': '#64748b',
        'text-background-opacity': 1,
        'text-background-color': '#ffffff',
        'text-background-padding': '4px',
        'text-border-width': 1,
        'text-border-color': '#e2e8f0',
        'text-border-opacity': 1,
        'transition-property': 'line-color, target-arrow-color, width',
        'transition-duration': 300,
      }
    },
    {
      selector: 'edge.diverged',
      style: {
        'line-color': '#f59e0b',
        'target-arrow-color': '#f59e0b',
        'line-style': 'dashed',
        'width': 3
      }
    },
    {
      selector: ':selected',
      style: {
        'border-width': 4,
        'border-color': '#0f172a',
      }
    }
  ];

  const baseLayoutOptions = {
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-in-out',
    spacingFactor: layoutName === 'dagre' ? 1.5 : 1.2
  };

  const layout = layoutName === 'dagre' ? {
    ...baseLayoutOptions,
    name: 'dagre',
    rankDir: 'LR'
  } : layoutName === 'breadthfirst' ? {
    ...baseLayoutOptions,
    name: 'breadthfirst',
    directed: true
  } : {
    ...baseLayoutOptions,
    name: layoutName
  };

  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      cyRef.current.layout(layout).run();
      cyRef.current.fit();
    }
  }, [graphToRender?.nodes.length, graphToRender?.edges.length, layoutName, isReplaying]);

  return (
    <div className="flex-1 relative bg-white overflow-hidden">
       {/* Background pattern */}
       <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
       
       <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          style={{ width: '100%', height: '100%' }}
          layout={layout}
          cy={(cy) => {
            cyRef.current = cy;
            if (onCyInit) onCyInit(cy);
            cy.on('tap', 'node', (evt) => {
              const nodeData = evt.target.data();
              // Find full node data from run
              const fullNode = graphToRender.nodes.find(n => n.data.id === nodeData.id);
              if (fullNode) onSelectNode(fullNode.data);
            });
            cy.on('tap', (evt) => {
               if (evt.target === cy) {
                  onSelectNode(null); // click on background clears selection
               }
            });
          }}
          className="z-10"
       />

       {isReplaying && run.divergedGraph && (
         <div className="absolute top-4 left-4 z-20 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
           Showing Diverged Replay
         </div>
       )}
    </div>
  );
}
