/**
 * Mock WebSocket - Simulates real-time WebSocket events for multiplayer quiz
 */

import { EventEmitter } from 'events';

// WebSocket event types
export enum WSEventType {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Lobby events
  LOBBY_CREATED = 'lobby:created',
  LOBBY_JOINED = 'lobby:joined',
  LOBBY_LEFT = 'lobby:left',
  LOBBY_UPDATED = 'lobby:updated',
  PLAYER_JOINED = 'player:joined',
  PLAYER_LEFT = 'player:left',
  PLAYER_READY = 'player:ready',

  // Game events
  GAME_STARTING = 'game:starting',
  GAME_STARTED = 'game:started',
  GAME_ENDED = 'game:ended',
  QUESTION_START = 'question:start',
  QUESTION_END = 'question:end',
  ANSWER_SUBMITTED = 'answer:submitted',
  SCORES_UPDATED = 'scores:updated',

  // Chat events
  MESSAGE_SENT = 'message:sent',
  MESSAGE_RECEIVED = 'message:received',

  // System events
  PING = 'ping',
  PONG = 'pong',

  // Demo events
  TASK_UPDATE = 'task:update',
}

// Mock player data
interface MockPlayer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  ready: boolean;
  connected: boolean;
}

// Mock lobby data
interface MockLobby {
  id: string;
  code: string;
  name: string;
  host: string;
  players: MockPlayer[];
  maxPlayers: number;
  gameStarted: boolean;
  currentQuestion: number;
  totalQuestions: number;
}

class MockWebSocket extends EventEmitter {
  private url: string;
  private readyState: number;
  private protocol: string;
  private extensions: string;
  private binaryType: 'blob' | 'arraybuffer';
  private simulationTimer: NodeJS.Timeout | null = null;
  private taskTimer: NodeJS.Timeout | null = null;
  private lobbies: Map<string, MockLobby> = new Map();
  private currentLobbyId: string | null = null;
  private playerId: string;
  private isHost: boolean = false;
  private scenario: string = 'lobbyBasic';
  private didSimulateDisconnect: boolean = false;

  // WebSocket ready states
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string, protocols?: string | string[]) {
    super();
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.protocol = '';
    this.extensions = '';
    this.binaryType = 'blob';
    this.playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
    // Allow runtime override of scenario from Storybook toolbar (web) or env (RN/tests)
    const toolbarScenario =
      typeof window !== 'undefined' && (window as any).__WS_MOCK_SCENARIO__
        ? ((window as any).__WS_MOCK_SCENARIO__ as string)
        : undefined;
    this.scenario = toolbarScenario || process.env.WS_MOCK_SCENARIO || this.scenario;

    // Simulate connection delay
    setTimeout(
      () => {
        this.readyState = MockWebSocket.OPEN;
        this.dispatchEvent(new Event('open'));
        this.startSimulation();
        // Optionally simulate a transient disconnect/reconnect
        if (this.scenario === 'disconnectRecovery' && !this.didSimulateDisconnect) {
          this.simulateTemporaryDisconnect();
        }
      },
      Math.random() * 500 + 100,
    );
  }

  // WebSocket API methods
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }

    // Parse and handle the message
    let message: any;
    try {
      message = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      message = data;
    }

    console.log('[MockWebSocket] Sending:', message);
    this.handleOutgoingMessage(message);
  }

  close(code?: number, reason?: string): void {
    if (this.readyState === MockWebSocket.CLOSING || this.readyState === MockWebSocket.CLOSED) {
      return;
    }

    this.readyState = MockWebSocket.CLOSING;

    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.stopSimulation();
      this.dispatchEvent(new CloseEvent('close', { code, reason }));
    }, 100);
  }

  // Event handling
  addEventListener(type: string, listener: EventListener | EventListenerObject): void {
    this.on(type, listener as any);
  }

  removeEventListener(type: string, listener: EventListener | EventListenerObject): void {
    this.off(type, listener as any);
  }

  dispatchEvent(event: Event): boolean {
    this.emit(event.type, event);
    return true;
  }

  // Mock-specific methods
  private handleOutgoingMessage(message: any): void {
    const { type, payload } = message;

    switch (type) {
      case 'CREATE_LOBBY':
        this.handleCreateLobby(payload);
        break;
      case 'JOIN_LOBBY':
        this.handleJoinLobby(payload);
        break;
      case 'LEAVE_LOBBY':
        this.handleLeaveLobby();
        break;
      case 'START_GAME':
        this.handleStartGame();
        break;
      case 'SUBMIT_ANSWER':
        this.handleSubmitAnswer(payload);
        break;
      case 'SEND_MESSAGE':
        this.handleSendMessage(payload);
        break;
      case 'PLAYER_READY':
        this.handlePlayerReady();
        break;
      case 'PING':
        this.sendMessage({ type: 'PONG', timestamp: Date.now() });
        break;
    }
  }

  private handleCreateLobby(payload: any): void {
    const lobbyId = `lobby_${Date.now()}`;
    const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();

    const lobby: MockLobby = {
      id: lobbyId,
      code: lobbyCode,
      name: payload.name || 'New Quiz Room',
      host: this.playerId,
      players: [
        {
          id: this.playerId,
          name: payload.playerName || 'Host',
          avatar: payload.avatar,
          score: 0,
          ready: true,
          connected: true,
        },
      ],
      maxPlayers: payload.maxPlayers || 4,
      gameStarted: false,
      currentQuestion: 0,
      totalQuestions: payload.questionCount || 10,
    };

    this.lobbies.set(lobbyId, lobby);
    this.currentLobbyId = lobbyId;
    this.isHost = true;

    this.sendMessage({
      type: WSEventType.LOBBY_CREATED,
      payload: {
        lobbyId,
        code: lobbyCode,
        lobby,
      },
    });
  }

  private handleJoinLobby(payload: any): void {
    const { code, playerName, avatar } = payload;

    // Find lobby by code
    let lobby: MockLobby | undefined;
    for (const [id, l] of this.lobbies) {
      if (l.code === code) {
        lobby = l;
        this.currentLobbyId = id;
        break;
      }
    }

    if (!lobby) {
      // Create a mock lobby for demo purposes
      const lobbyId = `lobby_${code}`;
      lobby = {
        id: lobbyId,
        code,
        name: 'Quiz Room',
        host: 'host_123',
        players: [
          {
            id: 'host_123',
            name: 'Quiz Master',
            score: 0,
            ready: true,
            connected: true,
          },
        ],
        maxPlayers: 4,
        gameStarted: false,
        currentQuestion: 0,
        totalQuestions: 10,
      };
      this.lobbies.set(lobbyId, lobby);
      this.currentLobbyId = lobbyId;
    }

    // Add player to lobby
    const newPlayer: MockPlayer = {
      id: this.playerId,
      name: playerName || 'Player',
      avatar,
      score: 0,
      ready: false,
      connected: true,
    };

    lobby.players.push(newPlayer);

    this.sendMessage({
      type: WSEventType.LOBBY_JOINED,
      payload: { lobby, playerId: this.playerId },
    });

    // Simulate other players being notified
    setTimeout(() => {
      this.sendMessage({
        type: WSEventType.PLAYER_JOINED,
        payload: { player: newPlayer },
      });
    }, 500);

    // Scenario: happy path quickly readies and starts the game
    if (this.scenario === 'matchHappyPath') {
      setTimeout(() => {
        // Mark all players ready
        lobby!.players.forEach((p) => (p.ready = true));
        this.sendMessage({ type: WSEventType.LOBBY_UPDATED, payload: { lobby, allReady: true } });
        // Allow this client to start even if not host (mock convenience)
        this.isHost = true;
        this.handleStartGame();
      }, 800);
    }
  }

  private handleLeaveLobby(): void {
    if (!this.currentLobbyId) return;

    const lobby = this.lobbies.get(this.currentLobbyId);
    if (!lobby) return;

    // Remove player from lobby
    lobby.players = lobby.players.filter((p) => p.id !== this.playerId);

    this.sendMessage({
      type: WSEventType.LOBBY_LEFT,
      payload: { playerId: this.playerId },
    });

    // Notify other players
    this.sendMessage({
      type: WSEventType.PLAYER_LEFT,
      payload: { playerId: this.playerId },
    });

    this.currentLobbyId = null;
  }

  private handleStartGame(): void {
    if (!this.currentLobbyId || !this.isHost) return;

    const lobby = this.lobbies.get(this.currentLobbyId);
    if (!lobby) return;

    lobby.gameStarted = true;

    const { countdownMs, startDelayMs } = this.getTimings();

    // Countdown
    this.sendMessage({
      type: WSEventType.GAME_STARTING,
      payload: { countdown: Math.round(countdownMs / 1000) },
    });

    setTimeout(() => {
      this.sendMessage({
        type: WSEventType.GAME_STARTED,
        payload: { lobby },
      });

      // Start first question after a delay
      setTimeout(() => {
        this.sendNextQuestion(lobby);
      }, startDelayMs);
    }, countdownMs);
  }

  private handleSubmitAnswer(payload: any): void {
    if (!this.currentLobbyId) return;

    const lobby = this.lobbies.get(this.currentLobbyId);
    if (!lobby) return;

    const { questionId, answer, timeSpent } = payload;

    // Calculate score (mock)
    const isCorrect = Math.random() > 0.3; // 70% chance of correct
    const points = isCorrect ? Math.max(100, 1000 - timeSpent * 10) : 0;

    // Update player score
    const player = lobby.players.find((p) => p.id === this.playerId);
    if (player) {
      player.score += points;
    }

    this.sendMessage({
      type: WSEventType.ANSWER_SUBMITTED,
      payload: {
        playerId: this.playerId,
        questionId,
        isCorrect,
        points,
      },
    });

    // Update scores for all players
    setTimeout(() => {
      this.sendMessage({
        type: WSEventType.SCORES_UPDATED,
        payload: {
          scores: lobby.players.map((p) => ({
            playerId: p.id,
            name: p.name,
            score: p.score,
          })),
        },
      });
    }, 500);
  }

  private handleSendMessage(payload: any): void {
    const { text } = payload;

    // Echo the message back
    this.sendMessage({
      type: WSEventType.MESSAGE_RECEIVED,
      payload: {
        id: Date.now().toString(),
        playerId: this.playerId,
        playerName: 'You',
        text,
        timestamp: Date.now(),
      },
    });

    // Simulate other players sending messages
    if (Math.random() > 0.7) {
      setTimeout(
        () => {
          this.sendMessage({
            type: WSEventType.MESSAGE_RECEIVED,
            payload: {
              id: Date.now().toString(),
              playerId: 'other_player',
              playerName: 'Other Player',
              text: this.getRandomChatMessage(),
              timestamp: Date.now(),
            },
          });
        },
        Math.random() * 2000 + 1000,
      );
    }
  }

  private handlePlayerReady(): void {
    if (!this.currentLobbyId) return;

    const lobby = this.lobbies.get(this.currentLobbyId);
    if (!lobby) return;

    const player = lobby.players.find((p) => p.id === this.playerId);
    if (player) {
      player.ready = true;
    }

    this.sendMessage({
      type: WSEventType.PLAYER_READY,
      payload: { playerId: this.playerId },
    });

    // Check if all players are ready
    if (lobby.players.every((p) => p.ready)) {
      this.sendMessage({
        type: WSEventType.LOBBY_UPDATED,
        payload: {
          lobby,
          allReady: true,
        },
      });
    }
  }

  private sendNextQuestion(lobby: MockLobby): void {
    if (lobby.currentQuestion >= lobby.totalQuestions) {
      this.endGame(lobby);
      return;
    }

    lobby.currentQuestion++;

    const { questionTimeMs, betweenQuestionsMs } = this.getTimings();

    const mockQuestion = {
      id: `q_${lobby.currentQuestion}`,
      text: `Question ${lobby.currentQuestion}: What is the capital of France?`,
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 1,
      category: 'Geography',
      difficulty: 'easy',
      timeLimit: Math.round(questionTimeMs / 1000),
    };

    this.sendMessage({
      type: WSEventType.QUESTION_START,
      payload: {
        question: mockQuestion,
        questionNumber: lobby.currentQuestion,
        totalQuestions: lobby.totalQuestions,
      },
    });

    // Auto-advance to next question after time limit
    setTimeout(() => {
      this.sendMessage({
        type: WSEventType.QUESTION_END,
        payload: {
          questionId: mockQuestion.id,
          correctAnswer: mockQuestion.correctAnswer,
          explanation: 'Paris is the capital of France.',
        },
      });

      // Next question after a short delay
      setTimeout(() => {
        this.sendNextQuestion(lobby);
      }, betweenQuestionsMs);
    }, questionTimeMs);
  }

  private endGame(lobby: MockLobby): void {
    const finalScores = lobby.players
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        playerId: p.id,
        name: p.name,
        score: p.score,
      }));

    this.sendMessage({
      type: WSEventType.GAME_ENDED,
      payload: {
        finalScores,
        winner: finalScores[0],
      },
    });

    lobby.gameStarted = false;
    lobby.currentQuestion = 0;
  }

  private sendMessage(data: any): void {
    const event = new MessageEvent('message', {
      data: JSON.stringify(data),
      origin: this.url,
    });

    setTimeout(() => {
      this.dispatchEvent(event);
    }, 0);
  }

  private startSimulation(): void {
    // Simulate periodic events
    this.simulationTimer = setInterval(() => {
      if (this.readyState !== MockWebSocket.OPEN) {
        this.stopSimulation();
        return;
      }

      // Random simulation events
      const random = Math.random();

      if (random < 0.1 && this.currentLobbyId) {
        // Simulate random player joining
        const lobby = this.lobbies.get(this.currentLobbyId);
        if (lobby && lobby.players.length < lobby.maxPlayers && !lobby.gameStarted) {
          const newPlayer: MockPlayer = {
            id: `bot_${Date.now()}`,
            name: this.getRandomPlayerName(),
            score: 0,
            ready: false,
            connected: true,
          };
          lobby.players.push(newPlayer);

          this.sendMessage({
            type: WSEventType.PLAYER_JOINED,
            payload: { player: newPlayer },
          });
        }
      } else if (random < 0.05) {
        // Simulate ping
        this.sendMessage({ type: WSEventType.PING, timestamp: Date.now() });
      }
    }, 5000);

    // If in taskBoardLive scenario, emit periodic task updates to simulate a live board
    if (this.scenario === 'taskBoardLive' && !this.taskTimer) {
      this.taskTimer = setInterval(() => {
        if (this.readyState !== MockWebSocket.OPEN) return;
        const statuses = ['todo', 'in_progress', 'done', 'blocked'] as const;
        const task = {
          id: `task_${Math.floor(Math.random() * 10000)}`,
          title: 'Live update ' + Math.floor(Math.random() * 100),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          updatedAt: new Date().toISOString(),
        };
        this.sendMessage({ type: WSEventType.TASK_UPDATE, payload: task });
      }, 2000);
    }
  }

  private getTimings() {
    if (this.scenario === 'matchHappyPath') {
      return {
        countdownMs: 1000,
        questionTimeMs: 5000,
        betweenQuestionsMs: 500,
        startDelayMs: 300,
      };
    }
    return {
      countdownMs: 3000,
      questionTimeMs: 30000,
      betweenQuestionsMs: 3000,
      startDelayMs: 1000,
    };
  }

  private simulateTemporaryDisconnect(): void {
    if (this.didSimulateDisconnect) return;
    this.didSimulateDisconnect = true;
    // Disconnect after 10s, reconnect 1.5s later
    setTimeout(() => {
      if (this.readyState !== MockWebSocket.OPEN) return;
      this.readyState = MockWebSocket.CLOSING;
      this.dispatchEvent(new CloseEvent('close', { code: 1001, reason: 'Simulated disconnect' }));
      this.stopSimulation();
      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN;
        this.dispatchEvent(new Event('open'));
        this.startSimulation();
      }, 1500);
    }, 10000);
  }

  private stopSimulation(): void {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    if (this.taskTimer) {
      clearInterval(this.taskTimer);
      this.taskTimer = null;
    }
  }

  private getRandomPlayerName(): string {
    const names = ['QuizMaster', 'BrainStorm', 'Genius', 'Scholar', 'Thinker', 'Challenger'];
    return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100);
  }

  private getRandomChatMessage(): string {
    const messages = [
      'Good luck everyone!',
      'This is fun!',
      'That was a tough one!',
      'Great job!',
      "I'm ready!",
      "Let's go!",
      'Nice score!',
      'Almost had it!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // WebSocket properties (for compatibility)
  get bufferedAmount(): number {
    return 0;
  }
  get url_(): string {
    return this.url;
  }
  get readyState_(): number {
    return this.readyState;
  }
  get protocol_(): string {
    return this.protocol;
  }
  get extensions_(): string {
    return this.extensions;
  }
  get binaryType_(): 'blob' | 'arraybuffer' {
    return this.binaryType;
  }
  set binaryType_(value: 'blob' | 'arraybuffer') {
    this.binaryType = value;
  }

  // Event handler properties
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
}

// Factory function to create WebSocket instances
export function createMockWebSocket(url: string, protocols?: string | string[]): MockWebSocket {
  return new MockWebSocket(url, protocols);
}

// Global override for WebSocket (optional, controlled by environment)
export function enableWebSocketMocking(): void {
  if (typeof global !== 'undefined') {
    (global as any).WebSocket = MockWebSocket;
    console.log('[MockWebSocket] WebSocket mocking enabled globally');
  }
}

export function disableWebSocketMocking(): void {
  if (typeof global !== 'undefined' && (global as any).OriginalWebSocket) {
    (global as any).WebSocket = (global as any).OriginalWebSocket;
    console.log('[MockWebSocket] WebSocket mocking disabled');
  }
}

// Auto-enable in test/demo environments
if (process.env.USE_MOCK_WEBSOCKET === 'true' || process.env.NODE_ENV === 'test') {
  enableWebSocketMocking();
}

export { MockWebSocket };
