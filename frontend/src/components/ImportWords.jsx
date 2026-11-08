import React, { useState } from 'react';
import axios from 'axios';

const ImportWords = ({ setId, onImportComplete }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/words/sets/${setId}/import`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Successfully imported ${response.data.imported} words!`);
      setText('');
      onImportComplete?.();
    } catch (error) {
      alert('Error importing words: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Import Words</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-700">
          <strong>Format:</strong> word - translation (one per line)
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Example:</strong><br/>
          hello - cześć<br/>
          world - świat
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your words here..."
        className="w-full h-52 sm:h-64 p-4 border border-gray-300 rounded-lg mb-4 font-mono text-sm"
      />

      <button
        onClick={handleImport}
        disabled={loading || !text.trim()}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? 'Importing...' : 'Import Words'}
      </button>
    </div>
  );
};

export default ImportWords;
