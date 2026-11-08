const sm2 = (easeFactor, quality) => {
  // SM-2 algorithm for spaced repetition
  // quality: 0-5 (0=forgot, 5=perfect recall)
  
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);
  
  return newEaseFactor;
};

const calculateNextReview = (interval, easeFactor, quality) => {
  // quality: 0-5
  let newInterval = interval;
  
  if (quality < 3) {
    newInterval = 1;
  } else {
    newInterval = Math.ceil(interval * easeFactor);
  }
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return { nextReviewDate, newInterval };
};

module.exports = {
  sm2,
  calculateNextReview
};
