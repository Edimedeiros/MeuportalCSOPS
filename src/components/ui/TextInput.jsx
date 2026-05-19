import React from "react";

export default function TextInput({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      )}
      <input
        {...props}
        className={`w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 ${
          Icon ? "pl-10 " : ""
        }${className}`}
      />
    </div>
  );
}
