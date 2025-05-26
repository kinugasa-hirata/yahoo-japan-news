// app/page.js - Minimal Working Version
'use client';

import { useState } from 'react';

export default function NewsAggregator() {
  const [selectedSource, setSelectedSource] = useState('yahoo');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const newsSources = [
    { id: 'yahoo', name: 'Yahoo Japan', country: '🇯🇵', color: 'bg-purple-500' },
    { id: 'jtbc', name: 'JTBC Korea', country: '🇰🇷', color: 'bg-red-500' },
    { id: 'ifeng', name: 'iFeng Hong Kong', country: '🇭🇰', color: 'bg-yellow-500' }
  ];

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Testing API...');
      const response = await fetch(`/api/news/${selectedSource}`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Data received:', data);
      
      if (data.success) {
        setNews(data.news || []);
        console.log(`✅ Success: ${data.news?.length || 0} articles`);
      } else {
        setError(data.message || 'API returned success=false');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentSource = newsSources.find(s => s.id === selectedSource);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🌏 Multi-Source News Aggregator
        </h1>

        {/* Source Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select News Source:</h2>
          <div className="flex gap-4 flex-wrap">
            {newsSources.map(source => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSource === source.id
                    ? `${source.color} text-white`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {source.country} {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <p className="mb-4">Current Source: <strong>{currentSource?.name}</strong></p>
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
          >
            {loading ? '⏳ Testing...' : '🧪 Test API'}
          </button>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug Info:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Selected Source: {selectedSource}</p>
            <p>API URL: /api/news/{selectedSource}</p>
            <p>Articles Found: {news.length}</p>
            <p>Error: {error || 'None'}</p>
            <p>Status: {loading ? 'Loading...' : 'Ready'}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">❌ Error:</h3>
            <p>{error}</p>
            <p className="text-sm mt-2">Check browser console (F12) for more details.</p>
          </div>
        )}

        {/* News Display */}
        {news.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              📰 News Articles ({news.length})
            </h3>
            <div className="space-y-4">
              {news.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {index + 1}. {item.title || 'No title'}
                  </h4>
                  {item.originalTitle && item.originalTitle !== item.title && (
                    <p className="text-sm text-gray-600 italic mb-2">
                      Original: {item.originalTitle}
                    </p>
                  )}
                  {item.link && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📖 Read Article →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Select a news source above</li>
            <li>Click "Test API" button</li>
            <li>Check debug info for results</li>
            <li>Open browser console (F12) for detailed logs</li>
            <li>If errors occur, share the console output</li>
          </ol>
        </div>
      </div>
    </div>
  );
}