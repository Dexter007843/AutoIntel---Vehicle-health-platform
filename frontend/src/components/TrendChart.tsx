import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { getHistory } from '../intelligence/anomalyDetector';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendChartProps {
    params: string[];
    labels: Record<string, string>;
    colors?: string[];
    title?: string;
    height?: number;
}

export default function TrendChart({ params, labels, colors, title, height = 200 }: TrendChartProps) {
    const defaultColors = ['#3478F6', '#F5A623', '#ef4444', '#22c55e', '#8b5cf6', '#06b6d4'];

    const datasets = params.map((p, i) => {
        const hist = getHistory(p);
        const color = colors?.[i] || defaultColors[i % defaultColors.length];
        return {
            label: labels[p] || p,
            data: hist.length > 0 ? hist : [],
            borderColor: color,
            backgroundColor: color + '15',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
        };
    });

    const maxLen = Math.max(...datasets.map(d => d.data.length), 1);

    const data = {
        labels: Array.from({ length: maxLen }, (_, i) => {
            const secondsAgo = (maxLen - i) * 2;
            return secondsAgo < 60 ? `-${secondsAgo}s` : `-${Math.round(secondsAgo / 60)}m`;
        }),
        datasets,
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
            legend: { position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } },
            title: title ? { display: true, text: title, font: { size: 13, weight: '600' } } : undefined,
            tooltip: { mode: 'index' as const, intersect: false },
        },
        scales: {
            x: { display: true, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
            y: { display: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
        },
        interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    };

    if (datasets.every(d => d.data.length === 0)) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                Collecting data...
            </div>
        );
    }

    return (
        <div style={{ height }}>
            <Line data={data} options={options} />
        </div>
    );
}
