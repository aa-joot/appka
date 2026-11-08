import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const levelClass = (reviews) => {
  if (!reviews) return 'bg-gray-100';
  if (reviews <= 2) return 'bg-green-200';
  if (reviews <= 5) return 'bg-green-400';
  if (reviews <= 9) return 'bg-green-500';
  return 'bg-green-700';
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeStats, setShowTimeStats] = useState(true);
  const [showWordStats, setShowWordStats] = useState(true);
  const [showStreakStats, setShowStreakStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/stats/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const heatMapDays = useMemo(() => {
    if (!stats?.heatmap) return [];

    const byDate = new Map(stats.heatmap.map((d) => [d.date, d]));
    const days = [];
    const today = new Date();

    for (let i = 139; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const entry = byDate.get(key);
      days.push({
        date: key,
        reviews: entry?.reviews || 0,
        minutes: entry?.minutes || 0
      });
    }

    return days;
  }, [stats]);

  if (loading) return <div className="text-center py-10">Ładowanie statystyk...</div>;

  if (!stats) return <div className="text-center py-10">Brak danych.</div>;

  const formatStudyTime = (hoursValue) => `${Number(Number(hoursValue || 0).toFixed(2))} h`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Statystyki nauki</h1>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowTimeStats((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-left"
        >
          <span className="font-semibold text-gray-900">Czas nauki i skutecznosc</span>
          <span className="text-gray-500">{showTimeStats ? '▲' : '▼'}</span>
        </button>
      </div>
      {showTimeStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-blue-600 text-white p-5 rounded-xl">
            <div className="text-2xl font-bold">{formatStudyTime(stats.totalHours)}</div>
            <div className="text-sm opacity-90">Łącznie nauki</div>
          </div>
          <div className="bg-indigo-600 text-white p-5 rounded-xl">
            <div className="text-2xl font-bold">{formatStudyTime(stats.lastWeekHours)}</div>
            <div className="text-sm opacity-90">W zeszłym tygodniu</div>
          </div>
          <div className="bg-emerald-600 text-white p-5 rounded-xl">
            <div className="text-2xl font-bold">{stats.dailyAverageMinutes} min</div>
            <div className="text-sm opacity-90">Daily average</div>
          </div>
          <div className="bg-purple-600 text-white p-5 rounded-xl">
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <div className="text-sm opacity-90">Skuteczność</div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShowWordStats((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-left"
        >
          <span className="font-semibold text-gray-900">Postep slowek</span>
          <span className="text-gray-500">{showWordStats ? '▲' : '▼'}</span>
        </button>
      </div>
      {showWordStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.words.new}</div>
            <div className="text-sm text-gray-500">Nowe słówka</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.words.learning}</div>
            <div className="text-sm text-gray-500">W nauce</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-700">{stats.words.learned}</div>
            <div className="text-sm text-gray-500">Nauczone</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.words.reviewed}</div>
            <div className="text-sm text-gray-500">Powtórzone</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-rose-700">{stats.totalReviews}</div>
            <div className="text-sm text-gray-500">Wszystkie review</div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShowStreakStats((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-left"
        >
          <span className="font-semibold text-gray-900">Dni i serie nauki</span>
          <span className="text-gray-500">{showStreakStats ? '▲' : '▼'}</span>
        </button>
      </div>

      {showStreakStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-xl font-bold">{stats.daysLearned}</div>
            <div className="text-sm text-gray-500">Days learned</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-xl font-bold">{stats.longestStreak}</div>
            <div className="text-sm text-gray-500">Longest streak</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-gray-500">Current streak</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="text-xl font-bold">{stats.words.total}</div>
            <div className="text-sm text-gray-500">Wszystkie słówka</div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-1">Pixel mapa nauki</h2>
        <p className="text-sm text-gray-500 mb-4">Ostatnie 140 dni</p>

        <div className="overflow-x-auto">
          <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-max">
            {heatMapDays.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.reviews} powtórek, ${d.minutes} min`}
                className={`w-3.5 h-3.5 rounded-sm ${levelClass(d.reviews)}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <span>Mniej</span>
          <span className="w-3.5 h-3.5 rounded-sm bg-gray-100" />
          <span className="w-3.5 h-3.5 rounded-sm bg-green-200" />
          <span className="w-3.5 h-3.5 rounded-sm bg-green-400" />
          <span className="w-3.5 h-3.5 rounded-sm bg-green-500" />
          <span className="w-3.5 h-3.5 rounded-sm bg-green-700" />
          <span>Więcej</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
