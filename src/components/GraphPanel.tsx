import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { RunData, NodeData } from '../types';
import { ZoomIn, ZoomOut, Maximize, Scan } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const graphToRender = run ? (isReplaying && run.divergedGraph ? run.divergedGraph : run.graph) : null;

  useEffect(() => {
    if (!containerRef.current || !cyRef.current) return;
    const observer = new ResizeObserver(() => {
      if (cyRef.current) {
         cyRef.current.resize();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
      data: { ...n.data, id: String(n.data.id), label: n.data.label },
      classes: `${n.data.type} ${n.data.annotations ? 'annotated' : ''}`
    })),
    ...graphToRender.edges.map(e => ({
      data: { ...e.data, source: String(e.data.source), target: String(e.data.target), label: e.data.label },
      classes: e.data.isDiverged ? 'diverged' : ''
    }))
  ];

  const getAnnotationSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fef3c7" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

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
      selector: 'node.annotated',
      style: {
        'background-image': getAnnotationSvg(),
        'background-width': '16px',
        'background-height': '16px',
        'background-position-x': '100%',
        'background-position-y': '0px',
        'background-image-opacity': 1,
        'border-color': '#f59e0b',
        'border-width': 3,
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
        'line-style': 'dashed',
        'line-dash-pattern': [6, 4],
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
    fit: true,
    padding: 30,
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

  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, data: NodeData } | null>(null);

  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      cyRef.current.layout(layout).run();
    }
  }, [graphToRender?.nodes.length, graphToRender?.edges.length, layoutName, isReplaying]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    let offset = 0;
    let animationId: number;

    const animateEdges = () => {
      offset = (offset - 1) % 24;
      cy.edges().style('line-dash-offset', offset);
      animationId = requestAnimationFrame(animateEdges);
    };

    animateEdges();

    return () => cancelAnimationFrame(animationId);
  }, [graphToRender]);

  const handleZoomIn = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };
  
  const handleZoomOut = () => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };
  
  const handleFit = () => {
    if (cyRef.current) cyRef.current.fit(undefined, 30);
  };
  
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className="flex-1 relative bg-white overflow-hidden group">
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
            
            cy.off('tap');
            
            cy.on('tap', 'node', (evt) => {
              const node = evt.target;
              const id = node.id();
              const nodeData = node.data();
              onSelectNode({ ...nodeData, id });
            });
            
            cy.on('tap', (evt) => {
               if (evt.target === cy) {
                  onSelectNode(null);
               }
            });

            cy.off('mouseover', 'node');
            cy.on('mouseover', 'node', (evt) => {
              const nodeData = evt.target.data();
              const pos = evt.renderedPosition || { x: 0, y: 0 };
              setHoverInfo({
                x: pos.x,
                y: pos.y,
                data: nodeData
              });
            });

            cy.off('mousemove', 'node');
            cy.on('mousemove', 'node', (evt) => {
              const pos = evt.renderedPosition || { x: 0, y: 0 };
              setHoverInfo(prev => prev ? { ...prev, x: pos.x, y: pos.y } : null);
            });

            cy.off('mouseout', 'node');
            cy.on('mouseout', 'node', () => {
              setHoverInfo(null);
            });
          }}
          className="z-10"
       />

       {hoverInfo && (
         <div 
           className="absolute z-30 pointer-events-none bg-white border border-slate-200 shadow-lg rounded-lg p-3 text-sm flex flex-col gap-1 w-64"
           style={{ left: hoverInfo.x + 15, top: hoverInfo.y + 15 }}
         >
           <div className="font-semibold text-slate-800 flex justify-between items-center">
             <span>{hoverInfo.data.label}</span>
             <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                hoverInfo.data.type === 'error' ? 'bg-rose-100 text-rose-700' :
                hoverInfo.data.type === 'llm' ? 'bg-indigo-100 text-indigo-700' :
                'bg-emerald-100 text-emerald-700'
             }`}>
               {hoverInfo.data.type}
             </span>
           </div>
           <div className="flex justify-between items-center mt-1">
             <div className="text-slate-500 text-xs">Latency: {hoverInfo.data.latencyMs}ms</div>
             <div className="text-slate-500 text-xs">Status: <span className={hoverInfo.data.type === 'error' ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>{hoverInfo.data.type === 'error' ? 'Failed' : 'Success'}</span></div>
           </div>
           {hoverInfo.data.toolParameters && Object.keys(hoverInfo.data.toolParameters).length > 0 && (
              <div className="text-xs text-slate-600 mt-1 bg-slate-50 p-1.5 rounded-md border border-slate-100 font-mono flex flex-col gap-0.5">
                {Object.entries(hoverInfo.data.toolParameters).map(([key, value]) => (
                  <div key={key} className="truncate">
                    <span className="text-slate-500 font-medium">{key}:</span> <span className="text-slate-800">{String(value)}</span>
                  </div>
                ))}
              </div>
           )}
         </div>
       )}

       {isReplaying && run.divergedGraph && (
         <div className="absolute top-4 left-4 z-20 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
           Showing Diverged Replay
         </div>
       )}

       <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
         <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col">
           <button 
             onClick={handleZoomIn} 
             className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors border-b border-slate-100"
             title="Zoom In"
           >
             <ZoomIn className="w-4 h-4" />
           </button>
           <button 
             onClick={handleZoomOut} 
             className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors border-b border-slate-100"
             title="Zoom Out"
           >
             <ZoomOut className="w-4 h-4" />
           </button>
           <button 
             onClick={handleFit} 
             className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
             title="Fit to Screen"
           >
             <Scan className="w-4 h-4" />
           </button>
         </div>
         <button 
           onClick={handleFullscreen} 
           className="bg-white p-2 rounded-lg shadow-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
           title="Fullscreen"
         >
           <Maximize className="w-4 h-4" />
         </button>
       </div>
    </div>
  );
}
