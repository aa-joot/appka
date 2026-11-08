import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import CreateSet from './components/CreateSet';
import ImportWords from './components/ImportWords';
import ReviewSession from './components/ReviewSession';
import Statistics from './components/Statistics';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedSet, setSelectedSet] = useState(null);
  const [wordSets, setWordSets] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) fetchWordSets();
  }, [user]);

  const fetchWordSets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/words/sets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWordSets(response.data);
    } catch (err) {
      console.error('Error fetching word sets:', err);
    }
  };

  const handleNavigate = (view, set = null) => {
    setSelectedSet(set);
    setCurrentView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setWordSets([]);
    setCurrentView('dashboard');
  };

  const handleSetCreated = (newSet) => {
    fetchWordSets();
    setSelectedSet(newSet);
    setCurrentView('import');
  };

  if (!user) {
    return <AuthForm onAuthSuccess={(u) => { setUser(u); }} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
          >
            QuizAnki
          </button>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`text-xl ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => handleNavigate('statistics')}
              className={`text-sm font-semibold ${currentView === 'statistics' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
            >
              Statystyki
            </button>
            {currentView !== 'dashboard' && (
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ← Dashboard
              </button>
            )}
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-[140px] truncate`} title={user.username}>{user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 ml-auto sm:ml-0"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            wordSets={wordSets}
            onRefreshSets={fetchWordSets}
            isDarkMode={isDarkMode}
          />
        )}

        {currentView === 'create-set' && (
          <CreateSet
            onSetCreated={handleSetCreated}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'import' && selectedSet && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 text-sm text-gray-500">
              Zestaw: <span className="font-semibold text-gray-700">{selectedSet.name}</span>
            </div>
            <ImportWords
              setId={selectedSet.id}
              onImportComplete={() => {
                fetchWordSets();
                handleNavigate('dashboard');
              }}
            />
          </div>
        )}

        {currentView === 'review' && selectedSet && (
          <ReviewSession
            set={selectedSet}
            onFinish={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'statistics' && <Statistics />}
      </main>
    </div>
  );
}

export default App;
