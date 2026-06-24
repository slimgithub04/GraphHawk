import React, { useState, useEffect } from 'react';
import { NodeData } from '../types';
import { Clock, Info, ActivitySquare, Database, AlertTriangle, FileJson, MessageSquare, TerminalSquare, Edit3, Save, X, Diff } from 'lucide-react';
import { cn } from '../lib/utils';
import { StateDiffPanel } from './StateDiffPanel';

interface InspectorProps {
  node: NodeData | null;
  previousNode?: NodeData | null;
  onUpdateAnnotation: (nodeId: string, annotation: string) => void;
}

export function Inspector({ node, previousNode, onUpdateAnnotation }: InspectorProps) {
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [annotationDraft, setAnnotationDraft] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    setIsEditingAnnotation(false);
    setAnnotationDraft(node?.annotations || '');
    setShowDiff(true); // Default to diff view if we can
  }, [node?.id, node?.annotations]);

  if (!node) {
    return (
      <div className="w-[420px] border-l border-slate-200 bg-slate-50 flex flex-col h-full shrink-0 items-center justify-center text-slate-400 p-8 text-center space-y-4 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-20 relative">
         <ActivitySquare className="w-12 h-12 stroke-1 text-slate-300" />
         <p className="text-[14px] font-medium text-slate-500">Select a node in the graph to view execution details, prompts, and memory state.</p>
      </div>
    );
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'error': return 'bg-rose-50 text-rose-700 border-rose-200/60 shadow-sm';
      case 'output': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-sm';
      case 'llm': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60 shadow-sm';
      case 'tool': return 'bg-violet-50 text-violet-700 border-violet-200/60 shadow-sm';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 shadow-sm';
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
    <div className="w-[420px] border-l border-slate-200 bg-white flex flex-col h-full shrink-0 overflow-y-auto shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-20 relative">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-4">
          <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5", getTypeStyle(node.type))}>
            {getIcon(node.type)}
            {node.type}
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/50 shadow-sm">{node.id}</span>
        </div>
        <h2 className="text-[20px] font-bold text-slate-900 leading-tight mb-4 tracking-tight">{node.label}</h2>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 tracking-wide">
          <div className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-3.5 h-3.5 text-slate-400" /> {node.timestamp}</div>
          <div className="flex items-center gap-1.5 whitespace-nowrap"><ActivitySquare className="w-3.5 h-3.5 text-slate-400" /> {node.latencyMs}ms</div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div>
          <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-1.5"><FileJson className="w-3 h-3" /> Raw Node Data</h4>
          <pre className="bg-[#0f172a] text-slate-300 rounded-lg p-4 overflow-x-auto text-[13px] font-mono shadow-inner border border-slate-800 selection:bg-indigo-500/30">
            {JSON.stringify(node, null, 2)}
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className={cn("text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5", node.annotations ? "text-amber-600" : "text-slate-400")}>
              <Info className="w-3 h-3" /> User Annotation
            </h4>
            {!isEditingAnnotation && (
              <button 
                onClick={() => setIsEditingAnnotation(true)}
                className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                title={node.annotations ? "Edit Annotation" : "Add Annotation"}
              >
                <Edit3 className="w-3 h-3" /> {node.annotations ? 'Edit' : 'Add'}
              </button>
            )}
          </div>
          
          {isEditingAnnotation ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={annotationDraft}
                onChange={(e) => setAnnotationDraft(e.target.value)}
                placeholder="Add your note here..."
                className="w-full min-h-[100px] text-[13px] p-3 rounded-lg border border-indigo-200 bg-indigo-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y shadow-inner transition-all placeholder:text-slate-400 font-medium leading-relaxed"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 mt-1">
                <button 
                  onClick={() => setIsEditingAnnotation(false)}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button 
                  onClick={() => {
                    onUpdateAnnotation(node.id, annotationDraft);
                    setIsEditingAnnotation(false);
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 rounded-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            node.annotations ? (
              <div className="bg-amber-50/50 border border-amber-200/60 text-amber-900 rounded-lg p-4 text-[13px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap">
                {node.annotations}
              </div>
            ) : (
              <div 
                className="border border-dashed border-slate-200 rounded-lg p-4 text-[12px] font-medium text-slate-400 text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors"
                onClick={() => setIsEditingAnnotation(true)}
              >
                Click to add a note or annotation to this node
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
