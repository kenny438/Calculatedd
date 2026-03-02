import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../lib/utils";

interface PortfolioChartProps {
  data: { balance: number; timestamp: string }[];
}

export function PortfolioChart({ data }: PortfolioChartProps) {
  if (data.length < 2) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-sm font-bold text-gray-400">Not enough data to show performance chart yet.</p>
        <p className="text-[10px] font-medium text-gray-400 mt-1">Keep trading and check back in a few hours!</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(d.timestamp).toLocaleDateString()
  }));

  return (
    <div className="h-64 w-full -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} 
            minTickGap={30}
            dy={10}
          />
          <YAxis 
            domain={['auto', 'auto']}
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} 
            tickFormatter={(val) => `${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', padding: '12px' }}
            formatter={(val: number) => [formatCurrency(val), 'Balance']}
            labelStyle={{ color: '#6b7280', marginBottom: '4px', fontSize: '10px', fontWeight: 700 }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#059669" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
