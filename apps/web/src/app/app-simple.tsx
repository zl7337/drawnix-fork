import React from 'react';

export function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Drawnix Test Page</h1>
      <p>This is a test to see if React is working correctly.</p>
      <button onClick={() => alert('React is working!')}>
        Click me to test React
      </button>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>Testing Drawnix Import</h2>
        <p>If you can see this, React is working. Now testing Drawnix import...</p>
        <div id="drawnix-test" style={{ height: '200px', backgroundColor: '#f5f5f5' }}>
          {/* Simple test area */}
        </div>
      </div>
    </div>
  );
}

export default App;
