'use client';

import React from 'react';
import { NodeEvaluationResult } from '@/lib/dag/types';
import { Check, X, HelpCircle, Minus } from 'lucide-react';

interface TreeNodeCardProps {
  result: NodeEvaluationResult;
  depth?: number;
}

export function TreeNodeCard({ result, depth = 0 }: TreeNodeCardProps) {
  const isLogical = result.nodeType === 'LOGICAL';

  const getStatusBadge = () => {
    switch (result.status) {
      case 'PASSED':
        return {
          icon: <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />,
          bg: 'bg-emerald-100 border-emerald-500 text-emerald-900',
          dot: 'bg-emerald-600',
          border: 'border-emerald-500/70 shadow-[2px_2px_0px_0px_#10b981]',
          label: 'SATISFIED',
        };
      case 'FAILED':
        return {
          icon: <X className="w-3.5 h-3.5 text-red-700 stroke-[3]" />,
          bg: 'bg-red-100 border-red-500 text-red-900',
          dot: 'bg-red-600',
          border: 'border-red-500/70 shadow-[2px_2px_0px_0px_#ef4444]',
          label: 'VIOLATED',
        };
      case 'MISSING_DATA':
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-700 stroke-[3]" />,
          bg: 'bg-amber-100 border-amber-500 text-amber-900',
          dot: 'bg-amber-600',
          border: 'border-amber-500/70 shadow-[2px_2px_0px_0px_#f59e0b]',
          label: 'DATA REQUIRED',
        };
      case 'PRUNED':
        return {
          icon: <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[3]" />,
          bg: 'bg-slate-100 border-slate-400 text-slate-700',
          dot: 'bg-slate-400',
          border: 'border-slate-300 shadow-none opacity-60',
          label: 'PRUNED',
        };
    }
  };

  const badge = getStatusBadge();

  if (isLogical) {
    return (
      <div className={`space-y-3 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-foreground/20' : ''}`}>
        {/* Logical Header */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase border-2 shadow-[2px_2px_0px_0px_var(--foreground)] ${
              result.operator === 'AND'
                ? 'bg-blue-100 text-blue-900 border-blue-600'
                : result.operator === 'OR'
                ? 'bg-purple-100 text-purple-900 border-purple-600'
                : 'bg-amber-100 text-amber-900 border-amber-600'
            }`}
          >
            {result.operator || 'AND'} CLAUSE
          </span>

          <span className="text-xs font-bold text-foreground font-serif">
            {result.label}
          </span>

          <span className={`ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {/* Children AST nodes */}
        {result.children && result.children.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {result.children.map((child) => (
              <TreeNodeCard key={child.nodeId} result={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Comparison Leaf Node
  return (
    <div
      className={`p-3.5 rounded-xl border-2 bg-card transition-all ${badge.border} ${
        depth > 0 ? 'ml-2' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${badge.bg} mt-0.5`}
          >
            {badge.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-foreground">
                {result.label}
              </span>
              {result.operator && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded border border-foreground/20 text-muted-foreground font-bold">
                  {result.operator} {Array.isArray(result.expectedValue) ? result.expectedValue.join(', ') : String(result.expectedValue ?? '')}
                  {result.unit ? ` ${result.unit}` : ''}
                </span>
              )}
            </div>

            <p className="text-xs text-foreground/80 mt-1 leading-snug">
              {result.explanation}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badge.bg}`}>
            {badge.label}
          </span>
          {result.actualValue !== undefined && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              Actual: <strong className="text-foreground">{String(result.actualValue)}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

