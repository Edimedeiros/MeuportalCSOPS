import React from "react";
import { Card, CardContent } from "../ui/Card.jsx";
import { pieColors } from "../../data/mockData.js";

function BarRow({ label, value, max, index }) {
  const color = pieColors[index % pieColors.length];
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <strong className="text-stone-900">{value}</strong>
      </div>
      <div className="h-3 rounded-full bg-stone-100">
        <div
          className="h-3 rounded-full"
          style={{
            width: Math.max(8, (value / Math.max(max, 1)) * 100) + "%",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export default function ListRanking({ title, icon: Icon, data = [] }) {
  const max = Math.max(...data.map((item) => item[1] || 0), 1);

  return (
    <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <h4 className="mb-4 flex items-center gap-2 font-semibold text-stone-900">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h4>
        <div className="space-y-3">
          {data.length ? (
            data.map(([name, value], index) => (
              <BarRow key={name} label={name} value={value} max={max} index={index} />
            ))
          ) : (
            <p className="text-sm text-stone-500">Sem dados ainda.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
