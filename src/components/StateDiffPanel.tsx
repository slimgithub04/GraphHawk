import React from 'react';
import { diffJson, Change } from 'diff';
import { cn } from '../lib/utils';

interface StateDiffPanelProps {
  previousState: object;
  currentState: object;
}

export function StateDiffPanel({ previousState, currentState }: StateDiffPanelProps) {
  const differences: Change[] = diffJson(previousState, currentState);

  return (
    <div className="bg-slate-50 rounded-lg overflow-x-auto border border-slate-200/80 shadow-sm text-[12px] font-mono leading-relaxed">
      <div className="flex flex-col min-w-max p-4">
        {differences.map((part, index) => {
          if (!part.added && !part.removed) {
            return (
              <div key={index} className="text-slate-500 opacity-70 whitespace-pre">
                {part.value}
              </div>
            );
          }

          const lines = part.value.replace(/\n$/, '').split('\n');

          return lines.map((line, lineIndex) => (
            <div
              key={`${index}-${lineIndex}`}
              className={cn(
                "whitespace-pre px-1.5 rounded-sm my-px flex",
                part.added ? "bg-emerald-100/50 text-emerald-800" : "bg-rose-100/50 text-rose-800"
              )}
            >
              <span className="w-4 inline-block select-none font-bold opacity-50 mr-2 shrink-0 text-center">
                {part.added ? '+' : '-'}
              </span>
              <span>{line}</span>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
