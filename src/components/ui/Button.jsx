import React from "react";

export default function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
  type = "button",
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    default: "bg-stone-950 text-white hover:bg-stone-800",
    outline:
      "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50",
    ghost: "text-stone-600 hover:bg-stone-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
}
