import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(serverUrl: string = 'https://dbackend-xv7g.onrender.com') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('[useSocket] Creating socket for', serverUrl);
    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('[useSocket] Connected to server', serverUrl);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[useSocket] Disconnected from server. Reason:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[useSocket] Connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      console.log('[useSocket] Cleaning up socket for', serverUrl);
      socketInstance.disconnect();
    };
  }, [serverUrl]);

  return { socket, isConnected };
}