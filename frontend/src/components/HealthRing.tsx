

interface HealthRingProps {
    value: number; // 0-100
}

export default function HealthRing({ value }: HealthRingProps) {
    const clampedValue = Math.max(0, Math.min(100, value));

    // Semi-circle gauge parameters
    const size = 200;
    const strokeWidth = 16;
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size - strokeWidth) / 2;

    // Arc sweep: 240° centered at top (from 150° to 390°)
    const startAngle = 150;
    const sweepAngle = 240;
    const endAngle = startAngle + sweepAngle;

    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

    const arcPoint = (angle: number) => ({
        x: cx + radius * Math.cos(toRad(angle)),
        y: cy + radius * Math.sin(toRad(angle)),
    });

    const makeArc = (fromAngle: number, toAngle: number) => {
        const start = arcPoint(fromAngle);
        const end = arcPoint(toAngle);
        const sweep = toAngle - fromAngle;
        const largeArc = sweep > 180 ? 1 : 0;
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    const valueAngle = startAngle + (clampedValue / 100) * sweepAngle;

    // Color: green for high, orange for mid, red for low
    const getColor = (v: number) => {
        if (v >= 80) return '#22c55e';
        if (v >= 60) return '#3478F6';
        if (v >= 40) return '#F5A623';
        if (v >= 20) return '#f97316';
        return '#ef4444';
    };

    const color = getColor(clampedValue);

    // Viewbox has generous padding to not clip the stroke or round caps
    const pad = strokeWidth;
    const vb = `${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`;

    // Bottom-center point of the arc for positioning text
    const bottomY = arcPoint(startAngle).y;

    return (
        <div className="health-ring-container">
            <svg
                width={size}
                height={bottomY + strokeWidth + 10}
                viewBox={vb}
                style={{ overflow: 'visible' }}
            >
                {/* Background track */}
                <path
                    d={makeArc(startAngle, endAngle)}
                    fill="none"
                    stroke="#e8ecf1"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Value arc */}
                {clampedValue > 1 && (
                    <path
                        d={makeArc(startAngle, valueAngle)}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke 0.6s ease',
                            filter: `drop-shadow(0 2px 6px ${color}50)`,
                        }}
                    />
                )}
                {/* Center text inside SVG for perfect alignment */}
                <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: 44,
                        fontWeight: 800,
                        fontFamily: "'Inter', sans-serif",
                        fill: color,
                        transition: 'fill 0.6s ease',
                    }}
                >
                    {Math.round(clampedValue)}%
                </text>
            </svg>
        </div>
    );
}
