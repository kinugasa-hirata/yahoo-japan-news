// app/page.js - Simplified Japanese News Aggregator (No Debug Panel)
'use client';

import { useState, useEffect } from 'react';

export default function NewsAggregator() {
  const [selectedSource, setSelectedSource] = useState('yahoo');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [categories, setCategories] = useState({});

  // ニュースソース設定 (JTBC削除、Yahoo + iFengのみ)
  const newsSources = [
    {
      id: 'yahoo',
      name: 'ヤフージャパン',
      country: '🇯🇵',
      url: 'https://www.yahoo.co.jp/',
      language: 'ja',
      color: 'bg-purple-500'
    },
    {
      id: 'ifeng',
      name: '鳳凰網香港',
      country: '🇭🇰',
      url: 'https://news.ifeng.com/',
      language: 'zh',
      color: 'bg-yellow-500'
    }
  ];

  const fetchNews = async (sourceId = selectedSource) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Fetching news from: /api/news/${sourceId}`);
      const response = await fetch(`/api/news/${sourceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response:', data);
      
      if (data.success) {
        setNews(data.news || []);
        setCategories(data.categories || {});
        setLastFetched(data.fetchedAt);
        console.log(`✅ Successfully loaded ${data.news?.length || 0} articles`);
      } else {
        setError(data.message || 'Unknown error occurred');
        console.error('❌ API Error:', data.message);
      }
    } catch (err) {
      const errorMessage = `ニュース取得に失敗しました: ${err.message}`;
      setError(errorMessage);
      console.error('❌ Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`🚀 Component mounted, fetching news for: ${selectedSource}`);
    fetchNews();
  }, [selectedSource]);

  // カテゴリーでニュースをフィルター
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  const currentSource = newsSources.find(s => s.id === selectedSource);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 左サイドバー - ニュースソース */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            📰 ニュースソース
          </h2>
          <p className="text-gray-600 text-sm">
            ニュースソースを選択してください
          </p>
        </div>
        
        <div className="p-4 space-y-2">
          {newsSources.map((source) => (
            <button
              key={source.id}
              onClick={() => {
                console.log(`🔄 Switching to source: ${source.id}`);
                setSelectedSource(source.id);
              }}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                selectedSource === source.id
                  ? `${source.color} text-white border-transparent shadow-lg`
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{source.country}</span>
                <div>
                  <div className="font-semibold">{source.name}</div>
                  <div className={`text-sm ${
                    selectedSource === source.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {source.language.toUpperCase()} • {source.url.replace('https://', '')}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ソース情報 */}
        {currentSource && (
          <div className="p-4 m-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              現在のソース: {currentSource.name}
            </h3>
            <p className="text-sm text-gray-600">
              言語: {currentSource.language.toUpperCase()}
            </p>
            <p className="text-sm text-gray-600">
              自動翻訳: 日本語
            </p>
          </div>
        )}
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 p-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
            <h1 className="text-3xl font-bold mb-2">
              {currentSource?.country} {currentSource?.name} ニュース
            </h1>
            <p className="text-blue-100">
              最新5記事 • 自動日本語翻訳
            </p>
          </div>
        </div>

        {/* Simple Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 デバッグ情報</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>選択中のソース: {selectedSource}</p>
            <p>記事数: {news.length}</p>
            <p>エラー: {error || 'なし'}</p>
            <p>最終更新: {lastFetched ? new Date(lastFetched).toLocaleString('ja-JP') : 'なし'}</p>
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                📊 ニュースフィード
              </h3>
              <p className="text-gray-600 text-sm">
                {filteredNews.length}件の記事 • カテゴリ: {selectedCategory === 'all' ? '全て' : selectedCategory}
              </p>
            </div>
            
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchNews();
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  読み込み中...
                </>
              ) : (
                <>🔄 ニュース更新</>
              )}
            </button>
          </div>

          {lastFetched && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span className="text-green-500">🕒</span>
                最終更新: {new Date(lastFetched).toLocaleString('ja-JP')}
              </p>
            </div>
          )}
        </div>

        {/* ステータスメッセージ */}
        {filteredNews.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium flex items-center gap-2">
              <span className="text-green-500">✅</span>
              {currentSource?.name}から{filteredNews.length}件の記事を正常に読み込みました
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold flex items-center gap-2">
              <span className="text-red-500">❌</span>
              エラー: {error}
            </p>
            <p className="text-sm mt-2">
              ブラウザのコンソール（F12）でより詳細な情報を確認してください
            </p>
          </div>
        )}

        {/* ニュース記事 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-gray-600 text-xl">
              {currentSource?.name}からニュースを取得・翻訳中...
            </p>
            <p className="mt-2 text-gray-500 text-sm">
              翻訳には数秒かかる場合があります
            </p>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                📰 トップ{filteredNews.length}記事
              </h3>
            </div>
            
            <div className="space-y-4">
              {filteredNews.map((item, index) => (
                <article 
                  key={item.id || index} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* 記事番号 */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${currentSource?.color} text-white rounded-full flex items-center justify-center font-bold text-lg`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* 記事コンテンツ */}
                      <div className="flex-1 min-w-0">
                        {/* カテゴリバッジ */}
                        {item.category && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                            {getCategoryNameInJapanese(item.category)}
                          </span>
                        )}
                        
                        <h2 className="text-xl font-semibold mb-2 leading-tight">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-blue-600 transition-colors duration-200 hover:underline"
                          >
                            {item.title}
                          </a>
                        </h2>

                        {/* 原文タイトル */}
                        {item.originalTitle && item.originalTitle !== item.title && (
                          <p className="text-gray-500 text-sm mb-3 italic">
                            原文: {item.originalTitle}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {item.timestamp && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <span>🕒</span>
                              {item.timestamp}
                            </span>
                          )}
                          
                          <span className="text-gray-500 flex items-center gap-1">
                            <span>🌐</span>
                            {currentSource?.language.toUpperCase()}から翻訳
                          </span>
                          
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium transition-colors duration-200 flex items-center gap-1"
                          >
                            <span>📖</span>
                            元記事を読む
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
            <p className="text-yellow-800 text-xl font-semibold mb-2">
              ニュースが見つかりませんでした
            </p>
            <p className="text-yellow-700 mb-6">
              {currentSource?.name}からニュースを取得できませんでした
            </p>
            <button 
              onClick={() => fetchNews()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              🔄 再試行
            </button>
          </div>
        )}
      </div>

      {/* 右サイドバー - カテゴリ */}
      <div className="w-80 bg-white shadow-lg border-l border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🏷️ カテゴリ
          </h2>
          <p className="text-gray-600 text-sm">
            カテゴリでニュースをフィルター
          </p>
        </div>
        
        <div className="p-4 space-y-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">📰 全てのニュース</span>
              <span className="text-sm">{news.length}</span>
            </div>
          </button>

          {Object.entries(categories).map(([category, count]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {getCategoryIcon(category)} {getCategoryNameInJapanese(category)}
                </span>
                <span className="text-sm">{count}</span>
              </div>
            </button>
          ))}
        </div>

        {/* カテゴリ情報 */}
        <div className="p-4 m-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">
            カテゴリフィルター
          </h3>
          <p className="text-sm text-gray-600">
            表示中: {selectedCategory === 'all' ? '全カテゴリ' : getCategoryNameInJapanese(selectedCategory)}
          </p>
          <p className="text-sm text-gray-600">
            記事数: {filteredNews.length}件
          </p>
        </div>
      </div>
    </div>
  );
}

// カテゴリアイコンのヘルパー関数
function getCategoryIcon(category) {
  const icons = {
    politics: '🏛️',
    economics: '💰',
    sports: '⚽',
    technology: '💻',
    entertainment: '🎭',
    health: '🏥',
    science: '🔬',
    education: '📚',
    business: '💼',
    international: '🌍',
    local: '🏘️',
    weather: '🌤️'
  };
  return icons[category?.toLowerCase()] || '📄';
}

// カテゴリ名を日本語に変換
function getCategoryNameInJapanese(category) {
  const translations = {
    politics: '政治',
    economics: '経済',
    sports: 'スポーツ',
    technology: 'テクノロジー',
    entertainment: 'エンタメ',
    health: '健康',
    science: '科学',
    education: '教育',
    business: 'ビジネス',
    international: '国際',
    local: '地域',
    weather: '天気',
    general: '一般'
  };
  return translations[category?.toLowerCase()] || category;
}