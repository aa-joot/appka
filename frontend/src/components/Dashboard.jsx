import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ onNavigate, wordSets, onRefreshSets, isDarkMode }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewSchedule, setReviewSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState('');
  const [hardWords, setHardWords] = useState([]);
  const [hardWordsLoading, setHardWordsLoading] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: false,
    pushNotifications: false
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [selectedSetName, setSelectedSetName] = useState('');
  const [selectedSetWords, setSelectedSetWords] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('word-asc');
  const [visibleCount, setVisibleCount] = useState(20);
  const [scheduleFilter, setScheduleFilter] = useState('all');

  useEffect(() => {
    fetchStats();
    fetchReviewSchedule();
    fetchNotificationPreferences();
  }, []);

  useEffect(() => {
    fetchReviewSchedule();
  }, [wordSets]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/stats/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewSchedule = async () => {
    try {
      setScheduleLoading(true);
      setScheduleError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/stats/review-schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewSchedule(response.data || []);
    } catch (error) {
      console.error('Error fetching review schedule:', error);
      setScheduleError('Nie udalo sie pobrac harmonogramu. Pokazuje liste zestawow bez terminow.');
      const fallbackSets = (wordSets || []).map((set) => ({
        id: set.id,
        name: set.name,
        language: set.language,
        totalWords: 0,
        dueNow: 0,
        nextReviewAt: null
      }));
      setReviewSchedule(fallbackSets);
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchHardWords = async (setId) => {
    if (!setId) {
      setHardWords([]);
      return;
    }

    try {
      setHardWordsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/learning/sets/${setId}/hard-words`, {
        params: { limit: 8 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setHardWords(response.data || []);
    } catch (error) {
      console.error('Error fetching hard words:', error);
      setHardWords([]);
    } finally {
      setHardWordsLoading(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationPreferences({
        emailNotifications: Boolean(response.data?.emailNotifications),
        pushNotifications: Boolean(response.data?.pushNotifications)
      });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const updateNotificationPreference = async (field, value) => {
    if (field === 'pushNotifications' && value && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          window.alert('Brak zgody na powiadomienia przegladarki.');
          return;
        }
      }
      if (Notification.permission === 'denied') {
        window.alert('Powiadomienia przegladarki sa zablokowane. Odblokuj je w ustawieniach przegladarki.');
        return;
      }
    }

    const nextPreferences = {
      ...notificationPreferences,
      [field]: value
    };

    try {
      setSavingNotifications(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '/api/notifications/preferences',
        nextPreferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationPreferences({
        emailNotifications: Boolean(response.data?.emailNotifications),
        pushNotifications: Boolean(response.data?.pushNotifications)
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      window.alert('Nie udalo sie zapisac ustawien przypomnien.');
    } finally {
      setSavingNotifications(false);
    }
  };

  const formatNextReview = (item) => {
    if (item.dueNow > 0) {
      return `Do powtorki teraz (${item.dueNow})`;
    }
    if (!item.nextReviewAt) {
      return 'Brak zaplanowanych powtorek';
    }

    const nextDate = new Date(item.nextReviewAt);
    if (Number.isNaN(nextDate.getTime())) {
      return 'Termin niedostepny';
    }

    const now = new Date();
    const diffMs = nextDate.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours <= 24) {
      if (diffHours <= 1) return 'Za mniej niz godzine';
      return `Za ok. ${diffHours} godz.`;
    }

    const diffDays = Math.round(diffHours / 24);
    if (diffDays <= 1) return 'Jutro';
    if (diffDays <= 7) return `Za ${diffDays} dni`;

    return nextDate.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCreatedAt = (dateValue) => {
    if (!dateValue) return 'Data utworzenia: brak';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Data utworzenia: brak';
    return `Utworzono: ${date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  };

  const getSchedulePriority = (item) => {
    if (item.dueNow > 0) return 'high';
    if (!item.nextReviewAt) return 'low';

    const nextDate = new Date(item.nextReviewAt);
    if (Number.isNaN(nextDate.getTime())) return 'low';

    const hoursToReview = (nextDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursToReview <= 24) return 'medium';
    return 'low';
  };

  const getPriorityClasses = (item) => {
    const priority = getSchedulePriority(item);

    if (priority === 'high') {
      return {
        badge: isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700',
        marker: 'bg-red-500',
        status: 'text-red-500',
        label: 'Wysoki'
      };
    }

    if (priority === 'medium') {
      return {
        badge: isDarkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-700',
        marker: 'bg-amber-500',
        status: 'text-amber-500',
        label: 'Sredni'
      };
    }

    return {
      badge: isDarkMode ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
      marker: 'bg-emerald-500',
      status: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      label: 'Niski'
    };
  };

  const handleStartReview = () => {
    if (wordSets && wordSets.length > 0) {
      onNavigate('review', wordSets[0]);
    } else {
      onNavigate('create-set');
    }
  };

  const handleSelectSet = async (set) => {
    try {
      setSelectedSetId(set.id);
      setSelectedSetName(set.name);
      setPreviewLoading(true);
      setSearchQuery('');
      setSortBy('word-asc');
      setVisibleCount(20);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/words/sets/${set.id}/words`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSetWords(response.data || []);
      fetchHardWords(set.id);
    } catch (error) {
      console.error('Error fetching set words:', error);
      setSelectedSetWords([]);
      setHardWords([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeleteSet = async (set) => {
    const confirmDelete = window.confirm(`Czy na pewno usunac zestaw "${set.name}"? Tej operacji nie da sie cofnac.`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/words/sets/${set.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (selectedSetId === set.id) {
        setSelectedSetId(null);
        setSelectedSetName('');
        setSelectedSetWords([]);
        setHardWords([]);
        setSearchQuery('');
        setSortBy('word-asc');
        setVisibleCount(20);
      }

      if (onRefreshSets) {
        await onRefreshSets();
      }
      fetchStats();
      fetchReviewSchedule();
    } catch (error) {
      console.error('Error deleting set:', error);
      window.alert('Nie udalo sie usunac zestawu. Sprobuj ponownie.');
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredWords = selectedSetWords.filter((word) => {
    if (!normalizedQuery) return true;
    return (
      String(word.word || '').toLowerCase().includes(normalizedQuery) ||
      String(word.translation || '').toLowerCase().includes(normalizedQuery)
    );
  });

  const sortedWords = [...filteredWords].sort((a, b) => {
    const leftWord = String(a.word || '').toLowerCase();
    const rightWord = String(b.word || '').toLowerCase();
    const leftTranslation = String(a.translation || '').toLowerCase();
    const rightTranslation = String(b.translation || '').toLowerCase();

    if (sortBy === 'word-desc') return rightWord.localeCompare(leftWord);
    if (sortBy === 'translation-asc') return leftTranslation.localeCompare(rightTranslation);
    if (sortBy === 'translation-desc') return rightTranslation.localeCompare(leftTranslation);
    return leftWord.localeCompare(rightWord);
  });

  const visibleWords = sortedWords.slice(0, visibleCount);
  const canShowMore = sortedWords.length > visibleWords.length;
  const dueNowTotal = reviewSchedule.reduce((sum, item) => sum + Number(item.dueNow || 0), 0);
  useEffect(() => {
    if (!notificationPreferences.pushNotifications) return;
    if (dueNowTotal <= 0) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `quizanki-due-notified-${todayKey}`;
    if (localStorage.getItem(storageKey) === '1') return;

    const notification = new Notification('QuizAnki: czas na powtorke', {
      body: `Masz ${dueNowTotal} slowek do powtorki teraz.`
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    localStorage.setItem(storageKey, '1');
  }, [dueNowTotal, notificationPreferences.pushNotifications]);
  const filteredSchedule = reviewSchedule.filter((item) => {
    if (scheduleFilter === 'due-now') return Number(item.dueNow || 0) > 0;
    if (scheduleFilter === 'next-24h') {
      if (Number(item.dueNow || 0) > 0) return true;
      if (!item.nextReviewAt) return false;
      const nextDate = new Date(item.nextReviewAt);
      if (Number.isNaN(nextDate.getTime())) return false;
      const hoursToReview = (nextDate.getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursToReview <= 24;
    }
    if (scheduleFilter === 'high-priority') return getSchedulePriority(item) === 'high';
    return true;
  });

  if (loading) return <div className="text-center py-10">Ładowanie...</div>;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      <div className="grid xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,280px)] gap-6 items-start">
        {/* Zestawy słówek */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 sm:p-6 rounded-xl shadow-sm xl:sticky xl:top-24 max-h-[60vh] xl:h-[70vh] flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Twoje zestawy</h2>
            <button
              onClick={() => onNavigate('create-set')}
              className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
            >
              + Nowy
            </button>
          </div>

          {!wordSets || wordSets.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="text-4xl mb-2">📚</div>
              <p>Brak zestawów</p>
              <button
                onClick={() => onNavigate('create-set')}
                className={`mt-3 text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
              >
                Utwórz pierwszy zestaw
              </button>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {wordSets.map(set => (
                <div
                  key={set.id}
                  onClick={() => handleSelectSet(set)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedSetId === set.id
                      ? (isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200')
                      : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 border-transparent' : 'bg-gray-50 hover:bg-gray-100 border-transparent')
                  }`}
                >
                  <div className="mb-2">
                    <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{set.name}</div>
                    {set.language && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>{set.language}</div>
                    )}
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatCreatedAt(set.created_at)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSet(set);
                      }}
                      className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      Usun
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('import', set);
                      }}
                      className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                    >
                      Import
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('review', set);
                      }}
                      className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                      Powtórka
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full min-w-0 max-w-4xl mx-auto">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>

          {/* Statystyki */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-blue-500 text-white p-5 rounded-xl">
              <div className="text-3xl font-bold">{stats?.totalWords || 0}</div>
              <div className="text-sm opacity-90">Wszystkie słówka</div>
            </div>
            <div className="bg-green-500 text-white p-5 rounded-xl">
              <div className="text-3xl font-bold">{stats?.learned || 0}</div>
              <div className="text-sm opacity-90">Nauczone</div>
            </div>
            <div className="bg-yellow-500 text-white p-5 rounded-xl">
              <div className="text-3xl font-bold">{stats?.learning || 0}</div>
              <div className="text-sm opacity-90">W nauce</div>
            </div>
            <div className="bg-purple-500 text-white p-5 rounded-xl">
              <div className="text-3xl font-bold">{stats?.wordsReviewedToday || 0}</div>
              <div className="text-sm opacity-90">Dziś powtórzono</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 sm:p-6 rounded-xl shadow-sm`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Szybkie akcje</h2>
            <div className="space-y-3">
              <button
                onClick={handleStartReview}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                🔄 Zacznij powtórkę
              </button>
              <button
                onClick={() => onNavigate('create-set')}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                ➕ Nowy zestaw
              </button>
              <button
                onClick={() => {
                  if (wordSets && wordSets.length > 0) {
                    onNavigate('import', wordSets[0]);
                  } else {
                    onNavigate('create-set');
                  }
                }}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                📥 Importuj słówka
              </button>
              <button
                onClick={() => onNavigate('statistics')}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
              >
                📊 Zobacz statystyki
              </button>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 sm:p-6 rounded-xl shadow-sm mt-6`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Podgląd zestawu</h2>

            {!selectedSetId && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Kliknij zestaw w sekcji „Twoje zestawy”, aby zobaczyć listę słówek.
              </p>
            )}

            {selectedSetId && previewLoading && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ładowanie słówek...</p>
            )}

            {selectedSetId && !previewLoading && (
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                    {selectedSetName}
                  </h3>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {sortedWords.length} wynikow
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(20);
                    }}
                    placeholder="Szukaj slowa lub tlumaczenia"
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  />

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="word-asc">Sortowanie: Slowo A-Z</option>
                    <option value="word-desc">Sortowanie: Slowo Z-A</option>
                    <option value="translation-asc">Sortowanie: Tlumaczenie A-Z</option>
                    <option value="translation-desc">Sortowanie: Tlumaczenie Z-A</option>
                  </select>
                </div>
              </div>
            )}

            {selectedSetId && !previewLoading && selectedSetWords.length === 0 && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ten zestaw nie ma jeszcze słówek.</p>
            )}

            {selectedSetId && !previewLoading && selectedSetWords.length > 0 && sortedWords.length === 0 && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Brak wynikow dla podanej frazy.
              </p>
            )}

            {selectedSetId && !previewLoading && visibleWords.length > 0 && (
              <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {visibleWords.map((word) => (
                  <li key={word.id} className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium break-words`}>{word.word}</span>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} sm:text-right break-words`}>{word.translation}</span>
                  </li>
                ))}
              </ul>
            )}

            {selectedSetId && !previewLoading && canShowMore && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pokaz wiecej
              </button>
            )}
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 sm:p-6 rounded-xl shadow-sm mt-6`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trudne slowka</h2>

            {!selectedSetId && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Wybierz zestaw, aby zobaczyc najtrudniejsze slowka.
              </p>
            )}

            {selectedSetId && hardWordsLoading && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ladowanie trudnych slowek...</p>
            )}

            {selectedSetId && !hardWordsLoading && hardWords.length === 0 && (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Brak danych o trudnych slowkach dla tego zestawu.
              </p>
            )}

            {selectedSetId && !hardWordsLoading && hardWords.length > 0 && (
              <ul className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {hardWords.map((item) => (
                  <li key={item.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold break-words`}>
                          {item.word} - {item.translation}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Proby: {item.attempts} | Bledy: {item.incorrect}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>
                        {item.accuracy}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border p-4 sm:p-6 rounded-xl shadow-sm xl:sticky xl:top-24 max-h-[60vh] xl:h-[70vh] flex flex-col`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Kiedy powtorka</h2>
              {dueNowTotal > 0 && (
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-red-600 text-white text-xs font-bold">
                  {dueNowTotal}
                </span>
              )}
            </div>
            <button
              onClick={fetchReviewSchedule}
              className={`text-xs font-semibold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
            >
              Odswiez
            </button>
          </div>

          <div className="mb-4">
            <select
              value={scheduleFilter}
              onChange={(e) => setScheduleFilter(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Wszystkie</option>
              <option value="due-now">Do powtorki teraz</option>
              <option value="next-24h">Do 24 godzin</option>
              <option value="high-priority">Wysoki priorytet</option>
            </select>
          </div>

          {!scheduleLoading && scheduleError && (
            <div className={`text-xs mb-3 px-3 py-2 rounded ${isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
              {scheduleError}
            </div>
          )}

          <div className={`${isDarkMode ? 'bg-gray-700/60' : 'bg-gray-50'} rounded-lg p-3 mb-4`}>
            <div className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Przypomnienia</div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between gap-3">
                <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Email</span>
                <input
                  type="checkbox"
                  checked={notificationPreferences.emailNotifications}
                  disabled={savingNotifications}
                  onChange={(e) => updateNotificationPreference('emailNotifications', e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Push (przegladarka)</span>
                <input
                  type="checkbox"
                  checked={notificationPreferences.pushNotifications}
                  disabled={savingNotifications}
                  onChange={(e) => updateNotificationPreference('pushNotifications', e.target.checked)}
                />
              </label>
            </div>
          </div>

          {scheduleLoading && (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ladowanie harmonogramu...</p>
          )}

          {!scheduleLoading && reviewSchedule.length === 0 && (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nie masz jeszcze zestawow do planowania powtorek.</p>
          )}

          {!scheduleLoading && reviewSchedule.length > 0 && filteredSchedule.length === 0 && (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brak zestawow dla wybranego filtra.</p>
          )}

          {!scheduleLoading && filteredSchedule.length > 0 && (
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {filteredSchedule.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSet(item)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedSetId === item.id
                      ? (isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200')
                      : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 border-transparent' : 'bg-gray-50 hover:bg-gray-100 border-transparent')
                  }`}
                >
                  <div className="mb-2 flex items-start gap-2">
                    <div className={`w-1 self-stretch rounded ${getPriorityClasses(item).marker}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold text-sm break-words`}>{item.name}</div>
                        {item.dueNow > 0 && (
                          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold shrink-0">
                            {item.dueNow}
                          </span>
                        )}
                      </div>
                    {item.language && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.language}</div>
                    )}
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded ${getPriorityClasses(item).badge}`}>
                          Priorytet: {getPriorityClasses(item).label}
                        </span>
                        <span className={`text-xs ${getPriorityClasses(item).status}`}>
                          {formatNextReview(item)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSet(item);
                      }}
                      className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Podglad
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('review', item);
                      }}
                      className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    >
                      Powtorka
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
