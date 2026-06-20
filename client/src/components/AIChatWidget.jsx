import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';
import './AIChatWidget.css';

function AIChatWidget() {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef           = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', text, timestamp: new Date().toISOString() },
    ]);
    setInput('');
    setIsTyping(true);
    try {
      const data = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', text: data.message, timestamp: data.timestamp },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', text: "Sorry, I couldn't reach the AI coach. Please try again.", timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          width: '360px',
          height: '480px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6c5ce7, #a78bfa)',
            color: '#fff',
            padding: '16px 20px',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}>
            <span>🤖</span>
            <span>FitWise AI Coach</span>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  background: msg.role === 'user' ? '#6c5ce7' : '#f1f3f5',
                  color: msg.role === 'user' ? '#fff' : '#2d3436',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  maxWidth: '80%',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#636e72',
                fontSize: '0.8rem',
              }}>
                <span>FitWise AI is thinking</span>
                <span>
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI coach..."
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #ddd',
                borderRadius: '24px',
                fontSize: '0.875rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                background: '#6c5ce7',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                opacity: input.trim() ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6c5ce7, #a78bfa)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={isOpen ? 'Close AI Coach' : 'Open AI Coach'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
}

export default AIChatWidget;
