import React from 'react';
import { NodeData } from '../types';
import { Clock, Info, ActivitySquare, Database, AlertTriangle, FileJson, MessageSquare, TerminalSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface InspectorProps {
  node: NodeData | null;
}

export function Inspector({ node }: InspectorProps) {
  if (!node) {
    return (
      <div className="w-[420px] border-l border-zinc-200 bg-zinc-50 flex flex-col h-full shrink-0 items-center justify-center text-zinc-400 p-8 text-center space-y-4">
         <ActivitySquare className="w-12 h-12 stroke-1 text-zinc-300" />
         <p className="text-sm font-medium">Select a node in the graph to view execution details, prompts, and memory state.</p>
      </div>
    );
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'error': return 'bg-rose-50 text-rose-700 border-rose-200/60 shadow-sm';
      case 'output': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm';
      case 'llm': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 shadow-sm';
      case 'tool': return 'bg-violet-50 text-violet-700 border-violet-200/60 shadow-sm';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 shadow-sm';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'llm': return <MessageSquare className="w-4 h-4" />;
      case 'tool': return <TerminalSquare className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-[420px] border-l border-zinc-200 bg-white flex flex-col h-full shrink-0 overflow-y-auto">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-4">
          <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5", getTypeStyle(node.type))}>
            {getIcon(node.type)}
            {node.type}
          </span>
          <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200/50 shadow-sm">{node.id}</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 leading-tight mb-4 tracking-tight">{node.label}</h2>
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 tracking-wide">
          <div className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-3.5 h-3.5 text-zinc-400" /> {node.timestamp}</div>
          <div className="flex items-center gap-1.5 whitespace-nowrap"><ActivitySquare className="w-3.5 h-3.5 text-zinc-400" /> {node.latencyMs}ms</div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-8">
        
        {node.aiAnalysis && (
          <div className="bg-indigo-50/50 rounded-lg p-5 border border-indigo-100/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-indigo-800 mb-2.5 flex items-center gap-1.5"><Info className="w-3 h-3" /> Auto-Analysis</h4>
            <p className="text-[13px] text-indigo-950 font-medium leading-relaxed">{node.aiAnalysis}</p>
          </div>
        )}

        {node.prompt && (
          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest flex items-center gap-1.5"><MessageSquare className="w-3 h-3" /> LLM Prompt</h4>
            <div className="bg-zinc-900 rounded-lg text-[13px] text-zinc-300 p-4 font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto selection:bg-indigo-500/30">
              {node.prompt}
            </div>
          </div>
        )}

        {node.response && (
          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest flex items-center gap-1.5"><TerminalSquare className="w-3 h-3" /> Model Response</h4>
            <div className="bg-zinc-900 rounded-lg text-[13px] text-zinc-300 p-4 font-mono whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto selection:bg-indigo-500/30 border border-zinc-800">
              {node.response}
            </div>
          </div>
        )}

        {node.toolParameters && (
          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest flex items-center gap-1.5"><FileJson className="w-3 h-3" /> Tool Parameters</h4>
            <pre className="bg-zinc-900 text-zinc-300 rounded-lg p-4 overflow-x-auto text-[13px] font-mono shadow-inner border border-zinc-800 selection:bg-indigo-500/30">
              {JSON.stringify(node.toolParameters, null, 2)}
            </pre>
          </div>
        )}

        {node.toolResponse && (
          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest flex items-center gap-1.5"><FileJson className="w-3 h-3" /> Tool Response Result</h4>
            <pre className={cn(
              "rounded-lg p-4 overflow-x-auto text-[13px] font-mono shadow-inner border",
              node.type === 'error' ? "bg-rose-950/80 text-rose-200 border-rose-900/50" : "bg-zinc-900 text-zinc-300 border-zinc-800 selection:bg-indigo-500/30"
            )}>
              {JSON.stringify(node.toolResponse, null, 2)}
            </pre>
          </div>
        )}

        {node.stateSnapshot && (
          <div>
            <h4 className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-widest flex items-center gap-1.5"><Database className="w-3 h-3" /> Memory Snapshot</h4>
            <pre className="bg-zinc-50 rounded-lg p-4 overflow-x-auto text-[12px] font-mono border border-zinc-200/80 text-zinc-600 shadow-sm">
              {JSON.stringify(node.stateSnapshot, null, 2)}
            </pre>
          </div>
        )}

        {node.annotation && (
           <div>
             <h4 className="text-[10px] uppercase font-bold text-amber-600 mb-2 tracking-widest flex items-center gap-1.5"><Info className="w-3 h-3" /> User Annotation</h4>
             <div className="bg-amber-50/50 border border-amber-200/60 text-amber-900 rounded-lg p-4 text-[13px] font-medium leading-relaxed shadow-sm">
               {node.annotation}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
