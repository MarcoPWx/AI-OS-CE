import { Question, Category } from './devQuizData';

/**
 * BETA Environment Quiz Data
 * Covers SRE, DevOps, cloud architecture, and modern development practices
 * Aligned with QuizMentor's infrastructure and operational runbooks
 */

export const expandedQuizData: Category[] = [
  {
    id: 'sre-operations',
    name: 'SRE & Operations',
    icon: '🛡️',
    color: '#FF6B6B',
    description: 'Site Reliability Engineering, monitoring, and incident response',
    questions: [
      {
        id: 'sd1',
        question: 'What is the CAP theorem?',
        options: [
          'Consistency, Availability, Partition tolerance - pick two',
          'Cache, API, Protocol',
          'Create, Alter, Produce',
          'Cost, Architecture, Performance',
        ],
        correct: 0,
        explanation:
          'CAP theorem states that a distributed system can guarantee only two of: Consistency, Availability, and Partition tolerance.',
        difficulty: 'hard',
      },
      {
        id: 'sd2',
        question: 'What is a microservices architecture?',
        options: [
          'Small functions in code',
          'Breaking application into small, independent services',
          'Using micro frameworks',
          'Minimizing code size',
        ],
        correct: 1,
        explanation:
          'Microservices architecture structures an application as a collection of loosely coupled, independently deployable services.',
        difficulty: 'medium',
      },
      {
        id: 'sd3',
        question: 'What is horizontal scaling?',
        options: [
          'Adding more CPU to a server',
          'Adding more servers to handle load',
          'Increasing database size',
          'Optimizing code performance',
        ],
        correct: 1,
        explanation:
          'Horizontal scaling (scaling out) means adding more machines to your resource pool.',
        difficulty: 'medium',
      },
      {
        id: 'sd4',
        question: 'What is a load balancer?',
        options: [
          'Memory optimizer',
          'Distributes network traffic across servers',
          'Database query optimizer',
          'CPU scheduler',
        ],
        correct: 1,
        explanation:
          'A load balancer distributes incoming network traffic across multiple servers to ensure no single server bears too much load.',
        difficulty: 'easy',
      },
      {
        id: 'sd5',
        question: 'What is eventual consistency?',
        options: [
          'Data is always consistent',
          'Data becomes consistent over time',
          'Consistency is optional',
          'Consistent hashing',
        ],
        correct: 1,
        explanation:
          'Eventual consistency means the system will become consistent over time, allowing for temporary inconsistencies.',
        difficulty: 'hard',
      },
      {
        id: 'sd6',
        question: 'What is a CDN?',
        options: [
          'Central Data Network',
          'Content Delivery Network',
          'Cache Distribution Node',
          'Cloud Development Network',
        ],
        correct: 1,
        explanation:
          'A Content Delivery Network is a geographically distributed network of servers that deliver content to users.',
        difficulty: 'easy',
      },
      {
        id: 'sd7',
        question: 'What is database sharding?',
        options: [
          'Backing up databases',
          'Horizontally partitioning data across databases',
          'Encrypting database',
          'Compressing data',
        ],
        correct: 1,
        explanation:
          'Sharding is a method of distributing data across multiple machines by horizontally partitioning the database.',
        difficulty: 'hard',
      },
      {
        id: 'sd8',
        question: 'What is the purpose of a message queue?',
        options: [
          'Storing emails',
          'Decoupling and asynchronous communication between services',
          'Sorting messages',
          'Encrypting communications',
        ],
        correct: 1,
        explanation:
          'Message queues enable asynchronous communication between services and help decouple system components.',
        difficulty: 'medium',
      },
      {
        id: 'sd9',
        question: 'What is circuit breaker pattern?',
        options: [
          'Electrical safety mechanism',
          'Prevents cascading failures in distributed systems',
          'Breaking circular dependencies',
          'Stopping infinite loops',
        ],
        correct: 1,
        explanation:
          'Circuit breaker pattern prevents cascading failures by detecting failures and preventing calls to failing services.',
        difficulty: 'hard',
      },
      {
        id: 'sd10',
        question: 'What is rate limiting?',
        options: [
          'Limiting code execution speed',
          'Controlling the rate of requests to prevent abuse',
          'Database query limits',
          'Memory usage limits',
        ],
        correct: 1,
        explanation:
          'Rate limiting controls how many requests a user can make in a given time period to prevent abuse and ensure fair usage.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'web3',
    name: 'Web3 & Blockchain',
    icon: '⛓️',
    color: '#9B59B6',
    description: 'Blockchain and decentralized technologies',
    questions: [
      {
        id: 'web3_1',
        question: 'What is a smart contract?',
        options: [
          'Legal document',
          'Self-executing code on blockchain',
          'API contract',
          'Service agreement',
        ],
        correct: 1,
        explanation:
          'Smart contracts are self-executing programs stored on a blockchain that automatically execute when conditions are met.',
        difficulty: 'medium',
      },
      {
        id: 'web3_2',
        question: 'What does DeFi stand for?',
        options: [
          'Defined Finance',
          'Decentralized Finance',
          'Digital Finance',
          'Distributed Files',
        ],
        correct: 1,
        explanation:
          'DeFi stands for Decentralized Finance, financial services using smart contracts on blockchains.',
        difficulty: 'easy',
      },
      {
        id: 'web3_3',
        question: 'What is gas in Ethereum?',
        options: [
          'Fuel for mining',
          'Fee for executing transactions',
          'Network speed',
          'Storage space',
        ],
        correct: 1,
        explanation:
          'Gas is the fee required to execute transactions and smart contracts on the Ethereum network.',
        difficulty: 'medium',
      },
      {
        id: 'web3_4',
        question: 'What is an NFT?',
        options: [
          'New File Type',
          'Non-Fungible Token',
          'Network File Transfer',
          'Node Function Test',
        ],
        correct: 1,
        explanation: 'NFT stands for Non-Fungible Token, a unique digital asset on the blockchain.',
        difficulty: 'easy',
      },
      {
        id: 'web3_5',
        question: 'What is a DAO?',
        options: [
          'Data Access Object',
          'Decentralized Autonomous Organization',
          'Digital Asset Owner',
          'Distributed Application Operator',
        ],
        correct: 1,
        explanation:
          'DAO is a Decentralized Autonomous Organization governed by smart contracts and token holders.',
        difficulty: 'medium',
      },
      {
        id: 'web3_6',
        question: 'What is IPFS?',
        options: [
          'Internet Protocol File System',
          'InterPlanetary File System',
          'Internal Process File Storage',
          'Integrated Platform File Service',
        ],
        correct: 1,
        explanation:
          'IPFS is the InterPlanetary File System, a distributed system for storing and accessing files.',
        difficulty: 'hard',
      },
      {
        id: 'web3_7',
        question: 'What is a wallet in Web3?',
        options: [
          'Physical wallet',
          'Software to manage crypto keys and assets',
          'Database storage',
          'API endpoint',
        ],
        correct: 1,
        explanation:
          'A Web3 wallet is software that stores private keys and enables interaction with blockchain applications.',
        difficulty: 'easy',
      },
      {
        id: 'web3_8',
        question: 'What is proof of stake?',
        options: [
          'Proving ownership',
          'Consensus mechanism using staked tokens',
          'Security proof',
          'Transaction validation',
        ],
        correct: 1,
        explanation:
          'Proof of Stake is a consensus mechanism where validators stake tokens to validate transactions.',
        difficulty: 'hard',
      },
      {
        id: 'web3_9',
        question: 'What is layer 2 scaling?',
        options: [
          'Second blockchain',
          'Solutions built on top of main blockchain',
          'Database layer',
          'Network protocol',
        ],
        correct: 1,
        explanation:
          'Layer 2 refers to scaling solutions built on top of the main blockchain to increase transaction speed and reduce costs.',
        difficulty: 'hard',
      },
      {
        id: 'web3_10',
        question: 'What is a mempool?',
        options: [
          'Memory allocation',
          'Pool of unconfirmed transactions',
          'Mining pool',
          'Data pool',
        ],
        correct: 1,
        explanation:
          'Mempool is where all valid transactions wait to be confirmed by miners and included in the next block.',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: '🤖',
    color: '#00BCD4',
    description: 'AI, ML, and neural networks',
    questions: [
      {
        id: 'ai1',
        question: 'What is a neural network?',
        options: [
          'Computer network',
          'System of connected nodes inspired by the brain',
          'Database system',
          'Social network algorithm',
        ],
        correct: 1,
        explanation:
          'A neural network is a series of algorithms that attempts to recognize patterns through a process that mimics the human brain.',
        difficulty: 'medium',
      },
      {
        id: 'ai2',
        question: 'What is supervised learning?',
        options: [
          'Learning with a teacher',
          'Training with labeled data',
          'Online learning',
          'Self-directed learning',
        ],
        correct: 1,
        explanation:
          'Supervised learning is ML where models are trained on labeled data with known outputs.',
        difficulty: 'easy',
      },
      {
        id: 'ai3',
        question: 'What is overfitting?',
        options: [
          'Model too large',
          'Model performs well on training but poorly on new data',
          'Too much data',
          'Hardware limitations',
        ],
        correct: 1,
        explanation:
          'Overfitting occurs when a model learns the training data too well, including noise, and performs poorly on new data.',
        difficulty: 'medium',
      },
      {
        id: 'ai4',
        question: 'What is a transformer in AI?',
        options: [
          'Power converter',
          'Neural network architecture for NLP',
          'Data transformation tool',
          'Image processor',
        ],
        correct: 1,
        explanation:
          'Transformer is a neural network architecture that uses self-attention mechanisms, revolutionizing NLP tasks.',
        difficulty: 'hard',
      },
      {
        id: 'ai5',
        question: 'What does GPT stand for?',
        options: [
          'General Purpose Technology',
          'Generative Pre-trained Transformer',
          'Global Processing Tool',
          'Graphical Pattern Transfer',
        ],
        correct: 1,
        explanation:
          'GPT stands for Generative Pre-trained Transformer, a type of large language model.',
        difficulty: 'easy',
      },
      {
        id: 'ai6',
        question: 'What is gradient descent?',
        options: [
          'Downhill skiing algorithm',
          'Optimization algorithm to minimize loss',
          'Sorting algorithm',
          'Graph traversal',
        ],
        correct: 1,
        explanation:
          'Gradient descent is an optimization algorithm used to minimize the loss function in machine learning.',
        difficulty: 'hard',
      },
      {
        id: 'ai7',
        question: 'What is reinforcement learning?',
        options: [
          'Learning from rewards and punishments',
          'Strengthening neural connections',
          'Repeated training',
          'Hardware acceleration',
        ],
        correct: 0,
        explanation:
          'Reinforcement learning involves an agent learning to make decisions by receiving rewards or penalties.',
        difficulty: 'medium',
      },
      {
        id: 'ai8',
        question: 'What is computer vision?',
        options: [
          'Monitor display technology',
          'AI field for interpreting visual information',
          'Graphics rendering',
          'VR technology',
        ],
        correct: 1,
        explanation:
          'Computer vision is an AI field that trains computers to interpret and understand visual information.',
        difficulty: 'easy',
      },
      {
        id: 'ai9',
        question: 'What is a GAN?',
        options: [
          'Global Area Network',
          'Generative Adversarial Network',
          'Graph Analysis Node',
          'General Algorithm Network',
        ],
        correct: 1,
        explanation:
          'GAN (Generative Adversarial Network) consists of two neural networks competing to generate realistic data.',
        difficulty: 'hard',
      },
      {
        id: 'ai10',
        question: 'What is transfer learning?',
        options: [
          'Moving data between systems',
          'Using pre-trained models for new tasks',
          'Network data transfer',
          'Learning transfer protocols',
        ],
        correct: 1,
        explanation:
          'Transfer learning involves using a pre-trained model as a starting point for a new, related task.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    icon: '☁️',
    color: '#FF9800',
    description: 'Cloud platforms and DevOps practices',
    questions: [
      {
        id: 'cloud1',
        question: 'What is Infrastructure as Code (IaC)?',
        options: [
          'Writing infrastructure documentation',
          'Managing infrastructure through code files',
          'Coding on infrastructure',
          'Infrastructure programming language',
        ],
        correct: 1,
        explanation:
          'IaC is managing and provisioning infrastructure through machine-readable definition files rather than manual processes.',
        difficulty: 'medium',
      },
      {
        id: 'cloud2',
        question: 'What is a container orchestration platform?',
        options: ['Docker', 'Kubernetes', 'Virtual Machine', 'Load Balancer'],
        correct: 1,
        explanation:
          'Kubernetes is a container orchestration platform that automates deployment, scaling, and management of containerized applications.',
        difficulty: 'easy',
      },
      {
        id: 'cloud3',
        question: 'What is CI/CD?',
        options: [
          'Code Integration/Code Deployment',
          'Continuous Integration/Continuous Delivery',
          'Cloud Infrastructure/Cloud Deployment',
          'Container Image/Container Deployment',
        ],
        correct: 1,
        explanation:
          'CI/CD stands for Continuous Integration and Continuous Delivery/Deployment, automating software delivery.',
        difficulty: 'easy',
      },
      {
        id: 'cloud4',
        question: 'What is serverless computing?',
        options: [
          'Computing without servers',
          'Running code without managing servers',
          'Client-side only computing',
          'Peer-to-peer computing',
        ],
        correct: 1,
        explanation:
          'Serverless computing allows running code without provisioning or managing servers, with automatic scaling.',
        difficulty: 'medium',
      },
      {
        id: 'cloud5',
        question: 'What is blue-green deployment?',
        options: [
          'Colorful UI deployment',
          'Switching between two identical environments',
          'Environmental deployment',
          'Test deployment',
        ],
        correct: 1,
        explanation:
          'Blue-green deployment involves having two identical production environments and switching between them for zero-downtime deployments.',
        difficulty: 'hard',
      },
      {
        id: 'cloud6',
        question: 'What is a service mesh?',
        options: [
          'Network of services',
          'Infrastructure layer for service-to-service communication',
          'Service database',
          'Mesh network topology',
        ],
        correct: 1,
        explanation:
          'A service mesh is a dedicated infrastructure layer that handles service-to-service communication in microservices.',
        difficulty: 'hard',
      },
      {
        id: 'cloud7',
        question: 'What is GitOps?',
        options: [
          'Git operations',
          'Using Git as single source of truth for deployments',
          'GitHub operations',
          'Git optimization',
        ],
        correct: 1,
        explanation:
          'GitOps is a way of implementing Continuous Deployment using Git as a single source of truth for infrastructure and applications.',
        difficulty: 'medium',
      },
      {
        id: 'cloud8',
        question: 'What is observability in DevOps?',
        options: [
          'Code visibility',
          'Understanding system state from outputs',
          'Monitoring tools',
          'Visual debugging',
        ],
        correct: 1,
        explanation:
          'Observability is the ability to understand the internal state of a system from its external outputs (logs, metrics, traces).',
        difficulty: 'medium',
      },
      {
        id: 'cloud9',
        question: 'What is chaos engineering?',
        options: [
          'Disorganized development',
          'Intentionally injecting failures to test resilience',
          'Random testing',
          'Emergency fixes',
        ],
        correct: 1,
        explanation:
          'Chaos engineering is the practice of intentionally injecting failures to test and improve system resilience.',
        difficulty: 'hard',
      },
      {
        id: 'cloud10',
        question: 'What is a canary deployment?',
        options: [
          'Yellow deployment',
          'Gradually rolling out changes to small subset of users',
          'Test deployment',
          'Emergency deployment',
        ],
        correct: 1,
        explanation:
          'Canary deployment gradually rolls out changes to a small subset of users before full deployment.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🔐',
    color: '#E91E63',
    description: 'Application and web security',
    questions: [
      {
        id: 'sec1',
        question: 'What is SQL injection?',
        options: [
          'Database optimization',
          'Attack inserting malicious SQL code',
          'SQL performance boost',
          'Database migration',
        ],
        correct: 1,
        explanation:
          'SQL injection is a code injection attack that exploits vulnerabilities in database queries.',
        difficulty: 'medium',
      },
      {
        id: 'sec2',
        question: 'What is XSS?',
        options: [
          'Extra Small Size',
          'Cross-Site Scripting',
          'XML Style Sheets',
          'Express Server Security',
        ],
        correct: 1,
        explanation:
          'XSS (Cross-Site Scripting) is an attack where malicious scripts are injected into trusted websites.',
        difficulty: 'medium',
      },
      {
        id: 'sec3',
        question: 'What is HTTPS?',
        options: [
          'Faster HTTP',
          'HTTP with encryption via SSL/TLS',
          'HTTP System',
          'High-Performance HTTP',
        ],
        correct: 1,
        explanation:
          'HTTPS is HTTP with encryption using SSL/TLS protocols to secure data transmission.',
        difficulty: 'easy',
      },
      {
        id: 'sec4',
        question: 'What is two-factor authentication?',
        options: [
          'Two passwords',
          'Additional verification beyond password',
          'Double encryption',
          'Two login attempts',
        ],
        correct: 1,
        explanation:
          '2FA requires two different authentication factors to verify identity, like password plus SMS code.',
        difficulty: 'easy',
      },
      {
        id: 'sec5',
        question: 'What is CSRF?',
        options: [
          'CSS Reference',
          'Cross-Site Request Forgery',
          'Client-Side Rendering Framework',
          'Cascading Style Reference Format',
        ],
        correct: 1,
        explanation:
          "CSRF is an attack that tricks users into executing unwanted actions on a web application they're authenticated to.",
        difficulty: 'hard',
      },
      {
        id: 'sec6',
        question: 'What is the principle of least privilege?',
        options: [
          'Minimum code access',
          'Granting minimum permissions necessary',
          'Lowest user priority',
          'Minimal features',
        ],
        correct: 1,
        explanation:
          'The principle of least privilege means giving users and processes only the minimum access rights they need.',
        difficulty: 'medium',
      },
      {
        id: 'sec7',
        question: 'What is OAuth?',
        options: [
          'Open Authentication',
          'Open standard for access delegation',
          'Object Authentication',
          'Online Authorization',
        ],
        correct: 1,
        explanation:
          'OAuth is an open standard for access delegation, commonly used for token-based authentication.',
        difficulty: 'medium',
      },
      {
        id: 'sec8',
        question: 'What is a JWT?',
        options: [
          'JavaScript Web Tool',
          'JSON Web Token',
          'Java Web Template',
          'Just Web Technology',
        ],
        correct: 1,
        explanation:
          'JWT (JSON Web Token) is a compact, URL-safe means of representing claims between two parties.',
        difficulty: 'easy',
      },
      {
        id: 'sec9',
        question: 'What is rate limiting for?',
        options: [
          'Speed optimization',
          'Preventing abuse and DDoS attacks',
          'Network speed',
          'Data compression',
        ],
        correct: 1,
        explanation:
          'Rate limiting controls the rate of requests to prevent abuse, DDoS attacks, and ensure fair resource usage.',
        difficulty: 'medium',
      },
      {
        id: 'sec10',
        question: 'What is zero-trust security?',
        options: [
          'No security',
          'Never trust, always verify approach',
          'Zero vulnerabilities',
          'Trust nothing model',
        ],
        correct: 1,
        explanation:
          'Zero-trust security assumes no trust and requires verification for every person and device trying to access resources.',
        difficulty: 'hard',
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: '⚡',
    color: '#4CAF50',
    description: 'Web performance and optimization',
    questions: [
      {
        id: 'perf1',
        question: 'What is lazy loading?',
        options: [
          'Slow loading',
          'Loading resources only when needed',
          'Delayed execution',
          'Background loading',
        ],
        correct: 1,
        explanation:
          'Lazy loading defers loading of resources until they are actually needed, improving initial load time.',
        difficulty: 'easy',
      },
      {
        id: 'perf2',
        question: 'What is the Critical Rendering Path?',
        options: [
          'Error handling path',
          'Steps browser takes to render page',
          'CSS rendering',
          'JavaScript execution path',
        ],
        correct: 1,
        explanation:
          'Critical Rendering Path is the sequence of steps the browser takes to convert HTML, CSS, and JavaScript into pixels.',
        difficulty: 'hard',
      },
      {
        id: 'perf3',
        question: 'What is tree shaking?',
        options: [
          'Animation technique',
          'Removing dead code from bundle',
          'DOM manipulation',
          'Testing method',
        ],
        correct: 1,
        explanation:
          'Tree shaking is a technique to eliminate dead code from the final bundle, reducing file size.',
        difficulty: 'medium',
      },
      {
        id: 'perf4',
        question: 'What is code splitting?',
        options: [
          'Dividing code into comments',
          'Breaking bundle into smaller chunks',
          'Splitting functions',
          'Separating HTML and CSS',
        ],
        correct: 1,
        explanation:
          'Code splitting divides your bundle into smaller chunks that can be loaded on demand.',
        difficulty: 'medium',
      },
      {
        id: 'perf5',
        question: 'What is First Contentful Paint (FCP)?',
        options: [
          'First CSS rule',
          'Time when first content appears on screen',
          'Initial load time',
          'First JavaScript execution',
        ],
        correct: 1,
        explanation:
          'FCP measures the time from navigation to when the first piece of content is rendered on screen.',
        difficulty: 'medium',
      },
      {
        id: 'perf6',
        question: 'What causes memory leaks in JavaScript?',
        options: [
          'Too much code',
          'Unreleased references preventing garbage collection',
          'Large files',
          'Syntax errors',
        ],
        correct: 1,
        explanation:
          'Memory leaks occur when objects are no longer needed but references prevent garbage collection.',
        difficulty: 'hard',
      },
      {
        id: 'perf7',
        question: 'What is debouncing?',
        options: [
          'Error handling',
          'Limiting function execution frequency',
          'Animation technique',
          'Testing method',
        ],
        correct: 1,
        explanation:
          "Debouncing ensures a function doesn't fire until after a certain amount of time has passed since last invocation.",
        difficulty: 'medium',
      },
      {
        id: 'perf8',
        question: 'What is the purpose of Web Workers?',
        options: [
          'Managing employees',
          'Running scripts in background threads',
          'Server workers',
          'DOM manipulation',
        ],
        correct: 1,
        explanation:
          'Web Workers allow running scripts in background threads, preventing blocking of the main thread.',
        difficulty: 'medium',
      },
      {
        id: 'perf9',
        question: 'What is prefetching?',
        options: [
          'Early data validation',
          'Loading resources in advance',
          'Caching strategy',
          'Pre-compilation',
        ],
        correct: 1,
        explanation:
          'Prefetching loads resources in advance that might be needed for future navigation.',
        difficulty: 'easy',
      },
      {
        id: 'perf10',
        question: 'What is the purpose of requestAnimationFrame?',
        options: [
          'Requesting animations from server',
          'Optimizing animations to browser refresh rate',
          'Creating animation frames',
          'Animation library',
        ],
        correct: 1,
        explanation:
          'requestAnimationFrame tells the browser to perform an animation before the next repaint, optimizing performance.',
        difficulty: 'medium',
      },
    ],
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    icon: '📱',
    color: '#2196F3',
    description: 'React Native and mobile development',
    questions: [
      {
        id: 'mobile1',
        question: 'What is the difference between React and React Native?',
        options: [
          'No difference',
          'React Native is for mobile apps',
          'React Native is faster',
          'React is deprecated',
        ],
        correct: 1,
        explanation:
          'React is for web applications, React Native is for building native mobile applications.',
        difficulty: 'easy',
      },
      {
        id: 'mobile2',
        question: 'What is Expo in React Native?',
        options: [
          'Exhibition framework',
          'Framework and platform for React Native apps',
          'Testing library',
          'State management',
        ],
        correct: 1,
        explanation: 'Expo is a framework and platform for universal React Native applications.',
        difficulty: 'easy',
      },
      {
        id: 'mobile3',
        question: 'What is the Metro bundler?',
        options: [
          'City transport app',
          'JavaScript bundler for React Native',
          'CSS framework',
          'Testing tool',
        ],
        correct: 1,
        explanation:
          'Metro is the JavaScript bundler for React Native, similar to webpack for web apps.',
        difficulty: 'medium',
      },
      {
        id: 'mobile4',
        question: 'What is AsyncStorage in React Native?',
        options: [
          'Synchronous storage',
          'Persistent key-value storage system',
          'Cloud storage',
          'Memory storage',
        ],
        correct: 1,
        explanation:
          'AsyncStorage is an asynchronous, persistent, key-value storage system for React Native.',
        difficulty: 'easy',
      },
      {
        id: 'mobile5',
        question: 'What is the bridge in React Native?',
        options: [
          'UI component',
          'Communication between JavaScript and native code',
          'Navigation library',
          'Network layer',
        ],
        correct: 1,
        explanation:
          'The bridge enables communication between JavaScript code and native platform code.',
        difficulty: 'hard',
      },
      {
        id: 'mobile6',
        question: 'What is Hot Reload in React Native?',
        options: [
          'Temperature monitoring',
          'Instantly see changes without losing state',
          'Performance optimization',
          'Deployment feature',
        ],
        correct: 1,
        explanation:
          'Hot Reload allows you to see changes instantly without losing application state.',
        difficulty: 'easy',
      },
      {
        id: 'mobile7',
        question: 'What is Hermes in React Native?',
        options: [
          'Greek god module',
          'JavaScript engine optimized for React Native',
          'Navigation library',
          'Testing framework',
        ],
        correct: 1,
        explanation:
          'Hermes is a JavaScript engine optimized for React Native to improve performance.',
        difficulty: 'medium',
      },
      {
        id: 'mobile8',
        question: 'What is CodePush?',
        options: [
          'Git command',
          'Over-the-air updates for React Native',
          'Code formatter',
          'Testing tool',
        ],
        correct: 1,
        explanation:
          "CodePush enables developers to deploy mobile app updates directly to users' devices.",
        difficulty: 'medium',
      },
      {
        id: 'mobile9',
        question: 'What is the New Architecture in React Native?',
        options: [
          'UI redesign',
          'Fabric renderer and TurboModules',
          'New folder structure',
          'Updated documentation',
        ],
        correct: 1,
        explanation:
          'The New Architecture includes Fabric (new rendering system) and TurboModules for better performance.',
        difficulty: 'hard',
      },
      {
        id: 'mobile10',
        question: "What is Flutter's main advantage?",
        options: [
          'Uses JavaScript',
          'Single codebase with custom rendering engine',
          'Made by Facebook',
          'Only for Android',
        ],
        correct: 1,
        explanation:
          'Flutter uses a custom rendering engine and single codebase to create natively compiled applications.',
        difficulty: 'medium',
      },
    ],
  },
];

// Helper function to get random questions from expanded data
export function getRandomQuestions(category: string, count: number): Question[] {
  const categoryData = expandedQuizData.find((cat) => cat.id === category);
  if (!categoryData) return [];

  const shuffled = [...categoryData.questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Get all categories with question counts
export function getCategoriesWithCounts(): Array<{
  id: string;
  name: string;
  count: number;
  icon: string;
}> {
  return expandedQuizData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    count: cat.questions.length,
    icon: cat.icon,
  }));
}

// Get questions by difficulty
export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  return expandedQuizData
    .flatMap((cat) => cat.questions)
    .filter((q) => q.difficulty === difficulty);
}

// Get mixed difficulty questions for adaptive learning
export function getAdaptiveQuestions(userLevel: number, count: number): Question[] {
  const distribution = {
    easy: userLevel < 5 ? 0.5 : userLevel < 10 ? 0.3 : 0.2,
    medium: userLevel < 5 ? 0.3 : userLevel < 10 ? 0.4 : 0.4,
    hard: userLevel < 5 ? 0.2 : userLevel < 10 ? 0.3 : 0.4,
  };

  const questions: Question[] = [];
  const easyCount = Math.floor(count * distribution.easy);
  const mediumCount = Math.floor(count * distribution.medium);
  const hardCount = count - easyCount - mediumCount;

  questions.push(...getQuestionsByDifficulty('easy').slice(0, easyCount));
  questions.push(...getQuestionsByDifficulty('medium').slice(0, mediumCount));
  questions.push(...getQuestionsByDifficulty('hard').slice(0, hardCount));

  return questions.sort(() => 0.5 - Math.random());
}

// Search questions
export function searchQuestions(query: string): Question[] {
  const lowercaseQuery = query.toLowerCase();
  return expandedQuizData
    .flatMap((cat) => cat.questions)
    .filter(
      (q) =>
        q.question.toLowerCase().includes(lowercaseQuery) ||
        q.explanation?.toLowerCase().includes(lowercaseQuery),
    );
}

export default expandedQuizData;
