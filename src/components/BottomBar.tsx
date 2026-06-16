import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, GitMerge, LayoutTemplate, ActivitySquare } from 'lucide-react';

interface BottomBarProps {
  onInjectFix: () => void;
  isReplaying: boolean;
  setIsReplaying: (val: boolean) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  layoutName: string;
  setLayoutName: (val: string) => void;
  activeNodesCount: number;
  totalNodesCount: number;
  divergenceCount: number;
}

export function BottomBar({ onInjectFix, isReplaying, setIsReplaying, onStepBack, onStepForward, layoutName, setLayoutName, activeNodesCount, totalNodesCount, divergenceCount }: BottomBarProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLayoutMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const layouts = [
    { id: 'dagre', name: 'Hierarchical (Dagre)' },
    { id: 'cose', name: 'Force-Directed (Cose)' },
    { id: 'grid', name: 'Grid' },
    { id: 'concentric', name: 'Concentric' },
    { id: 'breadthfirst', name: 'Tree (Breadthfirst)' },
  ];

  return (
    <div className="h-16 border-t border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_-4px_10px_-6px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 shadow-sm">
          <button onClick={onStepBack} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-all">
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          <button 
            onClick={() => setIsReplaying(!isReplaying)}
            className="p-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-all shadow-sm border border-slate-200"
          >
            {isReplaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button onClick={onStepForward} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-all">
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-[13px] font-semibold text-slate-500 tracking-wide">
           <span className="flex items-center gap-1.5"><ActivitySquare className="w-4 h-4 text-slate-400" /> Active Nodes: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">{activeNodesCount}/{totalNodesCount}</span></span>
           {divergenceCount > 0 && (
             <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 shadow-sm"><GitMerge className="w-3.5 h-3.5" /> Divergence: {divergenceCount}</span>
           )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowLayoutMenu(!showLayoutMenu)} 
            className={`flex items-center gap-2 px-3 py-2 text-[13px] font-semibold rounded-lg transition-all border ${showLayoutMenu ? 'bg-slate-100 text-slate-900 border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent hover:border-slate-200'}`}
            title="Graph Layout"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span className="hidden sm:inline">Layout</span>
          </button>
          
          {showLayoutMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden py-1">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">Graph Layout</div>
              {layouts.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setLayoutName(l.id); setShowLayoutMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 transition-colors ${layoutName === l.id ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={onInjectFix}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 border border-transparent rounded-lg shadow-sm shadow-rose-500/20 active:scale-[0.98] transition-all"
        >
          <GitMerge className="w-4 h-4" />
          Inject Fix
        </button>
      </div>
    </div>
  );
}
