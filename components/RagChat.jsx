'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

export default function RagChat({ papers, query, beyondThirtyDays }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I have mapped and cataloged the research on **"${query || 'your topic'}"** ${beyondThirtyDays ? 'from various time periods (beyond the last 30 days)' : 'from the past 30 days'}. You can ask me to analyze the bibliography, summarize findings, or detail research gaps.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  // Construct context text for RAG
  const getContextString = () => {
    if (!papers || papers.length === 0) return '';
    return papers.map(p => `Title: ${p.title}\nAuthors: ${p.authors}\nDate: ${p.date}\nCredibility: ${p.credibility}%\nURL: ${p.url}\nSummary snippet: ${p.snippet}`).join('\n\n');
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isStreaming) return;

    if (!textToSend) setInput('');

    // Append User Message
    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setCurrentStream('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context: getContextString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      // Handle streaming stream reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setCurrentStream(prev => prev + chunk);
      }

      // Once done, commit streamed message
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
      setCurrentStream('');
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error answering that request: ${err.message}. Make sure API endpoints are active.` 
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "What are the research gaps?",
    "Summarize the key breakthroughs.",
    "Draft a synthesis of the literature review."
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '520px', borderRadius: '16px', border: '1px solid rgba(var(--border-rgb), 0.25)', overflow: 'hidden' }}>
      
      {/* Chat Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(var(--bg-secondary-rgb), 0.5)', borderBottom: '1px solid rgba(var(--border-rgb), 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(var(--color-accent-rgb), 0.15)', color: 'rgb(var(--color-accent-rgb))' }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'rgb(var(--text-primary-rgb))' }} className="cyber-font">
              RESEARCH COPILOT (RAG)
            </h3>
            <p style={{ fontSize: '11px', color: 'rgb(var(--text-secondary-rgb))' }}>
              Chatting with {papers?.length || 0} collected sources
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgb(var(--color-accent-rgb))', background: 'rgba(var(--color-accent-rgb), 0.08)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(var(--color-accent-rgb), 0.15)' }} className="cyber-font">
          <Sparkles size={11} className="animate-pulse-glow" />
          ACTIVE ANALYSIS
        </div>
      </div>

      {/* Messages Sandbox Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(5, 5, 8, 0.2)' }} className="custom-scroll">
        
        {/* Warning if no papers context */}
        {(!papers || papers.length === 0) && (
          <div style={{ display: 'flex', gap: '10px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px', color: 'rgb(239, 68, 68)', marginBottom: '10px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>No papers analyzed yet.</strong> Copilot responses will be based on general database knowledge rather than scoped local references. Run a search to load data.
            </div>
          </div>
        )}

        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
              }}
            >
              <div 
                className="glass-panel"
                style={{ 
                  maxWidth: '85%', 
                  padding: '12px 16px', 
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'rgba(var(--color-primary-rgb), 0.2)' : 'rgba(var(--card-bg-rgb), 0.7)',
                  border: isUser ? '1px solid rgba(var(--color-primary-rgb), 0.3)' : '1px solid rgba(var(--border-rgb), 0.15)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'rgb(var(--text-primary-rgb))',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {/* Parse minor markdown styling for chat stubs */}
                {m.content.split('\n').map((para, pIdx) => {
                  let text = para;
                  // Handle strong bolding
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const parts = [];
                  let lastIdx = 0;
                  let match;
                  while ((match = boldRegex.exec(text)) !== null) {
                    if (match.index > lastIdx) {
                      parts.push(text.substring(lastIdx, match.index));
                    }
                    parts.push(<strong key={match.index} style={{ color: 'rgb(var(--color-accent-rgb))' }}>{match[1]}</strong>);
                    lastIdx = boldRegex.lastIndex;
                  }
                  if (lastIdx < text.length) {
                    parts.push(text.substring(lastIdx));
                  }
                  
                  return (
                    <p key={pIdx} style={{ marginBottom: pIdx < m.content.split('\n').length - 1 ? '8px' : 0 }}>
                      {parts.length > 0 ? parts : text}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Streaming Buffer Bubble */}
        {isStreaming && currentStream && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div 
              className="glass-panel"
              style={{ 
                maxWidth: '85%', 
                padding: '12px 16px', 
                borderRadius: '16px 16px 16px 4px',
                background: 'rgba(var(--card-bg-rgb), 0.7)',
                border: '1px solid rgba(var(--border-rgb), 0.25)',
                fontSize: '13px',
                lineHeight: '1.5',
                color: 'rgb(var(--text-primary-rgb))',
                whiteSpace: 'pre-wrap'
              }}
            >
              {currentStream}
              <span className="typing-response" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick helper prompts */}
      {messages.length === 1 && !isStreaming && (
        <div style={{ padding: '0 16px 10px 16px', background: 'rgba(5, 5, 8, 0.2)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              style={{
                background: 'rgba(var(--border-rgb), 0.08)',
                border: '1px solid rgba(var(--border-rgb), 0.15)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '11px',
                color: 'rgb(var(--text-secondary-rgb))',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="hover:text-[rgb(var(--color-accent-rgb))] hover:border-[rgb(var(--color-accent-rgb))] hover:bg-[rgba(var(--color-accent-rgb),0.05)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input panel */}
      <div style={{ padding: '16px', background: 'rgba(var(--bg-secondary-rgb), 0.6)', borderTop: '1px solid rgba(var(--border-rgb), 0.15)' }}>
        <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "Synthesizing answer..." : "Ask about literature trends, gaps, methodology..."}
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1,
              padding: '12px 40px 12px 16px',
              borderRadius: '12px',
              resize: 'none',
              height: '42px',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              fontSize: '13px'
            }}
            className="glass-input custom-scroll"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            style={{
              position: 'absolute',
              right: '8px',
              top: '6px',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: 'none',
              background: input.trim() && !isStreaming ? 'rgb(var(--color-accent-rgb))' : 'rgba(var(--border-rgb), 0.1)',
              color: input.trim() && !isStreaming ? '#050508' : 'rgb(var(--text-secondary-rgb))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
