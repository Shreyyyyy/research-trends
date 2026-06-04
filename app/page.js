'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, History, Trash2, Download, Copy, Sun, Moon, 
  Search, BookOpen, BarChart2, Calendar, MessageSquare, 
  FileText, Sparkles, LogOut, Check, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

import ResearchEngine from '../components/ResearchEngine';
import TimelineView from '../components/TimelineView';
import TrendCharts from '../components/TrendCharts';
import ResearchCards from '../components/ResearchCards';
import RagChat from '../components/RagChat';

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  
  // Research state
  const [isSearching, setIsSearching] = useState(false);
  const [activeStep, setActiveStep] = useState('searching');
  const [papersDiscovered, setPapersDiscovered] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [progress, setProgress] = useState({ count: 0, confidence: 0 });
  const [streamingInsights, setStreamingInsights] = useState('');
  
  // Active Work tabs: 'report' | 'timeline' | 'charts' | 'papers' | 'chat'
  const [activeTab, setActiveTab] = useState('report');
  const [copyStatus, setCopyStatus] = useState(false);
  const [searchScope, setSearchScope] = useState({ beyondThirtyDays: false, message: '' });

  // Initialize theme and load projects
  useEffect(() => {
    // Read local theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Read projects
    const savedProjects = localStorage.getItem('research_projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed);
        if (parsed.length > 0) {
          setCurrentProject(parsed[0]);
        }
      } catch (e) {
        console.error("Error parsing projects from localStorage", e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Launch research search
  const handleSearch = async (searchQuery) => {
    const targetQuery = searchQuery || query;
    if (!targetQuery.trim() || isSearching) return;

    setIsSearching(true);
    setCurrentProject(null);
    setPapersDiscovered([]);
    setStreamingInsights('');
    setGraphData({ nodes: [], links: [] });
    setProgress({ count: 0, confidence: 0 });
    setActiveStep('searching');
    setSearchScope({ beyondThirtyDays: false, message: '' });

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery })
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // Keep last incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE stream format: "event: name\ndata: json"
          const eventMatch = line.match(/^event:\s*(.+)$/m);
          const dataMatch = line.match(/^data:\s*(.+)$/m);

          if (eventMatch && dataMatch) {
            const eventName = eventMatch[1].trim();
            const rawData = dataMatch[1].trim();

            try {
              const data = JSON.parse(rawData);

              if (eventName === 'step') {
                setActiveStep(data.status);
              } else if (eventName === 'searchScope') {
                setSearchScope(data);
              } else if (eventName === 'papers') {
                setPapersDiscovered(data);
              } else if (eventName === 'progress') {
                setProgress(data);
              } else if (eventName === 'graph') {
                setGraphData(data);
              } else if (eventName === 'insight') {
                setStreamingInsights(prev => prev + data);
              } else if (eventName === 'done') {
                // Compile the finished project structure
                const newProj = {
                  id: `project-${Date.now()}`,
                  query: targetQuery,
                  report: data.report,
                  papers: data.papers,
                  timeline: data.timeline,
                  charts: data.charts,
                  dateCreated: new Date().toLocaleDateString(),
                  beyondThirtyDays: searchScope.beyondThirtyDays || false
                };

                // Save project list
                const updatedProjects = [newProj, ...projects.filter(p => p.query !== targetQuery)];
                setProjects(updatedProjects);
                localStorage.setItem('research_projects', JSON.stringify(updatedProjects));
                setCurrentProject(newProj);
                setActiveTab('report');
                
                // Success confetti blast!
                confetti({
                  particleCount: 80,
                  spread: 60,
                  origin: { y: 0.8 },
                  colors: ['#14f0a0', '#38bdf8', '#a855f7']
                });
              }
            } catch (e) {
              // Ignore line parse errors of partial streams
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert(`Research process failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const deleteProject = (id, e) => {
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('research_projects', JSON.stringify(updated));
    if (currentProject && currentProject.id === id) {
      setCurrentProject(updated[0] || null);
    }
  };

  const handleCopyReport = () => {
    if (!currentProject) return;
    navigator.clipboard.writeText(currentProject.report);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
    
    // Confetti spark
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
  };

  const handleExportMarkdown = () => {
    if (!currentProject) return;
    const element = document.createElement("a");
    const file = new Blob([currentProject.report], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${currentProject.query.replace(/\s+/g, "_")}_trend_report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.7 }
    });
  };

  const samplePrompts = [
    "DeepSeek R1 architecture breakthroughs",
    "Room temperature superconductivity 2026",
    "Quantum computing error mitigation",
    "CRISPR-Cas9 therapeutic clinical trials"
  ];

  return (
    <div className="app-shell">
      
      {/* 1. Sidebar Navigation panel */}
      <aside 
        className="glass-panel app-sidebar" 
        style={{ 
          borderRight: '1px solid rgba(var(--border-rgb), 0.15)', 
          zIndex: 10,
          background: 'rgba(var(--bg-secondary-rgb), 0.7)'
        }}
      >
        {/* Title branding logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(var(--border-rgb), 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, rgb(var(--color-primary-rgb)) 0%, rgb(var(--color-accent-rgb)) 100%)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#050508' }}>
              <Sparkles size={16} />
            </div>
            <span className="cyber-font" style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
              Shrey-Nexus
            </span>
          </div>

          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(var(--text-secondary-rgb))' }}
            className="hover:text-[rgb(var(--color-accent-rgb))]"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Action button */}
        <div style={{ padding: '16px' }}>
          <button 
            onClick={() => { setCurrentProject(null); setQuery(''); }}
            className="btn-glass"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer' }}
          >
            <Plus size={16} />
            NEW WORKSPACE
          </button>
        </div>

        {/* Saved log list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px 12px' }} className="custom-scroll">
          <div style={{ fontSize: '10px', color: 'rgb(var(--text-secondary-rgb))', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '12px 8px 8px 8px', display: 'flex', alignItems: 'center', gap: '6px' }} className="cyber-font">
            <History size={12} />
            RESEARCH HISTORIES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {projects.map((proj) => {
              const isSelected = currentProject && currentProject.id === proj.id;
              return (
                <div 
                  key={proj.id}
                  onClick={() => setCurrentProject(proj)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(var(--color-accent-rgb), 0.08)' : 'transparent',
                    border: isSelected ? '1px solid rgba(var(--color-accent-rgb), 0.25)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  className={!isSelected ? 'hover:bg-[rgba(var(--border-rgb),0.05)]' : ''}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, marginRight: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: isSelected ? 'rgb(var(--color-accent-rgb))' : 'rgb(var(--text-primary-rgb))', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {proj.query}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgb(var(--text-secondary-rgb))' }}>
                      {proj.dateCreated} • {proj.papers.length} sources
                    </span>
                  </div>
                  
                  <button 
                    onClick={(e) => deleteProject(proj.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: isSelected ? 0.9 : 0.2, color: 'rgb(var(--text-secondary-rgb))' }}
                    className="hover:text-red-500 hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div style={{ color: 'rgb(var(--text-secondary-rgb))', fontSize: '12px', textAlign: 'center', padding: '24px 8px' }}>
                No saved workspaces yet. Run a search to populate.
              </div>
            )}
          </div>
        </div>

        {/* Footer info branding */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(var(--border-rgb), 0.12)', fontSize: '11px', color: 'rgb(var(--text-secondary-rgb))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Version 1.0.5</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            Powered by Groq & Tavily
          </span>
        </div>
      </aside>

      {/* 2. Main Workspace Dashboard */}
      <main className="app-main custom-scroll">
        
        {/* Workspace banner header */}
        <header className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid rgba(var(--border-rgb), 0.12)', background: 'rgba(var(--bg-secondary-rgb), 0.25)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 5 }}>
          <div>
            {currentProject ? (
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'rgb(var(--text-primary-rgb))' }} className="cyber-font">
                PROJECT: {currentProject.query.toUpperCase()}
              </h2>
            ) : (
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'rgb(var(--text-primary-rgb))' }} className="cyber-font">
                RESEARCH TREND EXPLORER
              </h2>
            )}
          </div>

          {currentProject && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleCopyReport}
                className="btn-glass"
                style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                {copyStatus ? <Check size={14} style={{ color: 'rgb(var(--color-accent-rgb))' }} /> : <Copy size={14} />}
                {copyStatus ? 'Copied!' : 'Copy Report'}
              </button>
              
              <button 
                onClick={handleExportMarkdown}
                className="btn-neon"
                style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Download size={14} />
                Export Markdown
              </button>
            </div>
          )}
        </header>

        {/* Dashboard Work area */}
        <div style={{ flex: 1, padding: '32px' }}>
          
          {/* A. Landing Page View (Empty search state) */}
          {!currentProject && !isSearching && (
            <div style={{ maxWidth: '640px', margin: '40px auto 0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Marketing copy */}
              <div style={{ textAlign: 'center' }}>
                <h1 className="cyber-font text-gradient-cyan text-glow-accent" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
                  EXPLORE THE FRONTIERS OF BREAKTHROUGH RESEARCH
                </h1>
                <p style={{ color: 'rgb(var(--text-secondary-rgb))', fontSize: '15px', lineHeight: '1.6' }}>
                  Analyze papers from the last 30 days. Map topics, generate literature reviews, compute domain credibility, and chat using RAG pipelines.
                </p>
              </div>

              {/* Main query prompt container */}
              <div 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(var(--border-rgb), 0.25)',
                  boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter academic topic or breakthrough query..."
                    style={{ flex: 1, padding: '14px 20px', borderRadius: '12px', fontSize: '14px' }}
                    className="glass-input"
                  />
                  <button 
                    onClick={() => handleSearch()}
                    disabled={!query.trim()}
                    className="btn-neon"
                    style={{ padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'center', cursor: query.trim() ? 'pointer' : 'default', opacity: query.trim() ? 1 : 0.5 }}
                  >
                    Analyze
                    <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgb(var(--text-secondary-rgb))', marginTop: '16px' }}>
                  <Sparkles size={14} style={{ color: 'rgb(var(--color-accent-rgb))' }} />
                  <span>Sandbox Mode active: Fallback stubs will mock response if stubs are empty.</span>
                </div>
              </div>

              {/* Sample Prompts */}
              <div>
                <h4 style={{ fontSize: '11px', color: 'rgb(var(--text-secondary-rgb))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }} className="cyber-font">
                  SUGGESTED DISCOVERIES
                </h4>
                <div className="prompt-grid">
                  {samplePrompts.map((p, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { setQuery(p); handleSearch(p); }}
                      className="glass-panel glass-panel-hover"
                      style={{ 
                        padding: '14px 16px', 
                        borderRadius: '10px', 
                        fontSize: '13px', 
                        cursor: 'pointer', 
                        background: 'rgba(var(--card-bg-rgb), 0.25)', 
                        border: '1px solid rgba(var(--border-rgb), 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: '500'
                      }}
                    >
                      <span>{p}</span>
                      <ArrowRight size={14} style={{ opacity: 0.4 }} className="hover-arrow" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* B. Loading Research engine state */}
          {isSearching && (
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              <ResearchEngine
                query={query}
                activeStep={activeStep}
                papersDiscovered={papersDiscovered}
                progress={progress}
                graphData={graphData}
                streamingInsights={streamingInsights}
                searchScope={searchScope}
              />
            </div>
          )}

          {/* C. Results display panel */}
          {currentProject && !isSearching && (
            <div className="dashboard-body">
              
              {/* Tab Selector buttons */}
              <div 
                className="glass-panel" 
                style={{ 
                  display: 'flex', 
                  gap: '4px', 
                  padding: '6px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(var(--border-rgb), 0.15)',
                  background: 'rgba(var(--bg-secondary-rgb), 0.45)',
                  width: 'fit-content'
                }}
              >
                {[
                  { id: 'report', label: 'Analysis Report', icon: FileText },
                  { id: 'timeline', label: 'Timeline View', icon: Calendar },
                  { id: 'charts', label: 'Trend Visuals', icon: BarChart2 },
                  { id: 'papers', label: 'Collected Sources', icon: BookOpen },
                  { id: 'chat', label: 'RAG Copilot', icon: MessageSquare }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        border: 'none',
                        background: isSelected ? 'rgba(var(--color-accent-rgb), 0.15)' : 'transparent',
                        color: isSelected ? 'rgb(var(--color-accent-rgb))' : 'rgb(var(--text-secondary-rgb))',
                        fontWeight: isSelected ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      className={!isSelected ? 'hover:text-[var(--foreground)]' : ''}
                    >
                      <Icon size={14} />
                      <span className="cyber-font" style={{ fontSize: '10px' }}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panels */}
              <div style={{ minHeight: '450px' }}>
                
                {/* 1. Report Panel */}
                {activeTab === 'report' && (
                  <div className="glass-panel animate-fade-in" style={{ padding: '32px', borderRadius: '16px', border: '1px solid rgba(var(--border-rgb), 0.25)', background: 'rgba(var(--card-bg-rgb), 0.55)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
                    
                    {/* Render report markdown */}
                    <div style={{ lineHeight: '1.7', color: 'rgb(var(--text-primary-rgb))', fontSize: '14.5px' }} className="markdown-body">
                      {currentProject.report.split('\n').map((line, idx) => {
                        const cleanLine = line.trim();
                        
                        if (cleanLine.startsWith('# ')) {
                          return (
                            <h2 
                              key={idx} 
                              className="cyber-font text-gradient-cyan text-glow-accent" 
                              style={{ fontSize: '18px', fontWeight: 'bold', marginTop: idx === 0 ? '0' : '28px', marginBottom: '14px', borderBottom: '1px solid rgba(var(--border-rgb), 0.15)', paddingBottom: '6px' }}
                            >
                              {cleanLine.substring(2)}
                            </h2>
                          );
                        }
                        if (cleanLine.startsWith('## ')) {
                          return (
                            <h3 
                              key={idx} 
                              className="cyber-font" 
                              style={{ fontSize: '15px', fontWeight: '600', marginTop: '24px', marginBottom: '10px', color: 'rgb(var(--color-primary-rgb))' }}
                            >
                              {cleanLine.substring(3)}
                            </h3>
                          );
                        }
                        if (cleanLine.startsWith('- ')) {
                          return (
                            <li key={idx} style={{ marginLeft: '16px', marginBottom: '8px', listStyleType: 'square' }}>
                              {cleanLine.substring(2)}
                            </li>
                          );
                        }
                        if (cleanLine.match(/^\d+\.\s/)) {
                          return (
                            <li key={idx} style={{ marginLeft: '16px', marginBottom: '8px', listStyleType: 'decimal' }}>
                              {cleanLine.replace(/^\d+\.\s/, '')}
                            </li>
                          );
                        }
                        if (cleanLine === '') {
                          return <div key={idx} style={{ height: '12px' }} />;
                        }
                        
                        // Parse inline strong bolding
                        const boldRegex = /\*\*(.*?)\*\*/g;
                        const parts = [];
                        let lastIdx = 0;
                        let match;
                        while ((match = boldRegex.exec(line)) !== null) {
                          if (match.index > lastIdx) {
                            parts.push(line.substring(lastIdx, match.index));
                          }
                          parts.push(<strong key={match.index} style={{ color: 'rgb(var(--color-accent-rgb))' }}>{match[1]}</strong>);
                          lastIdx = boldRegex.lastIndex;
                        }
                        if (lastIdx < line.length) {
                          parts.push(line.substring(lastIdx));
                        }

                        return (
                          <p key={idx} style={{ marginBottom: '12px' }}>
                            {parts.length > 0 ? parts : line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Timeline Panel */}
                {activeTab === 'timeline' && (
                  <TimelineView timelineData={currentProject.timeline} />
                )}

                {/* 3. Charts Panel */}
                {activeTab === 'charts' && (
                  <TrendCharts chartsData={currentProject.charts} />
                )}

                {/* 4. Collected Bibliography Panel */}
                {activeTab === 'papers' && (
                  <ResearchCards papers={currentProject.papers} />
                )}

                {/* 5. RAG Chat Panel */}
                {activeTab === 'chat' && (
                  <RagChat 
                    papers={currentProject.papers} 
                    query={currentProject.query}
                    beyondThirtyDays={currentProject.beyondThirtyDays}
                  />
                )}

              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
