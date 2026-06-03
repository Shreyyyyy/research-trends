'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Link as LinkIcon, Award } from 'lucide-react';

export default function TimelineView({ timelineData }) {
  const [expandedPaper, setExpandedPaper] = useState(null);

  if (!timelineData || timelineData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-secondary-rgb))' }}>
        No timeline data available. Run a research search to populate the timeline.
      </div>
    );
  }

  const toggleExpand = (idx) => {
    if (expandedPaper === idx) {
      setExpandedPaper(null);
    } else {
      setExpandedPaper(idx);
    }
  };

  // Helper for credibility score color
  const getCredibilityClass = (score) => {
    if (score >= 90) return { bg: 'rgba(20, 240, 160, 0.15)', color: 'rgb(20, 240, 160)', label: 'Exceptional' };
    if (score >= 80) return { bg: 'rgba(56, 189, 248, 0.15)', color: 'rgb(56, 189, 248)', label: 'Highly Credible' };
    return { bg: 'rgba(168, 85, 247, 0.15)', color: 'rgb(168, 85, 247)', label: 'Standard' };
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0' }}>
      <h3 className="cyber-font" style={{ fontSize: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgb(var(--text-primary-rgb))' }}>
        <Calendar size={18} style={{ color: 'rgb(var(--color-accent-rgb))' }} />
        30-DAY BREAKTHROUGH TIMELINE
      </h3>

      <div className="timeline-container">
        {timelineData.map((item, idx) => {
          const cred = getCredibilityClass(item.credibility || 85);
          const isExpanded = expandedPaper === idx;

          return (
            <div 
              key={idx} 
              style={{ 
                position: 'relative', 
                paddingLeft: '40px', 
                marginBottom: '32px',
                animation: `slide-up 0.4s ease-out ${idx * 0.1}s forwards`,
                opacity: 0
              }}
            >
              {/* Timeline Dot */}
              <div 
                style={{ 
                  position: 'absolute', 
                  left: '11px', 
                  top: '4px', 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: cred.color, 
                  boxShadow: `0 0 10px ${cred.color}`,
                  border: '2px solid var(--background)',
                  zIndex: 2 
                }} 
              />

              {/* Date Badge */}
              <div style={{ 
                fontFamily: 'Orbitron, sans-serif', 
                fontSize: '11px', 
                color: cred.color, 
                fontWeight: '600', 
                marginBottom: '8px', 
                letterSpacing: '0.05em' 
              }}>
                {item.date}
              </div>

              {/* Card Container */}
              <div 
                className="glass-panel glass-panel-hover" 
                style={{ 
                  borderRadius: '12px', 
                  background: 'rgba(var(--card-bg-rgb), 0.45)', 
                  border: '1px solid rgba(var(--border-rgb), 0.15)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={() => toggleExpand(idx)}
              >
                {/* Card Header */}
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.4', color: 'rgb(var(--text-primary-rgb))', marginBottom: '6px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'rgb(var(--text-secondary-rgb))' }}>
                      {item.authors}
                    </p>
                  </div>
                  
                  {/* Credibility Score Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{ 
                      fontSize: '11px', 
                      background: cred.bg, 
                      color: cred.color, 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Award size={12} />
                      {item.credibility || 85}%
                    </div>
                    <span style={{ fontSize: '9px', color: 'rgb(var(--text-secondary-rgb))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {cred.label}
                    </span>
                  </div>
                </div>

                {/* Collapsed Snippet / Preview */}
                {!isExpanded && (
                  <div style={{ padding: '0 16px 16px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'rgb(var(--text-secondary-rgb))' }}>
                    <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                      {item.summary}
                    </p>
                    <ChevronDown size={16} style={{ opacity: 0.6 }} />
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ 
                    padding: '0 16px 16px 16px', 
                    borderTop: '1px solid rgba(var(--border-rgb), 0.1)', 
                    paddingTop: '16px', 
                    background: 'rgba(var(--bg-primary-rgb), 0.25)' 
                  }} className="animate-fade-in">
                    <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary-rgb))', lineHeight: '1.6', marginBottom: '16px' }}>
                      {item.summary}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()} // Prevent card collapse on link click
                          style={{ 
                            fontSize: '12px', 
                            color: 'rgb(var(--color-primary-rgb))', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontWeight: '500' 
                          }}
                          className="hover:underline"
                        >
                          <LinkIcon size={12} />
                          Go to full publication source
                        </a>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgb(var(--text-secondary-rgb))' }}>
                        <span>Collapse Details</span>
                        <ChevronUp size={16} />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
