import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function StorageCharts({ data }) {
  if (!data) return <p className="text-center text-gray-500">Loading charts...</p>;

  const chartData = data.map((s) => ({
    name: s.name,
    value: Number(s.used.toFixed(2)),
    color: s.color,
  }));

  const totalUsed = chartData.reduce((sum, i) => sum + i.value, 0);
  if (totalUsed === 0)
    return <p className="text-center text-gray-500">No usage data available.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value.toFixed(1)} GB`}
              outerRadius={130}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v.toFixed(2)} GB`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default StorageCharts;
