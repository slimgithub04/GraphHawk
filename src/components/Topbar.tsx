import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Play, Download, Pause, FileJson, Image, Code2, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopbarProps {
  onNewRecording: () => void;
  onStartReplay: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onExportMermaid: () => void;
  onExportMarkdown: () => void;
  isReplaying: boolean;
  fidelityScore: number;
}

export function Topbar({ onStartReplay, onExportJson, onExportPng, onExportMermaid, onExportMarkdown, isReplaying, fidelityScore }: TopbarProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-[#0f172a] p-1.5 rounded-md shadow-sm">
          <LayoutGrid className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-2 text-sm ml-1">
          <h1 className="font-bold text-slate-900 tracking-tight text-[15px]">AgentBlackBox</h1>
          <span className="text-slate-300 font-light">/</span>
          <p className="text-slate-500 font-semibold text-[13px]">Agent Execution Tracer</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
         {fidelityScore > 0 && (
           <div className={cn("flex items-center gap-2 mr-3 border px-3 py-1 rounded-full shadow-sm",
             fidelityScore >= 90 ? "bg-emerald-50 border-emerald-200" : (fidelityScore >= 70 ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200")
           )}>
             <span className={cn("text-[10px] uppercase tracking-wider font-bold", fidelityScore >= 90 ? "text-emerald-700" : (fidelityScore >= 70 ? "text-amber-700" : "text-rose-700"))}>Fidelity</span>
             <span className={cn("text-xs font-black", fidelityScore >= 90 ? "text-emerald-700" : (fidelityScore >= 70 ? "text-amber-700" : "text-rose-700"))}>{fidelityScore}%</span>
           </div>
         )}
        
        <button onClick={onStartReplay} className={cn("flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold text-white border border-transparent rounded-lg transition-all shadow-sm active:scale-[0.98]",
           isReplaying ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-500/20"
        )}>
          {isReplaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {isReplaying ? "Stop Replay" : "Start Replay"}
        </button>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} 
            className={cn("flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all border border-transparent", isExportMenuOpen && "bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm")} 
            title="Export Options"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-zinc-200 rounded-lg shadow-xl shadow-zinc-200/50 py-1.5 z-50 overflow-hidden transform origin-top-right transition-all">
              <button onClick={() => { onExportJson(); setIsExportMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                <FileJson className="w-4 h-4 text-zinc-400" /> Export JSON Trace
              </button>
              <button onClick={() => { onExportPng(); setIsExportMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                <Image className="w-4 h-4 text-zinc-400" /> Export Graph as PNG
              </button>
              <button onClick={() => { onExportMermaid(); setIsExportMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                <Code2 className="w-4 h-4 text-zinc-400" /> Copy Mermaid.js
              </button>
              <button onClick={() => { onExportMarkdown(); setIsExportMenuOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                <FileText className="w-4 h-4 text-zinc-400" /> Copy Markdown Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
