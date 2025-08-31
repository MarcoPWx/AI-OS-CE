# WebSocket API (Multiplayer)

> Status: Complete
> Last Updated: 2025-08-28
> Author: Docs Team
> Version: 1.0

## Overview

Real-time multiplayer uses a WebSocket-based protocol. The mobile app can operate against:

- Real server (socket.io/WebSocket) in production
- Mock WebSocket in development/testing via environment toggles

This document specifies client→server actions and server→client events used by the app. The mock implementation mirrors these payloads where practical.

## Connection & Auth

- URL: ws(s)://<host>/multiplayer or socket.io namespace as configured
- Auth: pass a bearer token as a query param/header (real server). In mock mode, auth is bypassed.

Example (pseudo):

```json path=null start=null
{
  "type": "auth",
  "token": "<jwt>"
}
```

## Client → Server Messages

- CREATE_LOBBY
  - payload: { name?: string; maxPlayers?: number; questionCount?: number; playerName?: string; avatar?: string }
- JOIN_LOBBY
  - payload: { code: string; playerName?: string; avatar?: string }
- LEAVE_LOBBY
  - payload: {}
- PLAYER_READY
  - payload: {}
- START_GAME
  - payload: {}
- SUBMIT_ANSWER
  - payload: { questionId: string; answer: number; timeSpent: number }
- SEND_MESSAGE
  - payload: { text: string }

Client sends JSON frames: { type: string; payload?: any }

## Server → Client Events

- lobby:created
  - payload: { lobbyId: string; code: string; lobby: Lobby }
- lobby:joined
  - payload: { lobby: Lobby; playerId: string }
- lobby:left
  - payload: { playerId: string }
- lobby:updated
  - payload: { lobby: Lobby; allReady?: boolean }
- player:joined / player:left / player:ready
  - payload: { player: Player } | { playerId: string }
- game:starting
  - payload: { countdown: number }
- game:started
  - payload: { lobby: Lobby }
- question:start
  - payload: { question: Question; questionNumber: number; totalQuestions: number }
- question:end
  - payload: { questionId: string; correctAnswer: number; explanation?: string }
- answer:submitted
  - payload: { playerId: string; questionId: string; isCorrect: boolean; points: number }
- scores:updated
  - payload: { scores: Array<{ playerId: string; name: string; score: number }> }
- game:ended
  - payload: { finalScores: Array<{ rank: number; playerId: string; name: string; score: number }>; winner: { playerId: string; name: string; score: number } }
- ping / pong
- task:update (demo/live feed)
  - payload: { id: string; title: string; status: 'todo' | 'in_progress' | 'done' | 'blocked'; updatedAt: string }

Types

```json path=null start=null
Player: {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  ready: boolean;
  connected: boolean;
}
Lobby: {
  id: string;
  code: string;
  name: string;
  host: string; // playerId
  players: Player[];
  maxPlayers: number;
  gameStarted: boolean;
  currentQuestion: number;
  totalQuestions: number;
}
Question: {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index
  category: string;
  difficulty: string;
  timeLimit: number; // seconds
}
```

## Timings

- Default: countdown=3s, question=30s, between-questions=3s
- Mock scenario “matchHappyPath”: countdown=1s, question=5s, between=0.5s
- Mock scenario “disconnectRecovery”: triggers a brief simulated disconnect/reconnect once
- Mock scenario “taskBoardLive”: emits periodic task:update events for demo/live boards

## Notes

- The real-time transport may be socket.io on the server; the client abstraction should hide transport differences.
- In mock mode, environment variables control behavior. See docs/mocks/WEBSOCKET_MOCKS.md.

## Related Documentation

- docs/mocks/WEBSOCKET_MOCKS.md
- docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md
- docs/MOCKS_OVERVIEW.md
- docs/MSW_SETUP.md
