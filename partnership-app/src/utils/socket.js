import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 监听特定事件
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    this.socket?.on(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    this.socket?.off(event, callback);
  }

  // 发送事件
  emit(event, data) {
    this.socket?.emit(event, data);
  }
}

export const socketManager = new SocketManager();

export default socketManager;
