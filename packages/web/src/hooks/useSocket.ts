import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function useSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setIsConnected(false);
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket conectado');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('WebSocket desconectado:', reason);
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Erro de conexão WebSocket:', error);
        setIsConnected(false);
      });
    }

    socket = socketRef.current;

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      socket = null;
      setIsConnected(false);
    };
  }, [token]);

  return { socket: socketRef.current, isConnected };
}
