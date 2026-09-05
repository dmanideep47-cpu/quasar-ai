// Challenge content database
// This is the single source of truth for all CodeLab challenges

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Language = "python" | "javascript" | "java" | "sql";
export type Topic = "Algorithms" | "Data Structures" | "Arrays" | "Strings" | "Searching" | "Sorting" | "Recursion" | "SQL" | "Debugging";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  language: Language;
  topic: Topic;
  difficulty: Difficulty;
  starter: string;
  examples: Array<{ input: string; output: string }>;
  constraints: string[];
  testCases: Array<{ input: string; expected: string }>;
  explanation?: string;
  tags?: string[];
}

// Challenge ID format: {language}-{topic}-{difficulty}
export const challenges: Challenge[] = [
  // Python - Algorithms - Easy
  {
    id: "python-max-element-easy",
    title: "Find Maximum Element",
    description: "Write a function that finds and returns the maximum element in a list of integers.",
    language: "python",
    topic: "Algorithms",
    difficulty: "Easy",
    starter: "def find_max(nums):\n    # Your code here\n    pass\n",
    examples: [
      { input: "[1, 5, 3, 9, 2]", output: "9" },
      { input: "[-5, -2, -10]", output: "-2" },
    ],
    constraints: [
      "1 ≤ length ≤ 1000",
      "-1000 ≤ nums[i] ≤ 1000",
      "Cannot use built-in max() function",
    ],
    testCases: [
      { input: "[1, 5, 3, 9, 2]", expected: "9" },
      { input: "[-5, -2, -10]", expected: "-2" },
      { input: "[42]", expected: "42" },
    ],
    tags: ["loops", "comparison"],
  },

  {
    id: "python-fibonacci-easy",
    title: "Fibonacci Sequence",
    description: "Generate the nth Fibonacci number, where F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
    language: "python",
    topic: "Algorithms",
    difficulty: "Easy",
    starter: "def fibonacci(n):\n    # Your code here\n    pass\n",
    examples: [
      { input: "0", output: "0" },
      { input: "5", output: "5" },
      { input: "10", output: "55" },
    ],
    constraints: ["0 ≤ n ≤ 50", "Result must be computed efficiently"],
    testCases: [
      { input: "0", expected: "0" },
      { input: "1", expected: "1" },
      { input: "5", expected: "5" },
      { input: "10", expected: "55" },
    ],
    tags: ["recursion", "dynamic-programming"],
  },

  {
    id: "python-palindrome-easy",
    title: "Check Palindrome",
    description: "Write a function that checks if a string is a palindrome (reads the same forwards and backwards).",
    language: "python",
    topic: "Strings",
    difficulty: "Easy",
    starter: "def is_palindrome(s):\n    # Your code here\n    pass\n",
    examples: [
      { input: '"racecar"', output: "True" },
      { input: '"hello"', output: "False" },
    ],
    constraints: ["1 ≤ length ≤ 10000", "Case-insensitive comparison"],
    testCases: [
      { input: '"racecar"', expected: "True" },
      { input: '"hello"', expected: "False" },
      { input: '"A"', expected: "True" },
      { input: '"noon"', expected: "True" },
    ],
    tags: ["strings", "validation"],
  },

  {
    id: "python-reverse-string-easy",
    title: "Reverse String",
    description: "Write a function that reverses a string.",
    language: "python",
    topic: "Strings",
    difficulty: "Easy",
    starter: "def reverse_string(s):\n    # Your code here\n    pass\n",
    examples: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"python"', output: '"nohtyp"' },
    ],
    constraints: ["1 ≤ length ≤ 10000"],
    testCases: [
      { input: '"hello"', expected: '"olleh"' },
      { input: '"a"', expected: '"a"' },
      { input: '"abc"', expected: '"cba"' },
    ],
    tags: ["strings", "arrays"],
  },

  {
    id: "python-two-sum-medium",
    title: "Two Sum",
    description: "Given an array of integers and a target, find two numbers that add up to the target. Return their indices.",
    language: "python",
    topic: "Algorithms",
    difficulty: "Medium",
    starter: "def two_sum(nums, target):\n    # Return [index1, index2]\n    pass\n",
    examples: [
      { input: "[2, 7, 11, 15], 9", output: "[0, 1]" },
      { input: "[3, 2, 4], 6", output: "[1, 2]" },
    ],
    constraints: ["2 ≤ length ≤ 10000", "Each number used only once"],
    testCases: [
      { input: "[2, 7, 11, 15], 9", expected: "[0, 1]" },
      { input: "[3, 2, 4], 6", expected: "[1, 2]" },
      { input: "[1, 2, 3], 5", expected: "[1, 2]" },
    ],
    tags: ["hash-map", "two-pointers"],
  },

  {
    id: "python-binary-search-medium",
    title: "Binary Search",
    description: "Implement binary search to find a target value in a sorted array.",
    language: "python",
    topic: "Searching",
    difficulty: "Medium",
    starter: "def binary_search(nums, target):\n    # Return index or -1 if not found\n    pass\n",
    examples: [
      { input: "[1, 3, 5, 7, 9], 5", output: "2" },
      { input: "[1, 3, 5, 7, 9], 6", output: "-1" },
    ],
    constraints: ["Array is sorted", "1 ≤ length ≤ 100000"],
    testCases: [
      { input: "[1, 3, 5, 7, 9], 5", expected: "2" },
      { input: "[1, 3, 5, 7, 9], 1", expected: "0" },
      { input: "[1, 3, 5, 7, 9], 9", expected: "4" },
      { input: "[1, 3, 5, 7, 9], 6", expected: "-1" },
    ],
    tags: ["searching", "divide-and-conquer"],
  },

  // JavaScript - Algorithms - Easy
  {
    id: "javascript-array-sum-easy",
    title: "Array Sum",
    description: "Write a function that returns the sum of all elements in an array.",
    language: "javascript",
    topic: "Arrays",
    difficulty: "Easy",
    starter: "function arraySum(arr) {\n  // Your code here\n}\n",
    examples: [
      { input: "[1, 2, 3, 4]", output: "10" },
      { input: "[0, -5, 5]", output: "0" },
    ],
    constraints: ["Array can be empty (return 0)", "-1000 ≤ element ≤ 1000"],
    testCases: [
      { input: "[1, 2, 3, 4]", expected: "10" },
      { input: "[0, -5, 5]", expected: "0" },
      { input: "[]", expected: "0" },
      { input: "[42]", expected: "42" },
    ],
    tags: ["loops", "arrays"],
  },

  {
    id: "javascript-even-count-easy",
    title: "Count Even Numbers",
    description: "Write a function that counts how many even numbers are in an array.",
    language: "javascript",
    topic: "Arrays",
    difficulty: "Easy",
    starter: "function countEven(arr) {\n  // Your code here\n}\n",
    examples: [
      { input: "[1, 2, 3, 4, 5, 6]", output: "3" },
      { input: "[1, 3, 5]", output: "0" },
    ],
    constraints: ["Array can be empty", "-1000 ≤ element ≤ 1000"],
    testCases: [
      { input: "[1, 2, 3, 4, 5, 6]", expected: "3" },
      { input: "[1, 3, 5]", expected: "0" },
      { input: "[]", expected: "0" },
      { input: "[2, 4, 6]", expected: "3" },
    ],
    tags: ["loops", "conditionals"],
  },

  // SQL - Easy
  {
    id: "sql-select-all-easy",
    title: "Select All Columns",
    description: "Write a query to select all columns from a users table and limit to 10 rows.",
    language: "sql",
    topic: "SQL",
    difficulty: "Easy",
    starter: "SELECT * FROM users\nLIMIT 10;\n",
    examples: [
      { input: "users table", output: "All columns with 10 rows" },
    ],
    constraints: ["Users table exists", "Limit to 10 rows"],
    testCases: [
      { input: "users", expected: "SELECT results limited to 10" },
    ],
    tags: ["select", "limit"],
  },

  {
    id: "sql-count-rows-easy",
    title: "Count Total Rows",
    description: "Write a query to count the total number of rows in a users table.",
    language: "sql",
    topic: "SQL",
    difficulty: "Easy",
    starter: "SELECT COUNT(*) FROM users;\n",
    examples: [
      { input: "users table with 5 rows", output: "5" },
    ],
    constraints: ["Users table exists"],
    testCases: [
      { input: "users", expected: "COUNT(*) returns row count" },
    ],
    tags: ["aggregate", "count"],
  },
];

// Helper functions
export function getChallengesByLanguage(language: Language): Challenge[] {
  return challenges.filter((c) => c.language === language);
}

export function getChallengesByTopic(topic: Topic): Challenge[] {
  return challenges.filter((c) => c.topic === topic);
}

export function getChallengesByDifficulty(difficulty: Difficulty): Challenge[] {
  return challenges.filter((c) => c.difficulty === difficulty);
}

export function getChallengesByLanguageAndTopic(
  language: Language,
  topic: Topic
): Challenge[] {
  return challenges.filter((c) => c.language === language && c.topic === topic);
}

export function getChallengesByLanguageTopicAndDifficulty(
  language: Language,
  topic: Topic,
  difficulty: Difficulty
): Challenge[] {
  return challenges.filter(
    (c) =>
      c.language === language &&
      c.topic === topic &&
      c.difficulty === difficulty
  );
}

export function getRandomChallenge(
  language?: Language,
  topic?: Topic,
  difficulty?: Difficulty
): Challenge | null {
  let filtered = challenges;

  if (language) {
    filtered = filtered.filter((c) => c.language === language);
  }
  if (topic) {
    filtered = filtered.filter((c) => c.topic === topic);
  }
  if (difficulty) {
    filtered = filtered.filter((c) => c.difficulty === difficulty);
  }

  if (filtered.length === 0) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getUniqueLanguages(): Language[] {
  const langs = new Set(challenges.map((c) => c.language));
  return Array.from(langs) as Language[];
}

export function getUniqueTopics(): Topic[] {
  const topics = new Set(challenges.map((c) => c.topic));
  return Array.from(topics) as Topic[];
}

export function getUniqueDifficulties(): Difficulty[] {
  const diffs = new Set(challenges.map((c) => c.difficulty));
  return Array.from(diffs) as Difficulty[];
}

export function getTopicsForLanguage(language: Language): Topic[] {
  const topics = new Set(
    challenges.filter((c) => c.language === language).map((c) => c.topic)
  );
  return Array.from(topics) as Topic[];
}

export function getDifficultiesForLanguageAndTopic(
  language: Language,
  topic: Topic
): Difficulty[] {
  const diffs = new Set(
    challenges
      .filter((c) => c.language === language && c.topic === topic)
      .map((c) => c.difficulty)
  );
  return Array.from(diffs) as Difficulty[];
}

export function getChallengeBdId(id: string): Challenge | undefined {
  return challenges.find((c) => c.id === id);
}
