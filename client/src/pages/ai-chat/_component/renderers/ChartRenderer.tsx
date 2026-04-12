import React, { useEffect, useState } from 'react'
import { ChartResponse, ChartSeries, PieSeries } from '../../types';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { CHART_COLORS } from '@/constant';
import SuggestionsBar from './SuggestionBar';
import { renderMarkdown } from '../../renders';

const ChartRenderer: React.FC<{ data: ChartResponse; onSuggest?: (prompt: string) => void }> = ({ data, onSuggest }) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
    
    const isPie = data.chart_type === "pie" || data.chart_type === "donut";
    const containerStyle = { opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)", transition: "opacity 0.5s ease, transform 0.5s ease" };

    if (isPie) {
        const series = data.series as PieSeries[];
        const total = series.reduce((s, d) => s + d.value, 0);
        return (
            <div className="space-y-3">
                {data.title && <p className="text-sm font-semibold" style={{ animation: "fadeSlideIn 0.3s ease both" }}>{data.title}</p>}
                <div className="h-56" style={containerStyle}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={series} dataKey="value" nameKey="name" cx="50%" cy="50%"
                                innerRadius={data.chart_type === "donut" ? 55 : 0} outerRadius={85} paddingAngle={2}
                                isAnimationActive animationBegin={0} animationDuration={900} animationEasing="ease-out">
                                {series.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()} (${((val / total) * 100).toFixed(1)}%)`, ""]} contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                            <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {data.message && mounted && <p className="text-xs text-muted-foreground" style={{ animation: "fadeSlideIn 0.4s ease 0.6s both" }}>{renderMarkdown(data.message)}</p>}
                {data.suggestions && mounted && onSuggest && <SuggestionsBar suggestions={data.suggestions} onSelect={onSuggest} delay={700} />}
            </div>
        );
    }

    const seriesData = data.series as ChartSeries[];
    const allX = Array.from(new Set(seriesData.flatMap((s) => s.data.map((d) => d.x))));
    const chartData = allX.map((x) => {
        const row: Record<string, string | number> = { x };
        seriesData.forEach((s) => { const pt = s.data.find((d) => d.x === x); row[s.name] = pt ? pt.y : 0; });
        return row;
    });
    const shared = { data: chartData, margin: { top: 4, right: 8, left: -16, bottom: 0 } };
    const xA = { dataKey: "x", tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" }, axisLine: false, tickLine: false };
    const yA = { tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" }, axisLine: false, tickLine: false, tickFormatter: (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` };
    const tt = { contentStyle: { borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }, formatter: (v: number) => [`$${v.toLocaleString()}`, ""] };
    const lg = { iconType: "circle" as const, iconSize: 8, formatter: (v: string) => <span className="text-xs text-muted-foreground">{v}</span> };

    return (
        <div className="space-y-3">
            {data.title && <p className="text-sm font-semibold" style={{ animation: "fadeSlideIn 0.3s ease both" }}>{data.title}</p>}
            <div className="h-56" style={containerStyle}>
                <ResponsiveContainer width="100%" height="100%">
                    {data.chart_type === "bar" ? (
                        <BarChart {...shared}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis {...xA} /><YAxis {...yA} /><Tooltip {...tt} /><Legend {...lg} />
                            {seriesData.map((s, i) => <Bar key={s.name} dataKey={s.name} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive animationBegin={i * 100} animationDuration={800} animationEasing="ease-out" />)}
                        </BarChart>
                    ) : (
                        <LineChart {...shared}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis {...xA} /><YAxis {...yA} /><Tooltip {...tt} /><Legend {...lg} />
                            {seriesData.map((s, i) => <Line key={s.name} type="monotone" dataKey={s.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive animationBegin={i * 80} animationDuration={900} animationEasing="ease-out" />)}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
            {data.message && mounted && <p className="text-xs text-muted-foreground" style={{ animation: "fadeSlideIn 0.4s ease 0.6s both" }}>{renderMarkdown(data.message)}</p>}
            {data.suggestions && mounted && onSuggest && <SuggestionsBar suggestions={data.suggestions} onSelect={onSuggest} delay={700} />}
        </div>
    );
}

export default ChartRenderer