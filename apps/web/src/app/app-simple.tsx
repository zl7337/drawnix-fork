import React, { useState } from 'react';

export function App() {
  const [testResult, setTestResult] = useState<string>('');

  const testDrawnixImport = async () => {
    try {
      const { Drawnix } = await import('@drawnix/drawnix');
      setTestResult('✅ Drawnix imported successfully!');
    } catch (error) {
      setTestResult(`❌ Drawnix import failed: ${error.message}`);
    }
  };

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
        <button onClick={testDrawnixImport} style={{ marginBottom: '10px' }}>
          Test Drawnix Import
        </button>
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', minHeight: '30px' }}>
          {testResult || 'Click the button above to test Drawnix import'}
        </div>
        <div id="drawnix-test" style={{ height: '200px', backgroundColor: '#f5f5f5', marginTop: '10px' }}>
          {/* Simple test area */}
        </div>
      </div>
    </div>
  );
}

export default App;
