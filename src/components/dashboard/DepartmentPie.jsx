import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  Sector,
} from "recharts";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import { pieColors } from "../../data/mockData.js";

function activePieShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 10}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export default function DepartmentPie({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = data.reduce((sum, item) => sum + (item[1] || 0), 0);
  const chartData = data.map(([name, value]) => ({
    name,
    value,
    percent: total ? Math.round((value / total) * 100) : 0,
  }));

  return (
    <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <h4 className="mb-4 flex items-center gap-2 font-semibold text-stone-900">
          <Building2 className="h-4 w-4" />
          Setores que mais enviam demandas
        </h4>
        {chartData.length ? (
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={92}
                    activeIndex={activeIndex}
                    activeShape={activePieShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    formatter={(value, name, item) => [
                      `${value} chamados — ${item.payload.percent}%`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 self-center">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl bg-stone-50 p-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-stone-700">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: pieColors[index % pieColors.length],
                      }}
                    />
                    {item.name}
                  </span>
                  <strong className="text-stone-900">
                    {item.value} — {item.percent}%
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Sem dados ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
