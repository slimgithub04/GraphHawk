import React from 'react';
import { RunData } from '../types';
import { cn } from '../lib/utils';
import { Search, Filter, Plus, CheckCircle2, XCircle, AlertCircle, Clock, Zap } from 'lucide-react';

interface SidebarProps {
  runs: RunData[];
  selectedRunId: string | null;
  onSelectRun: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNewRecording: () => void;
}

export function Sidebar({ runs, selectedRunId, onSelectRun, searchQuery, setSearchQuery, onNewRecording }: SidebarProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="w-80 border-r border-zinc-200 bg-zinc-50 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-zinc-200 bg-white">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
           <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 flex flex-col">
             <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Runs Today</span>
             <span className="text-lg font-bold text-zinc-900">142</span>
           </div>
           <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex flex-col">
             <span className="text-[10px] text-rose-600 uppercase font-bold tracking-wider">Failure Rate</span>
             <span className="text-lg font-bold text-rose-700">4.2%</span>
           </div>
        </div>

        <button onClick={onNewRecording} className="w-full flex items-center justify-center gap-2 bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm mb-4">
          <Plus className="w-4 h-4" />
          Record New Run
        </button>

        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-2.5 top-2 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Run ID..." 
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all placeholder:text-zinc-400"
          />
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium hover:text-zinc-900 transition-colors">
             <Filter className="w-3 h-3" /> Filter
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          All Runs
        </div>
        <div className="flex flex-col gap-1 px-2 pb-4">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className={cn(
                "flex flex-col text-left px-3 py-2.5 rounded-md transition-all duration-200 border border-transparent",
                selectedRunId === run.id 
                  ? "bg-white border-zinc-200 shadow-sm ring-1 ring-zinc-900/5 relative before:absolute before:inset-y-2 before:left-0 before:w-1 before:bg-indigo-500 before:rounded-r-md" 
                  : "hover:bg-zinc-100 text-zinc-600"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-zinc-900">
                  {getStatusIcon(run.status)}
                  <span className="text-sm font-semibold">{run.id}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {new Date(run.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={cn("text-[13px] mb-2 line-clamp-2 leading-relaxed", selectedRunId === run.id ? "text-zinc-700" : "text-zinc-500")}>
                {run.title}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-auto">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>{run.stepsCount} stp</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{(run.totalLatencyMs / 1000).toFixed(1)}s</span>
                </div>
                <div className={cn("ml-auto font-medium", run.fidelityScore < 90 ? "text-amber-600" : "text-emerald-600")}>
                  {run.fidelityScore}% fid
                </div>
              </div>
            </button>
          ))}
          {runs.length === 0 && (
             <div className="p-4 text-center text-sm text-zinc-500">No runs match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
