// src/lib/socket.ts
// Socket abstraction to allow runtime mocking via environment flags

const USE_WS_MOCKS =
  process.env.EXPO_PUBLIC_USE_WS_MOCKS === '1' ||
  process.env.EXPO_PUBLIC_USE_ALL_MOCKS === '1' ||
  process.env.USE_MOCKS === 'true' ||
  process.env.NODE_ENV === 'test';

// Minimal event emitter (avoids Node 'events' dependency)
class Emitter {
  private listeners: Map<string, Function[]> = new Map();
  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
    return this;
  }
  off(event: string, cb?: Function) {
    if (!this.listeners.has(event)) return this;
    if (!cb) {
      this.listeners.delete(event);
      return this;
    }
    const arr = this.listeners.get(event)!;
    const idx = arr.indexOf(cb);
    if (idx >= 0) arr.splice(idx, 1);
    return this;
  }
  emit(event: string, ...args: any[]) {
    const arr = this.listeners.get(event);
    if (arr) arr.forEach((fn) => fn(...args));
    return this;
  }
}

class MockSocket extends Emitter {
  url: string;
  options: any;
  constructor(url: string, options?: any) {
    super();
    this.url = url;
    this.options = options;
    setTimeout(() => this.emit('connect'), 0);
  }
  connect() {
    setTimeout(() => this.emit('connect'), 0);
  }
  disconnect() {
    setTimeout(() => this.emit('disconnect', 'io client disconnect'), 0);
  }
  emit(event: string, ...args: any[]) {
    const maybeAck = args[args.length - 1];
    const ack = typeof maybeAck === 'function' ? maybeAck : null;
    if (ack) {
      switch (event) {
        case 'create_room':
          return setTimeout(
            () => ack({ success: true, room: { id: 'room_mock', name: 'Mock Room' } }),
            0,
          );
        case 'join_room':
        case 'leave_room':
        case 'player_ready':
        case 'submit_answer':
        case 'chat_message':
          return setTimeout(() => ack({ success: true }), 0);
        case 'get_rooms':
          return setTimeout(() => ack({ success: true, rooms: [] }), 0);
        default:
          return setTimeout(() => ack({ success: true }), 0);
      }
    }
    return super.emit(event, ...args);
  }
}

export function createSocket(url: string, options?: any): any {
  if (USE_WS_MOCKS) {
    return new MockSocket(url, options);
  }
  // Defer import to avoid bundling in some environments
  const { io } = require('socket.io-client');
  return io(url, options);
}
