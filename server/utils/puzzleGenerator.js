const natural = require('natural');
const wordnet = new natural.WordNet();

const puzzleTypes = {
  WORD_CHAIN: 'wordChain',
  ANAGRAM: 'anagram',
  RHYME: 'rhyme',
  CATEGORY: 'category'
};

// Word lists for different categories
const categories = {
  animals: ['lion', 'elephant', 'giraffe', 'zebra', 'penguin', 'tiger', 'bear'],
  colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
  fruits: ['apple', 'banana', 'orange', 'grape', 'mango', 'pear', 'kiwi'],
  countries: ['france', 'spain', 'italy', 'germany', 'japan', 'brazil', 'canada']
};

// Generate a random word from WordNet
const getRandomWord = () => {
  return new Promise((resolve) => {
    wordnet.randomWord((word) => {
      resolve(word || 'ghost'); // fallback word if WordNet fails
    });
  });
};

// Shuffle a word to create an anagram
const shuffleWord = (word) => {
  return word.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate a puzzle based on position in maze
const generatePuzzle = async (position) => {
  const puzzleType = Object.values(puzzleTypes)[Math.floor(Math.random() * 4)];
  let puzzle = {
    type: puzzleType,
    difficulty: Math.floor(position.x + position.y) / 2
  };

  switch (puzzleType) {
    case puzzleTypes.WORD_CHAIN:
      const baseWord = await getRandomWord();
      puzzle.prompt = `Create a word that starts with "${baseWord.slice(-2)}"`;
      puzzle.answer = baseWord;
      puzzle.validate = (input) => {
        return input.toLowerCase().startsWith(baseWord.slice(-2).toLowerCase()) &&
               input.length >= 3;
      };
      break;

    case puzzleTypes.ANAGRAM:
      const word = await getRandomWord();
      puzzle.prompt = `Unscramble: ${shuffleWord(word)}`;
      puzzle.answer = word;
      puzzle.validate = (input) => input.toLowerCase() === word.toLowerCase();
      break;

    case puzzleTypes.RHYME:
      const baseRhymeWord = await getRandomWord();
      puzzle.prompt = `Find a word that rhymes with "${baseRhymeWord}"`;
      puzzle.answer = baseRhymeWord;
      puzzle.validate = (input) => {
        const soundsLike = natural.Metaphone.compare(
          baseRhymeWord.slice(-2),
          input.slice(-2)
        );
        return soundsLike && input.toLowerCase() !== baseRhymeWord.toLowerCase();
      };
      break;

    case puzzleTypes.CATEGORY:
      const categoryKeys = Object.keys(categories);
      const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
      puzzle.prompt = `Name a ${category.slice(0, -1)}`;
      puzzle.category = category;
      puzzle.validate = (input) => {
        return categories[category].includes(input.toLowerCase());
      };
      break;
  }

  return puzzle;
};

// Generate maze layout with puzzles
const generateMaze = (size = 8) => {
  const maze = Array(size).fill().map(() => Array(size).fill(0));
  const puzzles = new Map();

  // Generate random paths (1 represents valid path)
  const generatePath = (x, y) => {
    if (x < 0 || x >= size || y < 0 || y >= size || maze[x][y] === 1) return;
    
    maze[x][y] = 1;
    puzzles.set(JSON.stringify({x, y}), generatePuzzle({x, y}));

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    directions.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      if (Math.random() < 0.7) { // 70% chance to continue path
        generatePath(x + dx, y + dy);
      }
    }
  };

  generatePath(0, 0); // Start from top-left
  maze[size-1][size-1] = 1; // Ensure end point is accessible

  return { maze, puzzles };
};

module.exports = {
  generatePuzzle,
  generateMaze,
  puzzleTypes
};
