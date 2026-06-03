'use client';

import React, { useState } from 'react';
import { BarChart, TrendingUp } from 'lucide-react';

export default function TrendCharts({ chartsData }) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!chartsData || !chartsData.topics || !chartsData.topics.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-secondary-rgb))' }}>
        No visualization data available. Complete a search query to analyze trends.
      </div>
    );
  }

  const { topics, credibility } = chartsData;

  // Chart Dimensions
  const barChartHeight = 220;
  const barChartWidth = 460;
  const lineChartHeight = 220;
  const lineChartWidth = 460;

  // 1. Calculations for Topic Frequency Bar Chart (Horizontal)
  const maxTopicVal = Math.max(...topics.map(t => t.value), 1);
  const barPadding = 12;
  const barHeight = (barChartHeight - (topics.length * barPadding)) / topics.length;

  // 2. Calculations for Credibility Area/Line Chart
  const minCred = Math.min(...credibility.map(c => c.value), 60);
  const maxCred = 100;
  const points = credibility.map((c, i) => {
    // Distribute X evenly
    const x = 40 + (i * (lineChartWidth - 80) / Math.max(credibility.length - 1, 1));
    // Map Y (inverted since SVG 0 is top)
    const y = 30 + ((maxCred - c.value) * (lineChartHeight - 70) / (maxCred - minCred));
    return { x, y, name: c.name, val: c.value };
  });

  // Construct SVG Path for Line Chart
  const linePath = points.length > 0 
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') 
    : '';

  // Construct SVG Path for Area Fill under the line
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${lineChartHeight - 40} L ${points[0].x} ${lineChartHeight - 40} Z`
    : '';

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="responsive-charts-layout">
      
      {/* 1. Topic Frequency Bar Chart */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(var(--border-rgb), 0.15)', background: 'rgba(var(--card-bg-rgb), 0.3)' }}>
        <h3 className="cyber-font" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', color: 'rgb(var(--text-primary-rgb))' }}>
          <BarChart size={16} style={{ color: 'rgb(var(--color-accent-rgb))' }} />
          TOPIC INTENSITY & FREQUENCY
        </h3>

        <svg style={{ width: '100%', height: `${barChartHeight}px` }} viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}>
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(var(--color-primary-rgb))" />
              <stop offset="100%" stopColor="rgb(var(--color-accent-rgb))" />
            </linearGradient>
          </defs>

          {topics.map((t, idx) => {
            const y = idx * (barHeight + barPadding) + 10;
            const barWidth = ((barChartWidth - 140) * t.value) / maxTopicVal;
            const isHovered = hoveredBar === idx;

            return (
              <g 
                key={idx} 
                onMouseEnter={() => setHoveredBar(idx)} 
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Topic Label */}
                <text
                  x="10"
                  y={y + (barHeight / 2) + 4}
                  fill="rgb(var(--text-primary-rgb))"
                  fontSize="12px"
                  fontWeight="500"
                >
                  {t.name}
                </text>

                {/* Background Guide bar */}
                <rect
                  x="120"
                  y={y}
                  width={barChartWidth - 140}
                  height={barHeight}
                  rx="4"
                  fill="rgba(var(--border-rgb), 0.05)"
                />

                {/* Animated Foreground Fill bar */}
                <rect
                  x="120"
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill="url(#bar-grad)"
                  style={{
                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                    opacity: hoveredBar === null || isHovered ? 1 : 0.65,
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(var(--color-accent-rgb), 0.45))' : 'none'
                  }}
                />

                {/* Frequency Value Ticker */}
                <text
                  x={120 + barWidth + 10}
                  y={y + (barHeight / 2) + 4}
                  fill="rgb(var(--color-accent-rgb))"
                  fontSize="11px"
                  fontFamily="Orbitron, sans-serif"
                  fontWeight="bold"
                >
                  {t.value} {t.value === 1 ? 'pub' : 'pubs'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. Source Credibility Area Chart */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(var(--border-rgb), 0.15)', background: 'rgba(var(--card-bg-rgb), 0.3)' }}>
        <h3 className="cyber-font" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', color: 'rgb(var(--text-primary-rgb))' }}>
          <TrendingUp size={16} style={{ color: 'rgb(var(--color-purple-rgb))' }} />
          SOURCE CREDIBILITY SPECTRUM
        </h3>

        <svg style={{ width: '100%', height: `${lineChartHeight}px` }} viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`}>
          <defs>
            <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-purple-rgb))" />
              <stop offset="100%" stopColor="rgb(var(--color-primary-rgb))" />
            </linearGradient>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(var(--color-purple-rgb), 0.25)" />
              <stop offset="100%" stopColor="rgba(var(--color-primary-rgb), 0.0)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="40" y1="30" x2={lineChartWidth - 40} y2="30" stroke="rgba(var(--border-rgb), 0.07)" strokeWidth="1" />
          <line x1="40" y1={(lineChartHeight - 70) / 2 + 30} x2={lineChartWidth - 40} y2={(lineChartHeight - 70) / 2 + 30} stroke="rgba(var(--border-rgb), 0.07)" strokeWidth="1" />
          <line x1="40" y1={lineChartHeight - 40} x2={lineChartWidth - 40} y2={lineChartHeight - 40} stroke="rgba(var(--border-rgb), 0.15)" strokeWidth="1" />

          {/* Axis Labels */}
          <text x="15" y="34" fill="rgb(var(--text-secondary-rgb))" fontSize="9px" fontFamily="Orbitron, sans-serif">100</text>
          <text x="15" y={(lineChartHeight - 70) / 2 + 34} fill="rgb(var(--text-secondary-rgb))" fontSize="9px" fontFamily="Orbitron, sans-serif">{Math.round((maxCred + minCred)/2)}</text>
          <text x="15" y={lineChartHeight - 36} fill="rgb(var(--text-secondary-rgb))" fontSize="9px" fontFamily="Orbitron, sans-serif">{minCred}</text>

          {/* Filled Area */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#area-grad)"
              style={{
                transition: 'd 0.5s ease'
              }}
            />
          )}

          {/* Core Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#line-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'd 0.5s ease'
              }}
            />
          )}

          {/* Dots & Interactivity */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint === idx;
            
            return (
              <g 
                key={idx}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible hover helper */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="14"
                  fill="transparent"
                />

                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 4.5}
                  fill="#050508"
                  stroke={isHovered ? 'rgb(var(--color-accent-rgb))' : 'rgb(var(--color-purple-rgb))'}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 6px rgb(var(--color-accent-rgb)))' : 'none'
                  }}
                />

                {/* Dot Tooltip */}
                {isHovered && (
                  <g>
                    {/* Tooltip Background */}
                    <rect
                      x={p.x - 65}
                      y={p.y - 45}
                      width="130"
                      height="34"
                      rx="6"
                      fill="rgba(var(--card-bg-rgb), 0.95)"
                      stroke="rgba(var(--border-rgb), 0.3)"
                      strokeWidth="1"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))' }}
                    />
                    
                    {/* Tooltip Content */}
                    <text
                      x={p.x}
                      y={p.y - 32}
                      textAnchor="middle"
                      fill="rgb(var(--text-primary-rgb))"
                      fontSize="9px"
                      fontWeight="600"
                    >
                      {p.name}
                    </text>
                    <text
                      x={p.x}
                      y={p.y - 20}
                      textAnchor="middle"
                      fill="rgb(var(--color-accent-rgb))"
                      fontSize="10px"
                      fontFamily="Orbitron, sans-serif"
                      fontWeight="bold"
                    >
                      Credibility: {p.val}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

    </div>
  );
}
