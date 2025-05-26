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
        setNews(data.news);
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
    <div className="space-y-6">
      {/* Control Section */}
      <div className="text-center space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Live Yahoo Japan News
          </h2>
          <p className="text-blue-700 text-sm">
            Fetching latest news from https://www.yahoo.co.jp/
          </p>
        </div>
        
        <button 
          onClick={fetchNews} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            '🔄 Refresh News'
          )}
        </button>
        
        {lastFetched && (
          <p className="text-gray-600 text-sm">
            📅 Last updated: {new Date(lastFetched).toLocaleString()}
          </p>
        )}
      </div>

      {/* Stats */}
      {news.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">
            ✅ Successfully fetched {news.length} news articles
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">❌ Error: {error}</p>
          <p className="text-sm mt-1">Please try refreshing or check the console for details.</p>
        </div>
      )}

      {/* News Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Fetching news from Yahoo Japan...</p>
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
            📰 Latest News Articles ({news.length})
          </h3>
          <div className="grid gap-4">
            {news.map((item, index) => (
              <article 
                key={item.id || index} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                      #{index + 1}
                    </span>
                    <h2 className="text-lg font-semibold mb-2 leading-tight">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {item.title}
                      </a>
                    </h2>
                    {item.timestamp && (
                      <p className="text-gray-500 text-sm flex items-center">
                        <span className="mr-1">🕒</span>
                        {item.timestamp}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Read more →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-lg">⚠️ No news items found</p>
          <p className="text-yellow-700 text-sm mt-2">
            This might happen if Yahoo Japan changed their website structure.
          </p>
          <button 
            onClick={fetchNews}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}