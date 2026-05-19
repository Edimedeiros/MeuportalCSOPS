import React from "react";

export function Help({ text }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-stone-300 bg-white text-[10px] font-semibold italic text-stone-500">
        i
      </span>
      <span className="pointer-events-none absolute left-1/2 top-7 z-30 hidden w-64 -translate-x-1/2 rounded-2xl border border-stone-200 bg-white p-3 text-xs font-normal leading-5 text-stone-600 shadow-xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

export function Label({ children, help, required = true }) {
  return (
    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-stone-700">
      {children}
      {required && <span className="text-red-500">*</span>}
      {help && <Help text={help} />}
    </label>
  );
}
