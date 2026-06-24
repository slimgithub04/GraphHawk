import React, { useState, useMemo, useEffect } from 'react';
import cytoscape from 'cytoscape';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { GraphPanel } from './components/GraphPanel';
import { Inspector } from './components/Inspector';
import { BottomBar } from './components/BottomBar';
import { mockRuns } from './mockData';
import { NodeData } from './types';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const [runs, setRuns] = useState(mockRuns);
  const [runsHistory, setRunsHistory] = useState<typeof mockRuns[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(mockRuns[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutName, setLayoutName] = useState('dagre');
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  useEffect(() => {
    fetch('/api/neo4j/graph')
      .then(res => res.json())
      .then(data => {
        if (data.nodes && data.nodes.length > 0) {
          const neo4jRun = {
            id: 'RUN-NEO4J',
            title: 'Neo4j Graph Database',
            date: new Date().toISOString(),
            status: 'success' as const,
            stepsCount: data.nodes.length,
            totalLatencyMs: data.nodes.reduce((acc: number, n: any) => acc + (n.data.latencyMs || 0), 0),
            fidelityScore: 100,
            graph: data
          };
          setRuns(currentRuns => {
            if (currentRuns.find(r => r.id === 'RUN-NEO4J')) {
              return currentRuns.map(r => r.id === 'RUN-NEO4J' ? neo4jRun : r);
            }
            return [neo4jRun, ...currentRuns];
          });
          setSelectedRunId('RUN-NEO4J');
        }
      })
      .catch(err => console.error("Neo4j fetch error", err));
  }, []);

  const selectedRun = runs.find(r => r.id === selectedRunId) || null;
  const graphToRender = selectedRun ? (isReplaying && selectedRun.divergedGraph ? selectedRun.divergedGraph : selectedRun.graph) : null;
  
  const selectedNode = useMemo(() => {
    if (!graphToRender || !selectedNodeId) return null;
    return graphToRender.nodes.find(n => String(n.data.id) === String(selectedNodeId))?.data || null;
  }, [graphToRender, selectedNodeId]);

  const filteredRuns = useMemo(() => {
    if (!searchQuery) return runs;
    return runs.filter(r => 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [runs, searchQuery]);

  const handleSelectRun = (id: string) => {
    setSelectedRunId(id);
    setSelectedNodeId(null);
    setIsReplaying(false);
  };

  const handleInjectFix = () => {
    setIsReplaying(true);
  };

  const handleNewRecording = () => {
    const newId = `RUN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRun = {
      id: newId,
      title: 'New Custom Recording',
      date: new Date().toISOString(),
      status: 'success' as const,
      stepsCount: 2,
      totalLatencyMs: 1200,
      fidelityScore: 100,
      graph: {
        nodes: [
          { data: { id: 'n1', label: 'Start', type: 'decision' as const, timestamp: new Date().toLocaleTimeString(), latencyMs: 10 } },
          { data: { id: 'n2', label: 'Done', type: 'output' as const, timestamp: new Date().toLocaleTimeString(), latencyMs: 1190 } }
        ],
        edges: [
          { data: { id: 'e1', source: 'n1', target: 'n2' } }
        ]
      }
    };
    setRuns([newRun, ...runs]);
    setSelectedRunId(newId);
    setSelectedNodeId(null);
  };

  const handleExportJson = () => {
    if (!selectedRun) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedRun, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${selectedRun.id}-trace.json`);
    dlAnchorElem.click();
  };

  const handleExportPng = () => {
    if (!cyInstance) return;
    const base64Uri = cyInstance.png({ bg: 'white', full: true, scale: 2 });
    const a = document.createElement('a');
    a.href = base64Uri;
    a.download = `${selectedRun?.id || 'trace'}-graph.png`;
    a.click();
  };

  const handleExportMermaid = () => {
    if (!graphToRender) return;
    
    let mermaid = 'graph TD\n';
    if(layoutName === 'dagre') mermaid = 'graph LR\n';
    
    graphToRender.nodes.forEach(n => {
        const id = n.data.id;
        const label = n.data.label.replace(/"/g, "'");
        let nodeStr = `${id}["${label}"]`;
        if(n.data.type === 'decision') nodeStr = `${id}{"${label}"}`;
        if(n.data.type === 'output') nodeStr = `${id}(("${label}"))`;
        if(n.data.type === 'llm') nodeStr = `${id}("${label}")`;
        mermaid += `  ${nodeStr}\n`;
        
        if (n.data.type === 'error') {
            mermaid += `  style ${id} fill:#fef2f2,stroke:#ef4444,stroke-width:2px,color:#b91c1c\n`;
        }
        else if (n.data.type === 'llm') {
            mermaid += `  style ${id} fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1d4ed8\n`;
        }
        else if (n.data.type === 'tool') {
            mermaid += `  style ${id} fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#7e22ce\n`;
        }
        else if (n.data.type === 'output') {
             mermaid += `  style ${id} fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#15803d\n`;
        }
    });
    
    graphToRender.edges.forEach((e, idx) => {
        if(e.data.label) {
            mermaid += `  ${e.data.source} -- "${e.data.label}" --> ${e.data.target}\n`;
        } else {
            mermaid += `  ${e.data.source} --> ${e.data.target}\n`;
        }
        if (e.data.isDiverged) {
            mermaid += `  linkStyle ${idx} stroke:#f59e0b,stroke-width:3px,stroke-dasharray: 5 5\n`;
        }
    });

    navigator.clipboard.writeText(mermaid);
    alert('Mermaid chart copied to clipboard!');
  };

  const handleExportMarkdown = () => {
    if (!selectedRun || !graphToRender) return;
    
    let md = `# Execution Report: ${selectedRun.title}\n`;
    md += `**Run ID:** ${selectedRun.id}\n`;
    md += `**Date:** ${new Date(selectedRun.date).toLocaleString()}\n`;
    md += `**Status:** ${selectedRun.status}\n`;
    md += `**Fidelity Score:** ${selectedRun.fidelityScore}%\n`;
    md += `**Total Latency:** ${selectedRun.totalLatencyMs}ms\n\n`;
    
    md += `## Steps\n`;
    graphToRender.nodes.forEach((n, idx) => {
        md += `### ${idx + 1}. [${n.data.type.toUpperCase()}] ${n.data.label}\n`;
        md += `- **Latency:** ${n.data.latencyMs}ms\n`;
        if (n.data.aiAnalysis) md += `- **AI Analysis:** ${n.data.aiAnalysis}\n`;
        if (n.data.prompt) md += `- **Prompt:** \`${n.data.prompt}\`\n`;
        if (n.data.response) md += `- **Response:** \`${n.data.response}\`\n`;
        if (n.data.toolResponse?.error) md += `- **Error:** ${n.data.toolResponse.error}\n`;
        md += '\n';
    });
    
    navigator.clipboard.writeText(md);
    alert('Markdown summary copied to clipboard!');
  };

  const handleStepBack = () => {
    if (!graphToRender) return;
    const nodes = graphToRender.nodes;
    if (!selectedNodeId) {
      setSelectedNodeId(nodes[nodes.length - 1].data.id);
      return;
    }
    const idx = nodes.findIndex(n => n.data.id === selectedNodeId);
    if (idx > 0) {
      setSelectedNodeId(nodes[idx - 1].data.id);
    }
  };

  const handleStepForward = () => {
    if (!graphToRender) return;
    const nodes = graphToRender.nodes;
    if (!selectedNodeId) {
      setSelectedNodeId(nodes[0].data.id);
      return;
    }
    const idx = nodes.findIndex(n => n.data.id === selectedNodeId);
    if (idx !== -1 && idx < nodes.length - 1) {
      setSelectedNodeId(nodes[idx + 1].data.id);
    }
  };

  const activeNodesCount = selectedNodeId && graphToRender 
    ? graphToRender.nodes.findIndex(n => n.data.id === selectedNodeId) + 1 
    : 0;

  const handleUpdateAnnotation = (nodeId: string, annotations: string) => {
    if (!selectedRunId) return;

    if (selectedRunId === 'RUN-NEO4J') {
      fetch(`/api/neo4j/node/${nodeId}/annotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annotations })
      }).catch(err => console.error('Failed to update Neo4j annotation:', err));
    }

    setRuns(currentRuns => {
      setRunsHistory(prev => [...prev, currentRuns]);
      return currentRuns.map(run => {
        if (run.id !== selectedRunId) return run;

        const updateGraph = (graph: typeof run.graph) => ({
          ...graph,
          nodes: graph.nodes.map(n => 
            n.data.id === nodeId 
              ? { ...n, data: { ...n.data, annotations } } 
              : n
          )
        });

        return {
          ...run,
          graph: updateGraph(run.graph),
          divergedGraph: run.divergedGraph ? updateGraph(run.divergedGraph) : undefined
        };
      });
    });
  };

  const handleSeedNeo4j = () => {
    fetch('/api/neo4j/seed', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Neo4j database seeded successfully! Reloading...');
          window.location.reload();
        } else {
          alert('Failed to seed Neo4j: ' + data.error);
        }
      })
      .catch(err => alert('Error seeding Neo4j: ' + err));
  };

  const divergenceCount = selectedRun?.divergedGraph?.edges.filter(e => e.data.isDiverged).length || 0;

  useKeyboardShortcuts([
    {
      key: 'z',
      ctrlKey: true,
      handler: () => {
        if (runsHistory.length > 0) {
          setRuns(runsHistory[runsHistory.length - 1]);
          setRunsHistory(prev => prev.slice(0, -1));
        }
      }
    },
    {
      key: ' ',
      handler: (e) => {
        e.preventDefault();
        setIsReplaying(prev => !prev);
      }
    },
    {
      key: 'ArrowLeft',
      handler: (e) => { e.preventDefault(); handleStepBack(); }
    },
    {
      key: 'ArrowUp',
      handler: (e) => { e.preventDefault(); handleStepBack(); }
    },
    {
      key: 'ArrowRight',
      handler: (e) => { e.preventDefault(); handleStepForward(); }
    },
    {
      key: 'ArrowDown',
      handler: (e) => { e.preventDefault(); handleStepForward(); }
    },
    {
      key: '[',
      ctrlKey: true,
      handler: () => setIsSidebarOpen(prev => !prev)
    },
    {
      key: ']',
      ctrlKey: true,
      handler: () => setIsInspectorOpen(prev => !prev)
    },
    {
      key: '=',
      handler: () => {
        if (cyInstance) cyInstance.zoom(cyInstance.zoom() * 1.2);
      }
    },
    {
      key: '-',
      handler: () => {
        if (cyInstance) cyInstance.zoom(cyInstance.zoom() * 0.8);
      }
    },
    {
      key: '0',
      handler: () => {
        if (cyInstance) cyInstance.fit(undefined, 30);
      }
    },
    {
      key: '1',
      handler: () => setLayoutName('dagre')
    },
    {
      key: '2',
      handler: () => setLayoutName('breadthfirst')
    },
    {
      key: '3',
      handler: () => setLayoutName('grid')
    },
    {
      key: 'f',
      handler: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
    }
  ]);

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-gray-900 font-sans overflow-hidden">
      <Topbar 
        onNewRecording={handleNewRecording}
        onStartReplay={() => setIsReplaying(!isReplaying)}
        onExportJson={handleExportJson}
        onExportPng={handleExportPng}
        onExportMermaid={handleExportMermaid}
        onExportMarkdown={handleExportMarkdown}
        isReplaying={isReplaying}
        fidelityScore={selectedRun?.fidelityScore || 0}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isInspectorOpen={isInspectorOpen}
        setIsInspectorOpen={setIsInspectorOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <Sidebar 
            runs={filteredRuns} 
            selectedRunId={selectedRunId} 
            onSelectRun={handleSelectRun}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNewRecording={handleNewRecording}
            onSeedNeo4j={handleSeedNeo4j}
          />
        )}
        
        <div className="flex flex-col flex-1 relative min-w-0">
          <div className="flex flex-1 overflow-hidden relative">
            <GraphPanel 
              run={selectedRun} 
              onSelectNode={(node) => {
                setSelectedNodeId(node?.id || null);
                if (node) setIsInspectorOpen(true);
              }} 
              selectedNodeId={selectedNodeId}
              isReplaying={isReplaying}
              layoutName={layoutName}
              onCyInit={setCyInstance}
            />
            {isInspectorOpen && (
              <Inspector 
                node={selectedNode} 
                previousNode={
                  selectedNode && graphToRender 
                    ? (() => {
                        const incomingEdge = graphToRender.edges.find(e => String(e.data.target) === String(selectedNode.id));
                        if (incomingEdge) {
                          const prevNodeId = incomingEdge.data.source;
                          return graphToRender.nodes.find(n => String(n.data.id) === String(prevNodeId))?.data || null;
                        }
                        return null;
                      })()
                    : null
                }
                onUpdateAnnotation={handleUpdateAnnotation}
              />
            )}
          </div>
          
          <BottomBar 
            onInjectFix={handleInjectFix}
            isReplaying={isReplaying}
            setIsReplaying={setIsReplaying}
            onStepBack={handleStepBack}
            onStepForward={handleStepForward}
            layoutName={layoutName}
            setLayoutName={setLayoutName}
            activeNodesCount={activeNodesCount}
            totalNodesCount={graphToRender?.nodes.length || 0}
            divergenceCount={divergenceCount}
          />
        </div>
      </div>
    </div>
  );
}
