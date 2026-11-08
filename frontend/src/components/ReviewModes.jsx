import React, { useEffect, useState } from 'react';

const ReviewModes = ({
  word,
  translation,
  onSubmit,
  requireCorrectAnswer = false,
  answerDirection = 'word-to-translation'
}) => {
  const [selectedMode, setSelectedMode] = useState('flip');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [options, setOptions] = useState([translation, 'wrong1', 'wrong2', 'wrong3']);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [typingResult, setTypingResult] = useState(null); // null | 'correct' | 'wrong'
  const [choiceFeedback, setChoiceFeedback] = useState('');
  const [hadWrongChoiceAttempt, setHadWrongChoiceAttempt] = useState(false);

  useEffect(() => {
    setTypedAnswer('');
    setSelectedAnswer(null);
    setIsFlipped(false);
    setShowHint(false);
    setTypingResult(null);
    setChoiceFeedback('');
    setHadWrongChoiceAttempt(false);
  }, [word, translation, answerDirection]);

  const promptText = answerDirection === 'word-to-translation' ? word : translation;
  const expectedAnswer = answerDirection === 'word-to-translation' ? translation : word;

  useEffect(() => {
    setOptions([expectedAnswer, 'wrong1', 'wrong2', 'wrong3']);
  }, [expectedAnswer]);

  const handleTypingSubmit = () => {
    const isCorrect = typedAnswer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase();
    if (isCorrect) {
      setTypingResult('correct');
      setTimeout(() => onSubmit(5), 800);
    } else {
      setTypingResult('wrong');
    }
  };

  const handleMultipleChoiceSelect = (option) => {
    if (choiceFeedback.startsWith('✅')) return;

    setSelectedAnswer(option);
    const isCorrect = option === expectedAnswer;

    if (isCorrect) {
      setChoiceFeedback('✅ Dobrze!');
      setTimeout(() => onSubmit(hadWrongChoiceAttempt ? 3 : 5), 300);
      return;
    }

    setChoiceFeedback('❌ To błędna odpowiedź. Spróbuj jeszcze raz.');
    setHadWrongChoiceAttempt(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Review Mode</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setSelectedMode('flip')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            selectedMode === 'flip' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Flip Card
        </button>
        <button
          onClick={() => setSelectedMode('typing')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            selectedMode === 'typing' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Type
        </button>
        <button
          onClick={() => setSelectedMode('choice')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            selectedMode === 'choice' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Multiple Choice
        </button>
      </div>

      {selectedMode === 'flip' && (
        <div className="bg-white p-5 sm:p-8 rounded-lg shadow text-center">
          <div className="text-2xl sm:text-3xl font-bold mb-6 break-words">{isFlipped ? expectedAnswer : promptText}</div>

          {!isFlipped ? (
            <button
              onClick={() => setIsFlipped(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Reveal Answer
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onSubmit(0)}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Again
              </button>
              <button
                onClick={() => onSubmit(5)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Good
              </button>
            </div>
          )}
        </div>
      )}

      {selectedMode === 'typing' && (
        <div className="bg-white p-5 sm:p-8 rounded-lg shadow">
          <div className="text-2xl sm:text-3xl font-bold mb-6 text-center break-words">{promptText}</div>

          {showHint && (
            <div className="text-center mb-3 text-sm text-gray-500">
              Podpowiedź:{' '}
              <span className="font-mono font-bold text-blue-600 tracking-widest">
                {expectedAnswer[0].toUpperCase()}
                {'_ '.repeat(expectedAnswer.length - 1).trim()}
              </span>
            </div>
          )}

          <input
            type="text"
            value={typedAnswer}
            onChange={(e) => {
              if (typingResult !== 'wrong') setTypedAnswer(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && typedAnswer.trim() && !typingResult && handleTypingSubmit()}
            placeholder="Wpisz tłumaczenie..."
            disabled={typingResult === 'correct'}
            className={`w-full p-4 border-2 rounded-lg mb-3 focus:outline-none transition-colors ${
              typingResult === 'correct'
                ? 'border-green-500 bg-green-50 text-green-700'
                : typingResult === 'wrong'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            autoFocus
          />

          {typingResult === 'wrong' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
              <div className="text-sm text-red-500 mb-1">❌ Twoja odpowiedź: <span className="font-semibold">{typedAnswer}</span></div>
              <div className="text-sm text-green-700">✅ Poprawna odpowiedź: <span className="font-semibold">{expectedAnswer}</span></div>
              {requireCorrectAnswer && (
                <div className="text-xs text-red-600 mt-2">
                  Tryb wymagajacej poprawnej odpowiedzi jest wlaczony. Aby przejsc dalej, wpisz poprawna odpowiedz.
                </div>
              )}
            </div>
          )}

          {typingResult === 'correct' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-center text-green-700 font-semibold">
              ✅ Dobrze!
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {!typingResult && (
              <>
                <button
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  💡 Podpowiedź
                </button>
                <button
                  onClick={handleTypingSubmit}
                  disabled={!typedAnswer.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40"
                >
                  Sprawdź
                </button>
              </>
            )}

            {typingResult === 'wrong' && (
              <>
                <button
                  onClick={() => { setTypedAnswer(''); setTypingResult(null); }}
                  className="flex-1 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50"
                >
                  Spróbuj jeszcze raz
                </button>
                {!requireCorrectAnswer && (
                  <button
                    onClick={() => onSubmit(0)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  >
                    Dalej →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {selectedMode === 'choice' && (
        <div className="bg-white p-5 sm:p-8 rounded-lg shadow">
          <div className="text-2xl sm:text-3xl font-bold mb-6 text-center break-words">{promptText}</div>

          {choiceFeedback && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
              choiceFeedback.startsWith('✅')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {choiceFeedback}
            </div>
          )}

          <div className="space-y-3 mb-2">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleMultipleChoiceSelect(option)}
                className={`w-full p-4 rounded-lg border-2 font-semibold text-left ${
                  selectedAnswer === option
                    ? option === expectedAnswer
                      ? 'border-green-600 bg-green-50'
                      : 'border-red-600 bg-red-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModes;
