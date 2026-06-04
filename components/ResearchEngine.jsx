'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, ShieldAlert, Cpu, BarChart2, CheckCircle, Network, Layers, Sparkles, AlertCircle } from 'lucide-react';

export default function ResearchEngine({ query, activeStep, papersDiscovered, graphData, progress, streamingInsights, searchScope }) {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState({ papers: 0, sources: 0, confidence: 0 });
  const [nodes, setNodes] = useState([]);
  
  // 1. Canvas Particle Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 450;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const particles = [];
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height + canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 1.2 + 0.3),
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#14f0a0' : '#38bdf8' // Accent green or primary blue
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        
        // Loop particles to bottom if they escape top
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      });
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(drawParticles);
    };
    
    drawParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 2. Count up animations for progress statistics
  useEffect(() => {
    if (!progress) return;

    const duration = 2500; // 2.5s count up
    const startTime = performance.now();

    const animateStats = (now) => {
      const elapsed = now - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuad
      const easedProgress = progressRatio * (2 - progressRatio);

      setStats({
        papers: Math.round(easedProgress * progress.count),
        sources: Math.round(easedProgress * (progress.count * 6.2)), // estimate scanned sources
        confidence: Math.round(easedProgress * progress.confidence)
      });

      if (progressRatio < 1) {
        requestAnimationFrame(animateStats);
      }
    };

    requestAnimationFrame(animateStats);
  }, [progress]);

  // 3. Simulated/Dynamic Knowledge Graph floating effect
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;
    
    // Assign random starting coordinates and velocities to nodes for floating
    const initialNodes = graphData.nodes.map((node, i) => {
      let x = 200, y = 200;
      
      // Separate nodes spatially by type
      if (node.id === 'query') {
        x = 250;
        y = 200;
      } else if (node.type === 'source') {
        const angle = (i * 2 * Math.PI) / graphData.nodes.length;
        x = 250 + Math.cos(angle) * 140;
        y = 200 + Math.sin(angle) * 140;
      } else {
        const angle = (i * 2 * Math.PI) / graphData.nodes.length + 0.5;
        x = 250 + Math.cos(angle) * 80;
        y = 200 + Math.sin(angle) * 80;
      }

      return {
        ...node,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15
      };
    });

    setNodes(initialNodes);

    let frameId;
    const updateFloat = () => {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          // Bounce off artificial boundaries
          let vx = n.vx;
          let vy = n.vy;
          let x = n.x + vx;
          let y = n.y + vy;

          if (x < 30 || x > 470) vx = -vx;
          if (y < 30 || y > 370) vy = -vy;

          return { ...n, x, y, vx, vy };
        })
      );
      frameId = requestAnimationFrame(updateFloat);
    };

    frameId = requestAnimationFrame(updateFloat);
    return () => cancelAnimationFrame(frameId);
  }, [graphData]);

  // Helper: Get node by ID
  const findNode = (id) => nodes.find((n) => n.id === id) || { x: 250, y: 200 };

  const stepsList = [
    { key: 'searching', label: 'Searching papers...', icon: Search, desc: 'Querying academic journals & papers' },
    { key: 'analyzing', label: 'Analyzing sources...', icon: Cpu, desc: 'Evaluating author reputation & citations' },
    { key: 'trends', label: 'Detecting trends...', icon: BarChart2, desc: 'Clustering topics and mapping dates' },
    { key: 'generating', label: 'Generating insights...', icon: Sparkles, desc: 'Synthesizing report and literature review' }
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(var(--border-rgb), 0.25)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <div className="responsive-engine-layout" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Left Side: Steps Progress & Discovered Papers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 className="cyber-font" style={{ fontSize: '18px', color: 'rgb(var(--color-accent-rgb))', textShadow: '0 0 10px rgba(var(--color-accent-rgb), 0.2)', marginBottom: '8px' }}>
              RESEARCH ENGINE ACTIVE
            </h3>
            <p style={{ color: 'rgb(var(--text-secondary-rgb))', fontSize: '14px' }}>
              Query: <span style={{ color: 'rgb(var(--text-primary-rgb))', fontWeight: '500' }}>&quot;{query}&quot;</span>
            </p>
          </div>

          {/* Search Scope Notification */}
          {searchScope && searchScope.message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: searchScope.beyondThirtyDays 
                ? 'rgba(251, 146, 60, 0.1)' 
                : 'rgba(34, 197, 94, 0.1)',
              border: searchScope.beyondThirtyDays
                ? '1px solid rgba(251, 146, 60, 0.3)'
                : '1px solid rgba(34, 197, 94, 0.3)',
              animation: 'fade-in 0.5s ease-in'
            }}>
              <AlertCircle 
                size={18} 
                style={{ 
                  color: searchScope.beyondThirtyDays ? '#fb923c' : '#22c55e',
                  flexShrink: 0 
                }} 
              />
              <p style={{
                fontSize: '13px',
                color: searchScope.beyondThirtyDays 
                  ? 'rgba(251, 146, 60, 0.9)' 
                  : 'rgba(34, 197, 94, 0.9)',
                margin: 0
              }}>
                {searchScope.message}
              </p>
            </div>
          )}

          {/* Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stepsList.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.key;
              const isCompleted = stepsList.findIndex(s => s.key === activeStep) > stepsList.findIndex(s => s.key === step.key);
              
              return (
                <div 
                  key={step.key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(var(--color-accent-rgb), 0.08)' : 'rgba(var(--card-bg-rgb), 0.3)',
                    border: isActive ? '1px solid rgba(var(--color-accent-rgb), 0.3)' : '1px solid rgba(var(--border-rgb), 0.1)',
                    opacity: isActive || isCompleted ? 1 : 0.45,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isCompleted ? 'rgba(var(--color-accent-rgb), 0.15)' : isActive ? 'rgba(var(--color-primary-rgb), 0.2)' : 'rgba(var(--border-rgb), 0.1)',
                    color: isCompleted ? 'rgb(var(--color-accent-rgb))' : isActive ? 'rgb(var(--color-primary-rgb))' : 'rgb(var(--text-secondary-rgb))',
                    boxShadow: isActive ? '0 0 10px rgba(var(--color-primary-rgb), 0.2)' : 'none'
                  }}>
                    {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} className={isActive ? 'animate-pulse-glow' : ''} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: isActive ? 'rgb(var(--color-accent-rgb))' : 'inherit' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgb(var(--text-secondary-rgb))' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Discovered Papers Ticker */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(var(--bg-secondary-rgb), 0.3)', border: '1px solid rgba(var(--border-rgb), 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'rgb(var(--text-primary-rgb))' }}>
              <Layers size={14} style={{ color: 'rgb(var(--color-accent-rgb))' }} />
              DISCOVERED SOURCE STACKS
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }} className="custom-scroll">
              {papersDiscovered && papersDiscovered.length > 0 ? (
                papersDiscovered.map((paper, idx) => (
                  <div key={paper.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 8px', background: 'rgba(var(--card-bg-rgb), 0.4)', borderRadius: '6px', borderLeft: '3px solid rgb(var(--color-primary-rgb))' }} className="animate-slide-up">
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      <span style={{ color: 'rgb(var(--text-secondary-rgb))', marginRight: '4px' }}>[{idx + 1}]</span>
                      <strong>{paper.title}</strong>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      background: 'rgba(var(--color-accent-rgb), 0.15)', 
                      color: 'rgb(var(--color-accent-rgb))', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {paper.credibility}% CR
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'rgb(var(--text-secondary-rgb))', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>
                  Scanning database networks...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Graph Visualization & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SVG Knowledge Graph */}
          <div style={{ background: 'rgba(5, 5, 8, 0.4)', border: '1px solid rgba(var(--border-rgb), 0.15)', borderRadius: '12px', height: '260px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', zIndex: 2, background: 'rgba(var(--bg-secondary-rgb), 0.8)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(var(--border-rgb), 0.1)' }}>
              <Network size={12} style={{ color: 'rgb(var(--color-accent-rgb))' }} />
              <span className="cyber-font" style={{ fontSize: '10px' }}>KNOWLEDGE MAP</span>
            </div>

            {nodes.length > 0 ? (
              <svg style={{ width: '100%', height: '100%' }}>
                {/* Connection lines */}
                {graphData.links.map((link, idx) => {
                  const src = findNode(link.source);
                  const tgt = findNode(link.target);
                  return (
                    <line
                      key={idx}
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="rgba(var(--color-primary-rgb), 0.25)"
                      strokeWidth="1.2"
                      strokeDasharray="4, 4"
                      style={{ animation: 'shimmer 10s infinite linear' }}
                    />
                  );
                })}

                {/* Nodes drawing */}
                {nodes.map((node) => (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                      r={node.size}
                      fill={
                        node.type === 'core'
                          ? 'rgba(var(--color-accent-rgb), 0.8)'
                          : node.type === 'source'
                          ? 'rgba(var(--color-primary-rgb), 0.7)'
                          : 'rgba(var(--color-purple-rgb), 0.7)'
                      }
                      stroke="#fff"
                      strokeWidth="1"
                      style={{
                        filter: `drop-shadow(0 0 6px ${
                          node.type === 'core'
                            ? 'rgba(var(--color-accent-rgb), 0.8)'
                            : node.type === 'source'
                            ? 'rgba(var(--color-primary-rgb), 0.6)'
                            : 'rgba(var(--color-purple-rgb), 0.6)'
                        })`
                      }}
                    />
                    <text
                      y={node.size + 12}
                      textAnchor="middle"
                      fill="var(--foreground)"
                      fontSize="9px"
                      fontWeight="500"
                      style={{ pointerEvents: 'none', userSelect: 'none', fill: 'rgb(var(--text-primary-rgb))' }}
                    >
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgb(var(--text-secondary-rgb))', fontSize: '12px' }}>
                Initializing neural map nodes...
              </div>
            )}
          </div>

          {/* Stats Display */}
          <div className="stats-grid" style={{ gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', background: 'rgba(var(--card-bg-rgb), 0.25)', border: '1px solid rgba(var(--border-rgb), 0.1)' }}>
              <div style={{ fontSize: '10px', color: 'rgb(var(--text-secondary-rgb))', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>PAPERS DETECTED</div>
              <div className="cyber-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(var(--color-primary-rgb))' }}>{stats.papers}</div>
            </div>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', background: 'rgba(var(--card-bg-rgb), 0.25)', border: '1px solid rgba(var(--border-rgb), 0.1)' }}>
              <div style={{ fontSize: '10px', color: 'rgb(var(--text-secondary-rgb))', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>SOURCES SCANNED</div>
              <div className="cyber-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(var(--color-purple-rgb))' }}>{stats.sources}</div>
            </div>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '10px', textAlign: 'center', background: 'rgba(var(--card-bg-rgb), 0.25)', border: '1px solid rgba(var(--border-rgb), 0.1)' }}>
              <div style={{ fontSize: '10px', color: 'rgb(var(--text-secondary-rgb))', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>CONFIDENCE INDEX</div>
              <div className="cyber-font" style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(var(--color-accent-rgb))' }}>{stats.confidence}%</div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Streaming Insights Panel (Bottom overlay) */}
      {streamingInsights && (
        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(var(--border-rgb), 0.2)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: 'rgb(var(--color-accent-rgb))', marginBottom: '10px' }} className="cyber-font">
            <Sparkles size={14} className="animate-pulse-glow" />
            STREAMING INSIGHTS IN REAL TIME...
          </div>
          <div 
            className="glass-panel custom-scroll" 
            style={{ 
              maxHeight: '120px', 
              overflowY: 'auto', 
              fontSize: '13px', 
              padding: '12px', 
              borderRadius: '8px', 
              background: 'rgba(var(--bg-secondary-rgb), 0.5)', 
              color: 'rgb(var(--text-secondary-rgb))',
              fontFamily: 'monospace',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}
          >
            {streamingInsights}
            <span className="typing-response" />
          </div>
        </div>
      )}
    </div>
  );
}
