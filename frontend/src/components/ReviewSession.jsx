import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewModes from './ReviewModes';

const ReviewSession = ({ set, onFinish }) => {
  const [sessionWords, setSessionWords] = useState([]);
  const [initialWordsCount, setInitialWordsCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState({ correct: 0, incorrect: 0 });
  const [cardStartedAt, setCardStartedAt] = useState(Date.now());
  const [sessionLimit, setSessionLimit] = useState(10);
  const [answerDirection, setAnswerDirection] = useState('word-to-translation');
  const [directionLocked, setDirectionLocked] = useState(false);
  const [requireCorrectAnswer, setRequireCorrectAnswer] = useState(false);
  const [repeatIncorrectAtEnd, setRepeatIncorrectAtEnd] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draftSessionLimit, setDraftSessionLimit] = useState(10);
  const [draftAnswerDirection, setDraftAnswerDirection] = useState('word-to-translation');

  useEffect(() => {
    fetchReviewWords(10);
  }, [set.id]);

  useEffect(() => {
    setCardStartedAt(Date.now());
  }, [currentIndex, sessionWords.length]);

  const fetchReviewWords = async (limit = sessionLimit) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/learning/sets/${set.id}/review`, {
        params: { limit },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionWords(response.data || []);
      setInitialWordsCount((response.data || []).length);
      setCurrentIndex(0);
      setFinished(false);
      setResults({ correct: 0, incorrect: 0 });
      setDirectionLocked(false);
      setCardStartedAt(Date.now());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching review words:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (quality) => {
    const word = sessionWords[currentIndex];
    if (!word) return;
    setDirectionLocked(true);

    const durationSeconds = Math.round((Date.now() - cardStartedAt) / 1000);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/learning/results',
        { historyId: word.historyId || word.history_id, quality, durationSeconds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error submitting result:', err);
    }

    setResults(prev => ({
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      incorrect: prev.incorrect + (quality < 3 ? 1 : 0)
    }));

    let updatedWords = sessionWords;
    if (repeatIncorrectAtEnd && quality < 3) {
      updatedWords = [
        ...sessionWords,
        {
          ...word,
          queueRetryKey: `${word.historyId || word.history_id}-${Date.now()}-${Math.random()}`
        }
      ];
      setSessionWords(updatedWords);
    }

    if (currentIndex + 1 >= updatedWords.length) {
      setFinished(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setCardStartedAt(Date.now());
    }
  };

  const openSettings = () => {
    setDraftSessionLimit(sessionLimit);
    setDraftAnswerDirection(answerDirection);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    const nextLimit = Math.min(200, Math.max(1, Number.parseInt(draftSessionLimit || '1', 10)));
    setSessionLimit(nextLimit);

    if (!directionLocked) {
      setAnswerDirection(draftAnswerDirection);
    }

    setIsSettingsOpen(false);
    fetchReviewWords(nextLimit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-gray-500">Ładowanie słówek...</p>
        </div>
      </div>
    );
  }

  if (sessionWords.length === 0) {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Brak słówek do powtórki!</h2>
        <p className="text-gray-500 mb-6">
          Wszystkie słówka w tym zestawie są aktualne. Wróć później.
        </p>
        <button
          onClick={onFinish}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Wróć do dashboardu
        </button>
      </div>
    );
  }

  if (finished) {
    const answeredCount = results.correct + results.incorrect;
    const accuracy = answeredCount > 0
      ? Math.round((results.correct / answeredCount) * 100)
      : 0;

    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6 text-center">
        <div className="text-6xl mb-4">
          {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '👍' : '💪'}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Sesja zakończona!</h2>
        <p className="text-gray-500 mb-6">Zestaw: {set.name}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{initialWordsCount}</div>
            <div className="text-sm text-gray-500">W sesji</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{results.correct}</div>
            <div className="text-sm text-gray-500">Poprawnych</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{results.incorrect}</div>
            <div className="text-sm text-gray-500">Błędnych prób</div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="text-3xl font-bold mb-1">{accuracy}%</div>
          <div className="text-gray-500">Skuteczność</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { fetchReviewWords(sessionLimit); }}
            className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
          >
            Powtórz jeszcze raz
          </button>
          <button
            onClick={onFinish}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentWord = sessionWords[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-700 break-words">{set.name}</h2>
          <p className="text-sm text-gray-400">
            {currentIndex + 1} / {sessionWords.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openSettings}
            className="text-gray-500 hover:text-gray-700 text-xl"
            title="Ustawienia sesji"
            aria-label="Ustawienia sesji"
          >
            ⚙️
          </button>
          <button
            onClick={onFinish}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Zakończ
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="text-xs text-gray-500 mb-3">
          Kierunek: {answerDirection === 'word-to-translation' ? 'Slowo do tlumaczenia' : 'Tlumaczenie do slowa'} | Limit: {sessionLimit}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={requireCorrectAnswer}
              onChange={(e) => setRequireCorrectAnswer(e.target.checked)}
            />
            Wymagaj poprawnej odpowiedzi (Typing)
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={repeatIncorrectAtEnd}
              onChange={(e) => setRepeatIncorrectAtEnd(e.target.checked)}
            />
            Bledne slowka powtorz na koniec sesji
          </label>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md max-h-[85vh] bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 overflow-y-auto max-h-[85vh]">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ustawienia sesji</h3>

              <div className="space-y-4">
                <label className="block text-sm text-gray-700">
                  Ile slowek w sesji
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={draftSessionLimit}
                    onChange={(e) => setDraftSessionLimit(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>

                <div>
                  <div className="text-sm text-gray-700 mb-2">Kierunek odpowiedzi</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => !directionLocked && setDraftAnswerDirection('word-to-translation')}
                      disabled={directionLocked}
                      className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                        draftAnswerDirection === 'word-to-translation'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Slowo do tlumaczenia
                    </button>
                    <button
                      onClick={() => !directionLocked && setDraftAnswerDirection('translation-to-word')}
                      disabled={directionLocked}
                      className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                        draftAnswerDirection === 'translation-to-word'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Tlumaczenie do slowa
                    </button>
                  </div>
                  {directionLocked && (
                    <p className="text-xs text-gray-500 mt-2">
                      Kierunek jest zablokowany dla tej sesji. Zmienisz go w nowej sesji.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-gray-200 bg-white sticky bottom-0">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex) / sessionWords.length) * 100}%` }}
        />
      </div>

      <ReviewModes
        word={currentWord.word}
        translation={currentWord.translation}
        onSubmit={handleSubmit}
        requireCorrectAnswer={requireCorrectAnswer}
        answerDirection={answerDirection}
      />
    </div>
  );
};

export default ReviewSession;
