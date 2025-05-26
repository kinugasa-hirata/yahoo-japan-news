'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      
      if (data.success) {
        // Limit to 5 topics only
        setNews(data.news.slice(0, 5));
        setLastFetched(data.fetchedAt);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch news');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center shadow-lg">
        <h2 className="text-3xl font-bold mb-2">
          🗾 Live Yahoo Japan News
        </h2>
        <p className="text-blue-100 text-lg">
          Top 5 trending stories from yahoo.co.jp
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-800">
              📰 News Feed
            </h3>
            <p className="text-gray-600 text-sm">
              {news.length > 0 ? `Showing ${news.length} articles` : 'No articles loaded'}
            </p>
          </div>
          
          <button 
            onClick={fetchNews} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                🔄 Refresh News
              </>
            )}
          </button>
        </div>
        
        {lastFetched && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <span className="text-green-500">🕒</span>
              Last updated: {new Date(lastFetched).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {news.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium flex items-center gap-2">
            <span className="text-green-500">✅</span>
            Successfully loaded {news.length} top stories
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold flex items-center gap-2">
            <span className="text-red-500">❌</span>
            Error: {error}
          </p>
          <p className="text-sm mt-2">Please try refreshing or check the console for details.</p>
        </div>
      )}

      {/* News Articles */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-6 text-gray-600 text-xl">Fetching latest news from Yahoo Japan...</p>
          <p className="mt-2 text-gray-500 text-sm">This may take a few seconds</p>
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📰 Top 5 Stories
            </h3>
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {news.length} articles
            </span>
          </div>
          
          <div className="space-y-4">
            {news.map((item, index) => (
              <article 
                key={item.id || index} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Article Number */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold mb-3 leading-tight">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-blue-600 transition-colors duration-200 hover:underline"
                        >
                          {item.title}
                        </a>
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {item.timestamp && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <span>🕒</span>
                            {item.timestamp}
                          </span>
                        )}
                        
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <span>📖</span>
                          Read Article
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="text-center py-16 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-yellow-800 text-xl font-semibold mb-2">No news items found</p>
          <p className="text-yellow-700 mb-6">
            This might happen if Yahoo Japan changed their website structure.
          </p>
          <button 
            onClick={fetchNews}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
        <p className="text-gray-600 text-sm">
          🌐 Data sourced from{' '}
          <a 
            href="https://www.yahoo.co.jp/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            yahoo.co.jp
          </a>
          {' '}• Updated manually by clicking refresh
        </p>
      </div>
    </div>
  );
}