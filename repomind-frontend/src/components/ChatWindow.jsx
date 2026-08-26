import React, { useState } from 'react';

export default function ChatWindow({ repoUrl, onReset }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl, query: input }),
      });
      
      const data = await response.json();
      
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'agent', text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: 'agent', text: `⚠️ Error: ${data.error || 'Server error'}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'agent', text: '❌ Failed to communicate with Spring Boot server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#2d3748' }}>🛠️ Chatting with Agent</h3>
          <span style={{ fontSize: '12px', color: '#718096' }}>Target: {repoUrl}</span>
        </div>
        <button onClick={onReset} style={{ padding: '6px 12px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Change Repo
        </button>
      </div>

      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', margin: '20px 0', padding: '15px', backgroundColor: '#f7fafc' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px 14px', borderRadius: '8px', maxWidth: '75%', whiteSpace: 'pre-wrap', textAlign: 'left',
              backgroundColor: msg.role === 'user' ? '#3182ce' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#2d3748',
              border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
            }}>
              <strong>{msg.role === 'user' ? 'You' : 'Senior Agent'}:</strong>
              <p style={{ margin: '5px 0 0 0', lineHeight: '1.4' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && <p style={{ color: '#718096', fontStyle: 'italic' }}>Thinking... (Downloading code blocks and running audit analysis)</p>}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ask about architectural flows, vulnerabilities, or changes..."
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#48bb78', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
    </div>
  );
}
