import React from "react";

export default function MetricCard({ icon: Icon, label, value, hint, negative }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${
          negative ? "bg-red-50 text-red-700" : "bg-stone-100 text-stone-700"
        }`}
      >
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <p className="text-2xl font-semibold text-stone-950">{value}</p>
      <p className="text-sm font-medium text-stone-700">{label}</p>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}
