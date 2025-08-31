// src/services/multiplayerService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import AnalyticsService from './analyticsService';
import { createSocket } from '../lib/socket';

export interface MultiplayerRoom {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  gameMode: 'speed' | 'accuracy' | 'survival' | 'tournament';
  timeLimit: number; // seconds per question
  questionCount: number;
  status: 'waiting' | 'starting' | 'active' | 'finished';
  createdBy: string;
  createdAt: string;
}

export interface MultiplayerPlayer {
  id: string;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  avatarUrl?: string;
  isReady: boolean;
  score: number;
  correctAnswers: number;
  streak: number;
  position: number;
  isHost: boolean;
  isPremium: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  category: string;
  timeLimit: number;
}

export interface GameState {
  roomId: string;
  currentQuestion: number;
  totalQuestions: number;
  question?: QuizQuestion;
  timeRemaining: number;
  players: MultiplayerPlayer[];
  gameStatus: 'waiting' | 'starting' | 'question' | 'results' | 'finished';
  leaderboard: MultiplayerPlayer[];
  round: number;
}

export interface PlayerAnswer {
  playerId: string;
  questionId: string;
  answerIndex: number;
  timeToAnswer: number;
  isCorrect: boolean;
}

class MultiplayerService {
  private static instance: MultiplayerService;
  private socket: any | null = null;
  private currentRoom: MultiplayerRoom | null = null;
  private gameState: GameState | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnected = false;

  private constructor() {
    this.initializeEventListeners();
  }

  static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService();
    }
    return MultiplayerService.instance;
  }

  // Initialize WebSocket connection
  async connect(userId: string, token: string): Promise<boolean> {
    try {
      const serverUrl = Platform.OS === 'web' ? 'ws://localhost:3001' : 'ws://10.0.2.2:3001'; // Android emulator

      this.socket = createSocket(serverUrl, {
        auth: {
          userId,
          token,
        },
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
      });

      return new Promise((resolve) => {
        this.socket!.on('connect', () => {
          console.log('🔗 Connected to multiplayer server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected', { userId });
          resolve(true);
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ Connection error:', error);
          this.isConnected = false;
          this.handleReconnect();
          resolve(false);
        });

        this.socket!.on('disconnect', (reason) => {
          console.log('🔌 Disconnected:', reason);
          this.isConnected = false;
          this.emit('disconnected', { reason });

          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnect();
          }
        });
      });
    } catch (error) {
      console.error('Failed to connect to multiplayer server:', error);
      return false;
    }
  }

  // Handle reconnection logic
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnect_failed', {});
    }
  }

  // Initialize event listeners
  private initializeEventListeners() {
    // Room events
    this.on('room_created', this.handleRoomCreated.bind(this));
    this.on('room_joined', this.handleRoomJoined.bind(this));
    this.on('room_left', this.handleRoomLeft.bind(this));
    this.on('player_joined', this.handlePlayerJoined.bind(this));
    this.on('player_left', this.handlePlayerLeft.bind(this));
    this.on('player_ready', this.handlePlayerReady.bind(this));

    // Game events
    this.on('game_starting', this.handleGameStarting.bind(this));
    this.on('game_started', this.handleGameStarted.bind(this));
    this.on('question_received', this.handleQuestionReceived.bind(this));
    this.on('answer_received', this.handleAnswerReceived.bind(this));
    this.on('question_results', this.handleQuestionResults.bind(this));
    this.on('game_finished', this.handleGameFinished.bind(this));
    this.on('leaderboard_updated', this.handleLeaderboardUpdated.bind(this));
  }

  // Create a new multiplayer room
  async createRoom(roomConfig: Partial<MultiplayerRoom>): Promise<MultiplayerRoom | null> {
    if (!this.socket || !this.isConnected) {
      console.error('Not connected to multiplayer server');
      return null;
    }

    return new Promise((resolve) => {
      this.socket!.emit('create_room', roomConfig, (response: any) => {
        if (response.success) {
          console.log('🏠 Room created:', response.room.id);
          resolve(response.room);
        } else {
          console.error('Failed to create room:', response.error);
          resolve(null);
        }
      });
    });
  }

  // Join an existing room
  async joinRoom(roomId: string): Promise<boolean> {
    if (!this.socket || !this.isConnected) {
      console.error('Not connected to multiplayer server');
      return false;
    }

    return new Promise((resolve) => {
      this.socket!.emit('join_room', { roomId }, (response: any) => {
        if (response.success) {
          console.log('🚪 Joined room:', roomId);
          resolve(true);
        } else {
          console.error('Failed to join room:', response.error);
          resolve(false);
        }
      });
    });
  }

  // Leave current room
  async leaveRoom(): Promise<boolean> {
    if (!this.socket || !this.currentRoom) {
      return false;
    }

    return new Promise((resolve) => {
      this.socket!.emit('leave_room', { roomId: this.currentRoom!.id }, (response: any) => {
        if (response.success) {
          console.log('🚪 Left room:', this.currentRoom!.id);
          this.currentRoom = null;
          this.gameState = null;
          resolve(true);
        } else {
          console.error('Failed to leave room:', response.error);
          resolve(false);
        }
      });
    });
  }

  // Get list of available rooms
  async getRooms(filters?: {
    category?: string;
    difficulty?: string;
    gameMode?: string;
  }): Promise<MultiplayerRoom[]> {
    if (!this.socket || !this.isConnected) {
      return [];
    }

    return new Promise((resolve) => {
      this.socket!.emit('get_rooms', filters, (response: any) => {
        if (response.success) {
          resolve(response.rooms);
        } else {
          console.error('Failed to get rooms:', response.error);
          resolve([]);
        }
      });
    });
  }

  // Mark player as ready
  async setReady(ready: boolean = true): Promise<boolean> {
    if (!this.socket || !this.currentRoom) {
      return false;
    }

    return new Promise((resolve) => {
      this.socket!.emit(
        'player_ready',
        { roomId: this.currentRoom!.id, ready },
        (response: any) => {
          resolve(response.success);
        },
      );
    });
  }

  // Submit answer for current question
  async submitAnswer(answerIndex: number, timeToAnswer: number): Promise<boolean> {
    if (!this.socket || !this.gameState?.question) {
      return false;
    }

    const answer: PlayerAnswer = {
      playerId: 'current_player', // Will be set by server
      questionId: this.gameState.question.id,
      answerIndex,
      timeToAnswer,
      isCorrect: answerIndex === this.gameState.question.correctAnswer,
    };

    return new Promise((resolve) => {
      this.socket!.emit('submit_answer', answer, (response: any) => {
        if (response.success) {
          // Track analytics
          AnalyticsService.trackEvent('multiplayer_answer_submitted', {
            roomId: this.currentRoom?.id,
            questionId: this.gameState?.question?.id,
            isCorrect: answer.isCorrect,
            timeToAnswer,
            gameMode: this.currentRoom?.gameMode,
          });
        }
        resolve(response.success);
      });
    });
  }

  // Send chat message (if implemented)
  async sendChatMessage(message: string): Promise<boolean> {
    if (!this.socket || !this.currentRoom) {
      return false;
    }

    return new Promise((resolve) => {
      this.socket!.emit(
        'chat_message',
        {
          roomId: this.currentRoom!.id,
          message,
        },
        (response: any) => {
          resolve(response.success);
        },
      );
    });
  }

  // Event handling methods
  private handleRoomCreated(data: { room: MultiplayerRoom }) {
    this.currentRoom = data.room;
    console.log('🏠 Room created event:', data.room.id);
  }

  private handleRoomJoined(data: { room: MultiplayerRoom; gameState: GameState }) {
    this.currentRoom = data.room;
    this.gameState = data.gameState;
    console.log('🚪 Room joined event:', data.room.id);
  }

  private handleRoomLeft(data: { roomId: string }) {
    if (this.currentRoom?.id === data.roomId) {
      this.currentRoom = null;
      this.gameState = null;
    }
    console.log('🚪 Room left event:', data.roomId);
  }

  private handlePlayerJoined(data: { player: MultiplayerPlayer }) {
    if (this.gameState) {
      this.gameState.players.push(data.player);
    }
    console.log('👤 Player joined:', data.player.username);
  }

  private handlePlayerLeft(data: { playerId: string }) {
    if (this.gameState) {
      this.gameState.players = this.gameState.players.filter((p) => p.id !== data.playerId);
    }
    console.log('👤 Player left:', data.playerId);
  }

  private handlePlayerReady(data: { playerId: string; ready: boolean }) {
    if (this.gameState) {
      const player = this.gameState.players.find((p) => p.id === data.playerId);
      if (player) {
        player.isReady = data.ready;
      }
    }
    console.log('✅ Player ready state changed:', data.playerId, data.ready);
  }

  private handleGameStarting(data: { countdown: number }) {
    if (this.gameState) {
      this.gameState.gameStatus = 'starting';
    }
    console.log('🚀 Game starting in:', data.countdown);
  }

  private handleGameStarted(data: { gameState: GameState }) {
    this.gameState = data.gameState;
    console.log('🎮 Game started!');
  }

  private handleQuestionReceived(data: { question: QuizQuestion; questionNumber: number }) {
    if (this.gameState) {
      this.gameState.question = data.question;
      this.gameState.currentQuestion = data.questionNumber;
      this.gameState.gameStatus = 'question';
      this.gameState.timeRemaining = data.question.timeLimit;
    }
    console.log('❓ Question received:', data.questionNumber);
  }

  private handleAnswerReceived(data: { playerId: string; answer: PlayerAnswer }) {
    console.log('📝 Answer received from player:', data.playerId);
  }

  private handleQuestionResults(data: {
    correctAnswer: number;
    explanation: string;
    playerResults: { playerId: string; isCorrect: boolean; timeToAnswer: number }[];
  }) {
    if (this.gameState) {
      this.gameState.gameStatus = 'results';

      // Update player scores
      data.playerResults.forEach((result) => {
        const player = this.gameState!.players.find((p) => p.id === result.playerId);
        if (player) {
          if (result.isCorrect) {
            player.correctAnswers++;
            player.score += this.calculateScore(
              result.timeToAnswer,
              this.gameState!.question!.timeLimit,
            );
            player.streak++;
          } else {
            player.streak = 0;
          }
        }
      });
    }
    console.log('📊 Question results received');
  }

  private handleGameFinished(data: {
    finalResults: MultiplayerPlayer[];
    winner: MultiplayerPlayer;
  }) {
    if (this.gameState) {
      this.gameState.gameStatus = 'finished';
      this.gameState.leaderboard = data.finalResults;
    }

    // Track game completion
    AnalyticsService.trackEvent('multiplayer_game_finished', {
      roomId: this.currentRoom?.id,
      gameMode: this.currentRoom?.gameMode,
      playerCount: data.finalResults.length,
      finalPosition: data.finalResults.findIndex((p) => p.id === 'current_player') + 1,
    });

    console.log('🏆 Game finished! Winner:', data.winner.username);
  }

  private handleLeaderboardUpdated(data: { leaderboard: MultiplayerPlayer[] }) {
    if (this.gameState) {
      this.gameState.leaderboard = data.leaderboard;
    }
    console.log('📈 Leaderboard updated');
  }

  // Calculate score based on time and correctness
  private calculateScore(timeToAnswer: number, timeLimit: number): number {
    const baseScore = 100;
    const timeBonus = Math.max(0, ((timeLimit - timeToAnswer) / timeLimit) * 50);
    return Math.round(baseScore + timeBonus);
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Also listen on socket if connected
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }

      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  // Getters
  getCurrentRoom(): MultiplayerRoom | null {
    return this.currentRoom;
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  // Disconnect and cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentRoom = null;
    this.gameState = null;
    this.isConnected = false;
    this.listeners.clear();
    console.log('🔌 Disconnected from multiplayer server');
  }
}

export default MultiplayerService.getInstance();
