const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const validateAnswer = (puzzle, answer) => {
  if (!puzzle || !answer) return false;

  // Clean and normalize the answer
  const cleanAnswer = answer.trim().toLowerCase();
  
  // Basic validation
  if (cleanAnswer.length < 2) return false;
  
  // Check if the answer contains only letters
  if (!/^[a-z]+$/.test(cleanAnswer)) return false;

  // If puzzle has a custom validation function, use it
  if (typeof puzzle.validate === 'function') {
    return puzzle.validate(cleanAnswer);
  }

  // Default validation based on puzzle type
  switch (puzzle.type) {
    case 'wordChain':
      return cleanAnswer.startsWith(puzzle.answer.slice(-2).toLowerCase()) &&
             cleanAnswer.length >= 3;

    case 'anagram':
      return cleanAnswer === puzzle.answer.toLowerCase();

    case 'rhyme':
      const answerPhonetics = natural.Metaphone.process(cleanAnswer);
      const targetPhonetics = natural.Metaphone.process(puzzle.answer);
      return answerPhonetics.slice(-2) === targetPhonetics.slice(-2) &&
             cleanAnswer !== puzzle.answer.toLowerCase();

    case 'category':
      // Check if answer exists in the category
      return puzzle.category.includes(cleanAnswer);

    default:
      return false;
  }
};

// Additional validation helpers
const isRealWord = async (word) => {
  return new Promise((resolve) => {
    wordnet.lookup(word, (results) => {
      resolve(results.length > 0);
    });
  });
};

const getWordDifficulty = (word) => {
  // Calculate difficulty based on word length and common letter patterns
  let difficulty = word.length * 0.5;
  
  // Add difficulty for uncommon letters
  const uncommonLetters = 'jkqxz';
  difficulty += word.split('').filter(char => uncommonLetters.includes(char)).length * 2;
  
  // Add difficulty for consonant clusters
  const consonantClusters = word.match(/[bcdfghjklmnpqrstvwxyz]{3,}/g) || [];
  difficulty += consonantClusters.length * 1.5;

  return Math.min(10, Math.round(difficulty));
};

module.exports = {
  validateAnswer,
  isRealWord,
  getWordDifficulty
};
