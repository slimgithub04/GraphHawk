import React from 'react';
import { RunData } from '../types';
import { cn } from '../lib/utils';
import { Search, Plus, Database } from 'lucide-react';

interface SidebarProps {
  runs: RunData[];
  selectedRunId: string | null;
  onSelectRun: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNewRecording: () => void;
  onSeedNeo4j?: () => void;
}

export function Sidebar({ runs, selectedRunId, onSelectRun, searchQuery, setSearchQuery, onNewRecording, onSeedNeo4j }: SidebarProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': 
        return <span className="bg-[#10b981] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase shadow-sm">Success</span>;
      case 'failed': 
        return <span className="bg-[#f43f5e] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase shadow-sm">Failed</span>;
      case 'warning': 
        return <span className="bg-[#f59e0b] text-white px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase shadow-sm">Warning</span>;
      default: 
        return null;
    }
  };

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
        <button onClick={onNewRecording} className="w-full flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white py-2.5 rounded-lg text-[15px] font-semibold transition-all shadow-md shadow-slate-900/10 active:scale-[0.98]">
          <Plus className="w-4 h-4 stroke-[3px]" />
          Record New Run
        </button>
        
        {onSeedNeo4j && (
          <button onClick={onSeedNeo4j} className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.98]">
            <Database className="w-3.5 h-3.5" />
            Seed Neo4j Database
          </button>
        )}

        <div className="relative pt-2">
          <Search className="w-4 h-4 absolute left-3 top-4.5 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search runs..." 
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[15px] focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className={cn(
                "flex flex-col items-start px-5 py-4 border-b border-slate-100 transition-all duration-200 text-left",
                selectedRunId === run.id 
                  ? "bg-indigo-50/40 border-l-4 border-l-indigo-600" 
                  : "bg-white border-l-4 border-l-transparent hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={cn("text-[16px] font-bold tracking-tight truncate pr-2 transition-colors", selectedRunId === run.id ? "text-indigo-950" : "text-slate-900")} title={run.title}>{run.id.toLowerCase()}</span>
                {getStatusBadge(run.status)}
              </div>
              
              <div className="text-[14px] text-slate-400 mb-1">
                {run.date.replace('T', ' ').substring(0, 19)}
              </div>
              
              <div className={cn("text-[14px] font-medium transition-colors", selectedRunId === run.id ? "text-indigo-600/80" : "text-slate-400")}>
                {run.stepsCount} steps &middot; {run.totalLatencyMs}ms
              </div>
            </button>
          ))}
          {runs.length === 0 && (
             <div className="p-6 text-center text-[15px] text-slate-400">No runs match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
