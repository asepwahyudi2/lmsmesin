import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-slate-800 rounded-lg w-1/3"></div>
        <div className="h-4 bg-slate-800 rounded-lg w-1/4"></div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 h-28 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-700 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-700 rounded-lg w-1/2"></div>
              <div className="h-6 bg-slate-700 rounded-lg w-3/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Split Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700/50 rounded-xl p-5 h-80 space-y-4">
          <div className="h-6 bg-slate-700 rounded-lg w-1/4"></div>
          <div className="h-px bg-slate-700"></div>
          <div className="space-y-2">
            <div className="h-12 bg-slate-700/60 rounded-lg w-full"></div>
            <div className="h-12 bg-slate-700/60 rounded-lg w-full"></div>
            <div className="h-12 bg-slate-700/60 rounded-lg w-full"></div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-5 h-80 space-y-4">
          <div className="h-6 bg-slate-700 rounded-lg w-1/3"></div>
          <div className="h-px bg-slate-700"></div>
          <div className="space-y-2">
            <div className="h-8 bg-slate-700/60 rounded-lg w-full"></div>
            <div className="h-8 bg-slate-700/60 rounded-lg w-full"></div>
            <div className="h-8 bg-slate-700/60 rounded-lg w-full"></div>
            <div className="h-8 bg-slate-700/60 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
