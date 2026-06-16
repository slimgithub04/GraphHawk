import React from 'react';
import { Play, Pause, SkipBack, SkipForward, GitMerge, Settings2, ActivitySquare } from 'lucide-react';

interface BottomBarProps {
  onInjectFix: () => void;
  isReplaying: boolean;
  setIsReplaying: (val: boolean) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onToggleSettings: () => void;
  activeNodesCount: number;
  totalNodesCount: number;
  divergenceCount: number;
}

export function BottomBar({ onInjectFix, isReplaying, setIsReplaying, onStepBack, onStepForward, onToggleSettings, activeNodesCount, totalNodesCount, divergenceCount }: BottomBarProps) {
  return (
    <div className="h-16 border-t border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-[0_-4px_6px_-6px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md border border-zinc-200/50">
          <button onClick={onStepBack} className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-all">
            <SkipBack className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsReplaying(!isReplaying)}
            className="p-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-all shadow-sm"
          >
            {isReplaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current text-indigo-600" />}
          </button>
          <button onClick={onStepForward} className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-all">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 tracking-wide">
           <span className="flex items-center gap-1.5"><ActivitySquare className="w-4 h-4 text-zinc-400" /> Active Nodes: <span className="text-zinc-900 font-bold">{activeNodesCount}/{totalNodesCount}</span></span>
           {divergenceCount > 0 && (
             <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 shadow-sm"><GitMerge className="w-3.5 h-3.5" /> Divergence: {divergenceCount}</span>
           )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onToggleSettings} className="flex items-center justify-center p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all" title="Graph Layout Config">
          <Settings2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onInjectFix}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-black border border-transparent rounded-md shadow-md shadow-zinc-900/10 transition-all"
        >
          <GitMerge className="w-4 h-4" />
          Inject Fix Here
        </button>
      </div>
    </div>
  );
}
