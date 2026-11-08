import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlashCard = ({ word, translation, onNext, mode }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (mode === 'flip') {
    return (
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="bg-white rounded-lg shadow-lg p-8 cursor-pointer h-64 flex items-center justify-center transition-all duration-300"
      >
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">
            {isFlipped ? translation : word}
          </div>
          <div className="text-sm text-gray-500">
            {isFlipped ? 'Translation' : 'Word'} - Click to flip
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-4">Translate:</div>
        <div className="text-4xl font-bold">{word}</div>
      </div>
    </div>
  );
};

export default FlashCard;
