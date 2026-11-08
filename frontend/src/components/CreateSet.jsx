import React, { useState } from 'react';
import axios from 'axios';

const CreateSet = ({ onSetCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Nazwa zestawu jest wymagana');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/words/sets',
        { name, language, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSetCreated(response.data);
    } catch (err) {
      setError('Błąd tworzenia zestawu: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Nowy zestaw słówek</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-xl font-bold">✕</button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nazwa zestawu *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Angielski - poziom B2"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Język (opcjonalnie)
          </label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="np. Angielski"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Opis (opcjonalnie)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Krótki opis zestawu..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Tworzenie...' : 'Utwórz zestaw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSet;
