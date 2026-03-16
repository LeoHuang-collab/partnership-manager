// WebSocket 实时同步设置
// 监听数据库变化并通过 Socket.IO 广播给其他客户端

export default function setupSockets(io, db) {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('👋 Client disconnected:', socket.id);
    });

    // Projects 事件
    socket.on('project:created', async (data) => {
      socket.broadcast.emit('project:created', data);
    });

    socket.on('project:updated', async (data) => {
      socket.broadcast.emit('project:updated', data);
    });

    socket.on('project:deleted', async (id) => {
      socket.broadcast.emit('project:deleted', id);
    });

    // Partners 事件
    socket.on('partner:created', async (data) => {
      socket.broadcast.emit('partner:created', data);
    });

    socket.on('partner:updated', async (data) => {
      socket.broadcast.emit('partner:updated', data);
    });

    socket.on('partner:deleted', async (id) => {
      socket.broadcast.emit('partner:deleted', id);
    });

    // Todos 事件
    socket.on('todo:created', async (data) => {
      socket.broadcast.emit('todo:created', data);
    });

    socket.on('todo:updated', async (data) => {
      socket.broadcast.emit('todo:updated', data);
    });

    socket.on('todo:deleted', async (id) => {
      socket.broadcast.emit('todo:deleted', id);
    });

    socket.on('todo:statusChanged', async (data) => {
      socket.broadcast.emit('todo:updated', data);
    });

    // Reports 事件
    socket.on('report:created', async (data) => {
      socket.broadcast.emit('report:created', data);
    });

    socket.on('report:updated', async (data) => {
      socket.broadcast.emit('report:updated', data);
    });

    socket.on('report:deleted', async (id) => {
      socket.broadcast.emit('report:deleted', id);
    });
  });

  console.log('📡 Socket.IO hooks registered');
}
