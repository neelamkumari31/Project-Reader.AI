import React, { useState } from 'react';

export default function RepoInput({ onLockRepository }) {
  const [url, setUrl] = useState('');

  const handleSuggest = (suggestedUrl) => {
    setUrl(suggestedUrl);
    onLockRepository(suggestedUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onLockRepository(url);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2d3748' }}>🔎 Analyze a GitHub Repository</h2>
      <p style={{ color: '#718096' }}>Enter a public repository URL to sync it with the Senior AI Auditor Agent.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <input
          type="url"
          placeholder="https://github.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Analyze
        </button>
      </form>

      <div style={{ marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: '#4a5568', fontWeight: 'bold' }}>Recruiter Quick Demos:</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button onClick={() => handleSuggest('https://github.com')} style={{ padding: '8px 12px', backgroundColor: '#edf2f7', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
            🚀 Developer Roadmap
          </button>
          <button onClick={() => handleSuggest('https://github.com')} style={{ padding: '8px 12px', backgroundColor: '#edf2f7', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
            🌐 Public APIs List
          </button>
        </div>
      </div>
    </div>
  );
}
