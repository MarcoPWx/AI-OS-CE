export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeSnippet?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  questions: Question[];
}

export const devQuizData: Category[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '🟨',
    color: '#f7df1e',
    description: 'Master JavaScript fundamentals',
    questions: [
      {
        id: 'js1',
        question: 'What is the output of typeof null?',
        options: ['null', 'undefined', 'object', 'number'],
        correct: 2,
        explanation:
          'This is a known quirk in JavaScript. typeof null returns "object" due to a bug in the original implementation.',
        difficulty: 'medium',
        codeSnippet: 'console.log(typeof null);',
      },
      {
        id: 'js2',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correct: 0,
        explanation:
          'push() adds one or more elements to the end of an array and returns the new length.',
        difficulty: 'easy',
      },
      {
        id: 'js3',
        question: 'What does the "===" operator do?',
        options: ['Assignment', 'Loose equality', 'Strict equality', 'Not equal'],
        correct: 2,
        explanation:
          'The === operator checks for strict equality, comparing both value and type without type coercion.',
        difficulty: 'easy',
      },
      {
        id: 'js4',
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that returns another function',
          'A function that has access to outer scope variables',
          'A way to close connections',
          'A type of loop',
        ],
        correct: 1,
        explanation:
          'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function returns.',
        difficulty: 'medium',
      },
      {
        id: 'js5',
        question: 'What will this code output?',
        options: ['0 1 2', '3 3 3', '0 0 0', 'undefined undefined undefined'],
        correct: 1,
        explanation:
          "Due to closure and var's function scope, all setTimeout callbacks reference the same i variable, which is 3 after the loop.",
        difficulty: 'hard',
        codeSnippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
      },
      {
        id: 'js6',
        question: 'Which array method does NOT mutate the original array?',
        options: ['sort()', 'reverse()', 'filter()', 'splice()'],
        correct: 2,
        explanation:
          'filter() creates a new array with elements that pass the test, without modifying the original.',
        difficulty: 'medium',
      },
      {
        id: 'js7',
        question: 'What is the purpose of async/await?',
        options: [
          'To make code run faster',
          'To handle asynchronous operations more cleanly',
          'To create web workers',
          'To define generators',
        ],
        correct: 1,
        explanation:
          'async/await provides a cleaner syntax for handling promises and asynchronous operations.',
        difficulty: 'easy',
      },
      {
        id: 'js8',
        question: 'What is event bubbling?',
        options: [
          'Events propagating from child to parent',
          'Events propagating from parent to child',
          'Creating custom events',
          'Preventing event defaults',
        ],
        correct: 0,
        explanation:
          'Event bubbling is when an event propagates from the target element up through its ancestors.',
        difficulty: 'medium',
      },
      {
        id: 'js9',
        question: 'What does "use strict" do?',
        options: [
          'Makes code run faster',
          'Enables strict mode for safer code',
          'Disables all console logs',
          'Converts to TypeScript',
        ],
        correct: 1,
        explanation:
          '"use strict" enables strict mode, which catches common coding errors and prevents unsafe actions.',
        difficulty: 'easy',
      },
      {
        id: 'js10',
        question: 'What is the difference between let and var?',
        options: [
          'No difference',
          'let has block scope, var has function scope',
          'var has block scope, let has function scope',
          'let is faster than var',
        ],
        correct: 1,
        explanation:
          'let has block scope and cannot be redeclared, while var has function scope and can be redeclared.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'react',
    name: 'React',
    icon: '⚛️',
    color: '#61dafb',
    description: 'React concepts and patterns',
    questions: [
      {
        id: 'react1',
        question: 'What is the Virtual DOM?',
        options: [
          'A copy of the real DOM in memory',
          'A browser API',
          'A React component',
          'A testing library',
        ],
        correct: 0,
        explanation:
          'The Virtual DOM is a JavaScript representation of the real DOM kept in memory and synced with the real DOM.',
        difficulty: 'medium',
      },
      {
        id: 'react2',
        question: 'Which hook is used for side effects?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correct: 1,
        explanation: 'useEffect is used to perform side effects in function components.',
        difficulty: 'easy',
      },
      {
        id: 'react3',
        question: 'What does useState return?',
        options: ['A single value', 'An array with value and setter', 'An object', 'A promise'],
        correct: 1,
        explanation:
          'useState returns an array with two elements: the current state value and a function to update it.',
        difficulty: 'easy',
        codeSnippet: 'const [count, setCount] = useState(0);',
      },
      {
        id: 'react4',
        question: 'When should you use useCallback?',
        options: [
          'For every function',
          'To memoize expensive functions passed as props',
          'To replace useState',
          'To fetch data',
        ],
        correct: 1,
        explanation:
          'useCallback is used to memoize functions to prevent unnecessary re-renders of child components.',
        difficulty: 'medium',
      },
      {
        id: 'react5',
        question: 'What is prop drilling?',
        options: [
          'Passing props through multiple component levels',
          'Creating new props',
          'Destructuring props',
          'Validating props',
        ],
        correct: 0,
        explanation:
          "Prop drilling is passing data through multiple component levels even when intermediate components don't need it.",
        difficulty: 'medium',
      },
      {
        id: 'react6',
        question: 'What triggers a re-render in React?',
        options: [
          'State change only',
          'Props change only',
          'State or props change',
          'Any JavaScript execution',
        ],
        correct: 2,
        explanation: 'Components re-render when state changes, props change, or parent re-renders.',
        difficulty: 'medium',
      },
      {
        id: 'react7',
        question: 'What is the purpose of keys in lists?',
        options: [
          'Styling',
          'Help React identify which items changed',
          'Security',
          'Performance metrics',
        ],
        correct: 1,
        explanation:
          'Keys help React identify which items have changed, are added, or removed for efficient updates.',
        difficulty: 'easy',
      },
      {
        id: 'react8',
        question: 'What is React.memo used for?',
        options: [
          'Memorizing component state',
          'Caching API calls',
          "Preventing re-renders if props haven't changed",
          'Creating memos',
        ],
        correct: 2,
        explanation:
          'React.memo is a higher-order component that memoizes components to prevent unnecessary re-renders.',
        difficulty: 'medium',
      },
      {
        id: 'react9',
        question: 'What is the Context API used for?',
        options: ['HTTP requests', 'Global state management', 'Routing', 'Animation'],
        correct: 1,
        explanation:
          'Context API provides a way to pass data through the component tree without prop drilling.',
        difficulty: 'easy',
      },
      {
        id: 'react10',
        question: 'What is the difference between controlled and uncontrolled components?',
        options: [
          'Performance difference',
          'Controlled components have their state managed by React',
          'Uncontrolled components are faster',
          'No difference',
        ],
        correct: 1,
        explanation:
          'Controlled components have their form data handled by React state, while uncontrolled components use refs.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '🔷',
    color: '#3178c6',
    description: 'TypeScript type system',
    questions: [
      {
        id: 'ts1',
        question: 'What is the difference between interface and type?',
        options: [
          'No difference',
          'Interfaces can be extended, types cannot',
          'Types are more flexible for unions and primitives',
          'Interfaces are deprecated',
        ],
        correct: 2,
        explanation:
          'Types are more flexible and can represent primitives, unions, and tuples. Interfaces are better for object shapes and can be extended.',
        difficulty: 'medium',
      },
      {
        id: 'ts2',
        question: 'What does the "unknown" type represent?',
        options: ['Same as any', 'Type-safe any', 'undefined or null', 'Error type'],
        correct: 1,
        explanation:
          'unknown is the type-safe counterpart of any. You must do type checking before using unknown values.',
        difficulty: 'medium',
      },
      {
        id: 'ts3',
        question: 'What is a generic in TypeScript?',
        options: [
          'A general type',
          'A type variable that can work with multiple types',
          'An interface',
          'A class',
        ],
        correct: 1,
        explanation:
          'Generics provide a way to create reusable components that work with multiple types while maintaining type safety.',
        difficulty: 'medium',
        codeSnippet: 'function identity<T>(arg: T): T { return arg; }',
      },
      {
        id: 'ts4',
        question: 'What does "!" operator do in TypeScript?',
        options: ['Logical NOT', 'Non-null assertion', 'Optional chaining', 'Type guard'],
        correct: 1,
        explanation:
          'The ! operator is a non-null assertion that tells TypeScript a value is definitely not null or undefined.',
        difficulty: 'easy',
      },
      {
        id: 'ts5',
        question: 'What is a union type?',
        options: [
          'Combining interfaces',
          'A type that can be one of several types',
          'Merging objects',
          'Type inheritance',
        ],
        correct: 1,
        explanation: 'Union types allow a value to be one of several types, using the | operator.',
        difficulty: 'easy',
        codeSnippet: 'type Status = "pending" | "approved" | "rejected";',
      },
      {
        id: 'ts6',
        question: 'What is type inference?',
        options: [
          'Guessing types',
          'TypeScript automatically determining types',
          'Runtime type checking',
          'Type casting',
        ],
        correct: 1,
        explanation:
          "Type inference is TypeScript's ability to automatically determine types based on context.",
        difficulty: 'easy',
      },
      {
        id: 'ts7',
        question: 'What does "readonly" modifier do?',
        options: [
          'Makes properties immutable after initialization',
          'Creates constants',
          'Prevents class extension',
          'Makes methods pure',
        ],
        correct: 0,
        explanation: "The readonly modifier makes properties immutable after they're initialized.",
        difficulty: 'easy',
      },
      {
        id: 'ts8',
        question: 'What is a type guard?',
        options: [
          'Security feature',
          'A way to narrow down types',
          'Error boundary',
          'Type validator',
        ],
        correct: 1,
        explanation:
          'Type guards are expressions that narrow down the type of a variable within a conditional block.',
        difficulty: 'medium',
      },
      {
        id: 'ts9',
        question: 'What is the "never" type?',
        options: [
          'Null or undefined',
          'Type for values that never occur',
          'Empty type',
          'Error type',
        ],
        correct: 1,
        explanation:
          'The never type represents values that never occur, like functions that always throw errors.',
        difficulty: 'hard',
      },
      {
        id: 'ts10',
        question: 'What are conditional types?',
        options: [
          'if-else statements',
          'Types that depend on conditions',
          'Optional types',
          'Runtime types',
        ],
        correct: 1,
        explanation:
          'Conditional types select one of two possible types based on a condition expressed as a type relationship test.',
        difficulty: 'hard',
        codeSnippet: 'type IsString<T> = T extends string ? true : false;',
      },
    ],
  },
  {
    id: 'git',
    name: 'Git',
    icon: '🔀',
    color: '#f05032',
    description: 'Version control mastery',
    questions: [
      {
        id: 'git1',
        question: 'What does "git rebase" do?',
        options: [
          'Deletes commits',
          'Reapplies commits on top of another base',
          'Creates a backup',
          'Merges branches',
        ],
        correct: 1,
        explanation:
          'Rebase reapplies your commits on top of another base commit, creating a linear history.',
        difficulty: 'medium',
      },
      {
        id: 'git2',
        question: 'What is the difference between "git pull" and "git fetch"?',
        options: [
          'No difference',
          'fetch downloads changes without merging',
          'pull is faster',
          'fetch creates branches',
        ],
        correct: 1,
        explanation:
          'git fetch downloads changes without merging them, while git pull fetches and merges.',
        difficulty: 'medium',
      },
      {
        id: 'git3',
        question: 'What does "git stash" do?',
        options: [
          'Deletes changes',
          'Temporarily saves uncommitted changes',
          'Creates a branch',
          'Pushes to remote',
        ],
        correct: 1,
        explanation:
          'git stash temporarily saves uncommitted changes so you can work on something else.',
        difficulty: 'easy',
      },
      {
        id: 'git4',
        question: 'How do you undo the last commit but keep changes?',
        options: [
          'git reset --hard HEAD~1',
          'git reset --soft HEAD~1',
          'git revert HEAD',
          'git checkout HEAD~1',
        ],
        correct: 1,
        explanation: 'git reset --soft HEAD~1 undoes the last commit but keeps changes staged.',
        difficulty: 'medium',
        codeSnippet: 'git reset --soft HEAD~1',
      },
      {
        id: 'git5',
        question: 'What is a "detached HEAD" state?',
        options: [
          'Corrupted repository',
          'HEAD points to a commit instead of branch',
          'Missing HEAD file',
          'Merge conflict',
        ],
        correct: 1,
        explanation:
          'Detached HEAD means HEAD points directly to a commit rather than a branch reference.',
        difficulty: 'hard',
      },
      {
        id: 'git6',
        question: 'What does "git cherry-pick" do?',
        options: [
          'Selects best commits',
          'Applies specific commits to current branch',
          'Deletes commits',
          'Creates tags',
        ],
        correct: 1,
        explanation:
          'cherry-pick applies the changes from specific commits to your current branch.',
        difficulty: 'medium',
      },
      {
        id: 'git7',
        question: 'What is the purpose of .gitignore?',
        options: [
          'Hide sensitive files',
          'Specify files Git should not track',
          'Ignore errors',
          'Skip tests',
        ],
        correct: 1,
        explanation: '.gitignore specifies intentionally untracked files that Git should ignore.',
        difficulty: 'easy',
      },
      {
        id: 'git8',
        question: 'What is a merge conflict?',
        options: [
          'Server error',
          "When Git can't automatically merge changes",
          'Permission issue',
          'Network problem',
        ],
        correct: 1,
        explanation:
          "Merge conflicts occur when Git can't automatically resolve differences between commits.",
        difficulty: 'easy',
      },
      {
        id: 'git9',
        question: 'What does "git bisect" do?',
        options: [
          'Splits repositories',
          'Finds the commit that introduced a bug',
          'Merges branches',
          'Creates backups',
        ],
        correct: 1,
        explanation: 'git bisect uses binary search to find the commit that introduced a bug.',
        difficulty: 'hard',
      },
      {
        id: 'git10',
        question: 'What is the difference between merge and rebase?',
        options: [
          'No difference',
          'Merge preserves history, rebase rewrites it',
          'Rebase is always better',
          'Merge is deprecated',
        ],
        correct: 1,
        explanation:
          'Merge creates a merge commit preserving history, while rebase rewrites history for a linear timeline.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '🎨',
    color: '#1572b6',
    description: 'Styling and layout mastery',
    questions: [
      {
        id: 'css1',
        question: 'What is the CSS Box Model?',
        options: ['A layout method', 'Content, padding, border, margin', 'Flexbox', 'Grid system'],
        correct: 1,
        explanation:
          'The Box Model consists of content, padding, border, and margin areas around elements.',
        difficulty: 'easy',
      },
      {
        id: 'css2',
        question: 'What is specificity in CSS?',
        options: [
          'Loading order',
          'How browsers decide which styles to apply',
          'Performance metric',
          'Media queries',
        ],
        correct: 1,
        explanation:
          'Specificity determines which CSS rules apply when multiple rules target the same element.',
        difficulty: 'medium',
      },
      {
        id: 'css3',
        question: 'What does "display: flex" do?',
        options: [
          'Makes element flexible',
          'Creates a flex container',
          'Adds animations',
          'Shows element',
        ],
        correct: 1,
        explanation:
          'display: flex creates a flex container enabling flexbox layout for child elements.',
        difficulty: 'easy',
      },
      {
        id: 'css4',
        question: 'What is the difference between position: absolute and fixed?',
        options: [
          'No difference',
          'absolute is viewport-relative, fixed is parent-relative',
          'fixed is viewport-relative, absolute is positioned-parent-relative',
          'Performance only',
        ],
        correct: 2,
        explanation:
          'fixed positions relative to viewport, absolute positions relative to nearest positioned ancestor.',
        difficulty: 'medium',
      },
      {
        id: 'css5',
        question: 'What is a CSS pseudo-element?',
        options: [
          'Fake element',
          'Element that styles parts of an element',
          'JavaScript element',
          'Hidden element',
        ],
        correct: 1,
        explanation:
          'Pseudo-elements like ::before and ::after style specific parts of an element.',
        difficulty: 'medium',
        codeSnippet: 'p::first-line { color: blue; }',
      },
      {
        id: 'css6',
        question: 'What does z-index control?',
        options: ['Zoom level', 'Stacking order of elements', 'Z-axis rotation', 'Loading order'],
        correct: 1,
        explanation: 'z-index controls the stacking order of positioned elements.',
        difficulty: 'easy',
      },
      {
        id: 'css7',
        question: 'What is CSS Grid?',
        options: [
          'Table layout',
          'Two-dimensional layout system',
          'Framework',
          'Flexbox alternative',
        ],
        correct: 1,
        explanation: 'CSS Grid is a two-dimensional layout system for creating complex layouts.',
        difficulty: 'easy',
      },
      {
        id: 'css8',
        question: 'What are CSS variables?',
        options: [
          'JavaScript variables',
          'Custom properties for reusable values',
          'Constants',
          'Preprocessor variables',
        ],
        correct: 1,
        explanation:
          'CSS variables (custom properties) store reusable values that can be changed dynamically.',
        difficulty: 'medium',
        codeSnippet: '--primary-color: #3498db;',
      },
      {
        id: 'css9',
        question: 'What is the cascade in CSS?',
        options: [
          'Animation type',
          'How styles are applied based on order and specificity',
          'Layout method',
          'Performance optimization',
        ],
        correct: 1,
        explanation:
          'The cascade determines how conflicting styles are resolved based on importance, specificity, and order.',
        difficulty: 'medium',
      },
      {
        id: 'css10',
        question: 'What does "box-sizing: border-box" do?',
        options: [
          'Adds borders',
          "Includes padding and border in element's width/height",
          'Creates boxes',
          'Removes margins',
        ],
        correct: 1,
        explanation:
          "border-box makes padding and border included in the element's total width and height.",
        difficulty: 'easy',
      },
    ],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: '🟢',
    color: '#339933',
    description: 'Backend JavaScript runtime',
    questions: [
      {
        id: 'node1',
        question: 'What is the Event Loop?',
        options: [
          'A for loop',
          'Mechanism that handles async operations',
          'Error handler',
          'HTTP server',
        ],
        correct: 1,
        explanation:
          'The Event Loop allows Node.js to perform non-blocking operations by offloading operations to the system kernel.',
        difficulty: 'medium',
      },
      {
        id: 'node2',
        question: 'What is npm?',
        options: [
          'Node Programming Model',
          'Node Package Manager',
          'New Project Manager',
          'Node Process Manager',
        ],
        correct: 1,
        explanation:
          'npm is the Node Package Manager for installing and managing JavaScript packages.',
        difficulty: 'easy',
      },
      {
        id: 'node3',
        question: 'What does require() do in Node.js?',
        options: [
          'Makes fields required',
          'Imports modules',
          'Validates input',
          'Creates dependencies',
        ],
        correct: 1,
        explanation: 'require() is used to import modules, JSON, and local files in Node.js.',
        difficulty: 'easy',
      },
      {
        id: 'node4',
        question: 'What is middleware in Express?',
        options: [
          'Database layer',
          'Functions that execute during request-response cycle',
          'Caching layer',
          'Authentication only',
        ],
        correct: 1,
        explanation:
          'Middleware functions execute during the request-response cycle and have access to req, res, and next.',
        difficulty: 'medium',
      },
      {
        id: 'node5',
        question: 'What is the purpose of package.json?',
        options: [
          'Store code',
          'Define project metadata and dependencies',
          'Configuration only',
          'Testing',
        ],
        correct: 1,
        explanation: 'package.json holds metadata about the project and lists dependencies.',
        difficulty: 'easy',
      },
      {
        id: 'node6',
        question: 'What is process.env used for?',
        options: [
          'Processing data',
          'Accessing environment variables',
          'Error handling',
          'Memory management',
        ],
        correct: 1,
        explanation: 'process.env provides access to environment variables in Node.js.',
        difficulty: 'easy',
      },
      {
        id: 'node7',
        question: 'What is a Buffer in Node.js?',
        options: [
          'Memory cache',
          'Class for handling binary data',
          'Request queue',
          'Response handler',
        ],
        correct: 1,
        explanation: 'Buffer is a class for handling binary data directly in Node.js.',
        difficulty: 'medium',
      },
      {
        id: 'node8',
        question: 'What is cluster module used for?',
        options: [
          'Database clustering',
          'Creating child processes to share server load',
          'Grouping files',
          'Cloud deployment',
        ],
        correct: 1,
        explanation:
          'The cluster module allows creating child processes that share the same server port.',
        difficulty: 'hard',
      },
      {
        id: 'node9',
        question: 'What is the difference between process.nextTick() and setImmediate()?',
        options: [
          'No difference',
          'nextTick executes before I/O, setImmediate after',
          'setImmediate is faster',
          'nextTick is deprecated',
        ],
        correct: 1,
        explanation:
          'process.nextTick() executes before I/O events, setImmediate() executes after I/O events.',
        difficulty: 'hard',
      },
      {
        id: 'node10',
        question: 'What are streams in Node.js?',
        options: [
          'Data flows',
          'Objects for handling reading/writing data piece by piece',
          'WebSocket connections',
          'Video streams only',
        ],
        correct: 1,
        explanation:
          'Streams are objects that let you read/write data in chunks rather than all at once.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    color: '#2496ed',
    description: 'Containerization and DevOps',
    questions: [
      {
        id: 'docker1',
        question: 'What is a Docker container?',
        options: [
          'Virtual machine',
          'Lightweight, standalone package of software',
          'Database',
          'Cloud service',
        ],
        correct: 1,
        explanation:
          'A container is a lightweight, standalone, executable package that includes everything needed to run software.',
        difficulty: 'easy',
      },
      {
        id: 'docker2',
        question: 'What is the difference between ADD and COPY in Dockerfile?',
        options: [
          'No difference',
          'ADD can extract archives and download URLs',
          'COPY is faster',
          'ADD is deprecated',
        ],
        correct: 1,
        explanation:
          'ADD can extract tar archives and download files from URLs, while COPY only copies files.',
        difficulty: 'medium',
      },
      {
        id: 'docker3',
        question: 'What does Docker Compose do?',
        options: [
          'Compresses images',
          'Defines and runs multi-container applications',
          'Creates Dockerfiles',
          'Manages clusters',
        ],
        correct: 1,
        explanation:
          'Docker Compose is a tool for defining and running multi-container Docker applications.',
        difficulty: 'easy',
      },
      {
        id: 'docker4',
        question: 'What is a Docker image?',
        options: [
          'Container screenshot',
          'Read-only template for creating containers',
          'Running container',
          'Configuration file',
        ],
        correct: 1,
        explanation:
          'A Docker image is a read-only template with instructions for creating a Docker container.',
        difficulty: 'easy',
      },
      {
        id: 'docker5',
        question: 'What is the purpose of .dockerignore?',
        options: [
          'Ignore errors',
          'Exclude files from build context',
          'Skip tests',
          'Hide containers',
        ],
        correct: 1,
        explanation: '.dockerignore excludes files and directories from the Docker build context.',
        difficulty: 'easy',
      },
      {
        id: 'docker6',
        question: 'What is Docker volume used for?',
        options: [
          'Sound control',
          'Persistent data storage',
          'Network configuration',
          'CPU allocation',
        ],
        correct: 1,
        explanation:
          'Docker volumes provide persistent data storage that exists outside container lifecycle.',
        difficulty: 'medium',
      },
      {
        id: 'docker7',
        question: 'What is the difference between CMD and ENTRYPOINT?',
        options: [
          'No difference',
          'ENTRYPOINT is not overridable, CMD provides defaults',
          'CMD is faster',
          'ENTRYPOINT is deprecated',
        ],
        correct: 1,
        explanation:
          'ENTRYPOINT configures a container to run as an executable, CMD provides default arguments.',
        difficulty: 'medium',
      },
      {
        id: 'docker8',
        question: 'What is Docker Hub?',
        options: [
          'Development IDE',
          'Cloud-based registry for Docker images',
          'Network hub',
          'Configuration manager',
        ],
        correct: 1,
        explanation: 'Docker Hub is a cloud-based registry service for sharing Docker images.',
        difficulty: 'easy',
      },
      {
        id: 'docker9',
        question: 'What does "docker exec" do?',
        options: [
          'Executes Dockerfile',
          'Runs commands in running container',
          'Starts container',
          'Builds image',
        ],
        correct: 1,
        explanation: 'docker exec runs a command in a running container.',
        difficulty: 'medium',
        codeSnippet: 'docker exec -it container_name bash',
      },
      {
        id: 'docker10',
        question: 'What is multi-stage build?',
        options: [
          'Building multiple images',
          'Using multiple FROM statements to optimize image size',
          'Parallel builds',
          'Staging environments',
        ],
        correct: 1,
        explanation:
          'Multi-stage builds use multiple FROM statements to create smaller, more efficient images.',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    icon: '🧮',
    color: '#ff6b6b',
    description: 'Data structures and algorithms',
    questions: [
      {
        id: 'algo1',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correct: 1,
        explanation:
          'Binary search has O(log n) time complexity as it halves the search space each iteration.',
        difficulty: 'medium',
      },
      {
        id: 'algo2',
        question: 'What is a hash table?',
        options: [
          'Sorted array',
          'Data structure with key-value pairs and O(1) average access',
          'Binary tree',
          'Linked list',
        ],
        correct: 1,
        explanation:
          'Hash tables store key-value pairs and provide O(1) average time complexity for insertions and lookups.',
        difficulty: 'medium',
      },
      {
        id: 'algo3',
        question: 'What is the difference between DFS and BFS?',
        options: [
          'No difference',
          'DFS uses stack, BFS uses queue',
          'BFS is always faster',
          'DFS only works on trees',
        ],
        correct: 1,
        explanation:
          'DFS (Depth-First Search) uses a stack and goes deep, BFS (Breadth-First Search) uses a queue and explores level by level.',
        difficulty: 'medium',
      },
      {
        id: 'algo4',
        question: 'What is Big O notation?',
        options: [
          'A programming language',
          'Way to describe algorithm time/space complexity',
          'Testing framework',
          'Memory measurement',
        ],
        correct: 1,
        explanation:
          "Big O notation describes the upper bound of an algorithm's time or space complexity.",
        difficulty: 'easy',
      },
      {
        id: 'algo5',
        question: 'What is dynamic programming?',
        options: [
          'Writing flexible code',
          'Solving problems by breaking them into overlapping subproblems',
          'Runtime code generation',
          'Async programming',
        ],
        correct: 1,
        explanation:
          'Dynamic programming solves complex problems by breaking them into simpler overlapping subproblems.',
        difficulty: 'hard',
      },
      {
        id: 'algo6',
        question: 'What is a linked list?',
        options: [
          'Array of links',
          'Linear data structure where elements point to next element',
          'Sorted array',
          'Tree structure',
        ],
        correct: 1,
        explanation:
          'A linked list is a linear data structure where each element points to the next element.',
        difficulty: 'easy',
      },
      {
        id: 'algo7',
        question: 'What is the time complexity of quicksort average case?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correct: 1,
        explanation:
          'Quicksort has average case time complexity of O(n log n) but worst case is O(n²).',
        difficulty: 'medium',
      },
      {
        id: 'algo8',
        question: 'What is a binary tree?',
        options: [
          'Tree with binary data',
          'Tree where each node has at most two children',
          'Sorted tree',
          'Complete tree',
        ],
        correct: 1,
        explanation:
          'A binary tree is a tree data structure where each node has at most two children.',
        difficulty: 'easy',
      },
      {
        id: 'algo9',
        question: 'What is memoization?',
        options: [
          'Writing memos',
          'Caching function results',
          'Memory allocation',
          'Documentation',
        ],
        correct: 1,
        explanation:
          'Memoization is an optimization technique that caches expensive function call results.',
        difficulty: 'medium',
      },
      {
        id: 'algo10',
        question: 'What is the space complexity of merge sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct: 2,
        explanation:
          'Merge sort requires O(n) additional space for the temporary arrays used in merging.',
        difficulty: 'medium',
      },
    ],
  },
];

export const getRandomQuestions = (categoryId: string, count: number): Question[] => {
  const category = devQuizData.find((c) => c.id === categoryId);
  if (!category) return [];
  if (count <= 0) return [];

  const shuffled = [...category.questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const getDailyChallenge = (): Category => {
  // Deterministically select a category for the current date
  const today = new Date();
  const index = today.getDate() % devQuizData.length;
  return devQuizData[index];
};

export const getQuestionsByDifficulty = (
  categoryId: string,
  difficulty: 'easy' | 'medium' | 'hard',
): Question[] => {
  const category = devQuizData.find((c) => c.id === categoryId);
  if (!category) return [];

  return category.questions.filter((q) => q.difficulty === difficulty);
};
