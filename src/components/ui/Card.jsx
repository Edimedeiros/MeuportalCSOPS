import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
