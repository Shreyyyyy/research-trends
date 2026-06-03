'use client';

import React, { useState } from 'react';
import { Shield, ExternalLink, Calendar, User, BookOpen } from 'lucide-react';

export default function ResearchCards({ papers }) {
  const [expandedCard, setExpandedCard] = useState(null);

  if (!papers || papers.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgb(var(--text-secondary-rgb))' }}>
        No papers found. Enter a research topic above to explore.
      </div>
    );
  }

  const toggleExpand = (id) => {
    if (expandedCard === id) {
      setExpandedCard(null);
    } else {
      setExpandedCard(id);
    }
  };

  // Helper to extract clean domain from url
  const getDomainName = (urlString) => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch (e) {
      return 'Source';
    }
  };

  // Helper for credibility meter color
  const getCredibilityConfig = (score) => {
    if (score >= 90) {
      return {
        color: 'rgb(20, 240, 160)',
        glow: 'rgba(20, 240, 160, 0.25)',
        label: 'VERIFIED HIGH'
      };
    }
    if (score >= 80) {
      return {
        color: 'rgb(56, 189, 248)',
        glow: 'rgba(56, 189, 248, 0.25)',
        label: 'CREDIBLE'
      };
    }
    return {
      color: 'rgb(168, 85, 247)',
      glow: 'rgba(168, 85, 247, 0.25)',
      label: 'VALIDATED'
    };
  };

  return (
    <div className="animate-fade-in" style={{ padding: '8px 0' }}>
      <h3 className="cyber-font" style={{ fontSize: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgb(var(--text-primary-rgb))' }}>
        <BookOpen size={18} style={{ color: 'rgb(var(--color-accent-rgb))' }} />
        COLLECTED RESEARCH ARCHIVE
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {papers.map((paper, idx) => {
          const isExpanded = expandedCard === paper.id;
          const cred = getCredibilityConfig(paper.credibility || 80);
          const domain = getDomainName(paper.url);

          return (
            <div 
              key={paper.id}
              className="glass-panel glass-panel-hover"
              style={{
                borderRadius: '16px',
                background: 'rgba(var(--card-bg-rgb), 0.45)',
                border: '1px solid rgba(var(--border-rgb), 0.15)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                borderTop: `3px solid ${cred.color}`,
                boxShadow: isExpanded ? `0 8px 32px ${cred.glow}` : 'none'
              }}
            >
              <div>
                {/* Domain & Credibility Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontFamily: 'Orbitron, sans-serif', 
                    color: 'rgb(var(--text-secondary-rgb))',
                    background: 'rgba(var(--border-rgb), 0.1)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em'
                  }}>
                    {domain}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={12} style={{ color: cred.color }} />
                    <span style={{ 
                      fontSize: '10px', 
                      fontFamily: 'Orbitron, sans-serif', 
                      color: cred.color, 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em'
                    }}>
                      {cred.label} ({paper.credibility}%)
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  lineHeight: '1.4', 
                  color: 'rgb(var(--text-primary-rgb))', 
                  marginBottom: '10px' 
                }}>
                  {paper.title}
                </h4>

                {/* Meta details */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgb(var(--text-secondary-rgb))', marginBottom: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    {paper.authors.split(' et al.')[0]}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {paper.date}
                  </span>
                </div>

                {/* Content Snippet */}
                <p style={{ 
                  fontSize: '13px', 
                  color: 'rgb(var(--text-secondary-rgb))', 
                  lineHeight: '1.5',
                  maxHeight: isExpanded ? '1000px' : '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: isExpanded ? 'unset' : 3,
                  WebkitBoxOrient: 'vertical',
                  transition: 'max-height 0.4s ease',
                  marginBottom: '16px'
                }}>
                  {paper.snippet}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(var(--border-rgb), 0.1)', paddingTop: '14px' }}>
                <button 
                  onClick={() => toggleExpand(paper.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgb(var(--text-primary-rgb))',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  className="hover:underline"
                >
                  {isExpanded ? 'Show Less' : 'Read Summary'}
                </button>

                {paper.url && (
                  <a 
                    href={paper.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'rgb(var(--color-primary-rgb))',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    className="hover:underline"
                  >
                    Source Code/Paper
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
