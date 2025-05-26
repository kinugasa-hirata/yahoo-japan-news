// components/DebugPanel.js - Debug component to test news sources
'use client';

import { useState } from 'react';

export default function DebugPanel() {
  const [debugResults, setDebugResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');

  const runDebugTest = async (source = 'all') => {
    setLoading(true);
    setDebugResults(null);
    
    try {
      const response = await fetch(`/api/debug?source=${source}`);
      const data = await response.json();
      setDebugResults(data);
    } catch (error) {
      setDebugResults({
        error: 'Debug test failed',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testSpecificSelectors = async (url, selectors) => {
    try {
      const response = await fetch('/api/test-selectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, selectors })
      });
      const data = await response.json();
      console.log('Selector test results:', data);
    } catch (error) {
      console.error('Selector test failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-yellow-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🔧 デバッグパネル
      </h2>
      
      <div className="space-y-4">
        {/* Control Panel */}
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={selectedSource} 
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">全てのソース</option>
            <option value="yahoo">Yahoo Japan</option>
            <option value="jtbc">JTBC Korea</option>
            <option value="ifeng">iFeng Hong Kong</option>
          </select>
          
          <button 
            onClick={() => runDebugTest(selectedSource)}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                テスト中...
              </>
            ) : (
              <>🧪 デバッグテスト実行</>
            )}
          </button>
        </div>

        {/* Debug Results */}
        {debugResults && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📊 テスト結果 ({debugResults.timestamp})
              </h3>
              
              {Object.entries(debugResults.tests).map(([sourceName, result]) => (
                <div key={sourceName} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    {sourceName === 'yahoo' && '🇯🇵'}
                    {sourceName === 'jtbc' && '🇰🇷'}
                    {sourceName === 'ifeng' && '🇭🇰'}
                    {sourceName.toUpperCase()}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Basic Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">ステータス:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? `✅ ${result.status}` : `❌ ${result.error}`}
                        </span>
                      </div>
                      
                      {result.fetchTime && (
                        <div className="flex justify-between">
                          <span className="font-medium">読み込み時間:</span>
                          <span>{result.fetchTime}</span>
                        </div>
                      )}
                      
                      {result.htmlLength && (
                        <div className="flex justify-between">
                          <span className="font-medium">HTMLサイズ:</span>
                          <span>{result.htmlLength.toLocaleString()} 文字</span>
                        </div>
                      )}
                      
                      {result.title && (
                        <div className="flex justify-between">
                          <span className="font-medium">ページタイトル:</span>
                          <span className="truncate" title={result.title}>
                            {result.title.substring(0, 50)}...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Selector Results */}
                    {result.potentialSelectors && (
                      <div className="space-y-2">
                        <h5 className="font-medium">📍 有効なセレクター:</h5>
                        {result.potentialSelectors.map(([selector, count]) => (
                          <div key={selector} className="flex justify-between text-xs">
                            <code className="bg-gray-100 px-1 rounded">{selector}</code>
                            <span className="font-medium">{count}個</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Anti-Bot Detection */}
                  {result.antiBotSigns && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">🛡️ ボット対策検出:</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(result.antiBotSigns).map(([check, detected]) => (
                          <div key={check} className={`flex justify-between ${detected ? 'text-red-600' : 'text-green-600'}`}>
                            <span>{check}:</span>
                            <span>{detected ? '⚠️ 検出' : '✅ なし'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sample News Links */}
                  {result.sampleNewsLinks && result.sampleNewsLinks.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">📰 サンプルニュースリンク:</h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {result.sampleNewsLinks.map((link, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium truncate" title={link.text}>
                              {link.text}
                            </div>
                            <div className="text-gray-500 truncate">
                              {link.href} (parent: {link.parent})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}