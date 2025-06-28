import { useState, useRef, useEffect } from 'react';
import { VideoChat } from './components/VideoChat';
import { ChatInterface } from './components/ChatInterface';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Controls } from './components/Controls';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useWebRTC } from './hooks/useWebRTC';
import { useSocket } from './hooks/useSocket';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'stranger' | 'system';
  timestamp: Date;
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'waiting';
  hasVideo: boolean;
  hasAudio: boolean;
}

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    hasVideo: false,
    hasAudio: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const { socket, isConnected } = useSocket('https://dbackend-xv7g.onrender.com');
  const { 
    createOffer, 
    createAnswer, 
    addAnswer, 
    addIceCandidate,
    addLocalTracks
  } = useWebRTC(localVideoRef, remoteVideoRef);

  useEffect(() => {
    if (!socket) return;

    const handleWaiting = () => setConnectionState(prev => ({ ...prev, status: 'waiting' }));

    const handleStrangerFound = async ({ roomId }: any) => {
      setCurrentRoom(roomId);
      setConnectionState(prev => ({ ...prev, status: 'connected' }));
      addMessage('Stranger connected!', 'system');
      const offer = await createOffer();
      if (offer) {
        socket.emit('webrtc-offer', { roomId, offer });
      }
    };

    const handleWebRTCOffer = async ({ offer }: any) => {
      const answer = await createAnswer(offer);
      if (answer && currentRoom) {
        socket.emit('webrtc-answer', { roomId: currentRoom, answer });
      }
    };

    const handleWebRTCAnswer = ({ answer }: any) => addAnswer(answer);

    const handleIceCandidate = ({ candidate }: any) => addIceCandidate(candidate);

    const handleReceiveMessage = ({ message, timestamp }: any) => {
      addMessage(message, 'stranger', new Date(timestamp));
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    const handleStrangerDisconnected = ({ reason }: any) => {
      addMessage(`Stranger ${reason === 'skipped' ? 'skipped' : 'disconnected'}`, 'system');
      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
      setCurrentRoom(null);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    socket.on('waiting-for-stranger', handleWaiting);
    socket.on('stranger-found', handleStrangerFound);
    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stopped-typing', handleStopTyping);
    socket.on('stranger-disconnected', handleStrangerDisconnected);

    return () => {
      socket.off('waiting-for-stranger', handleWaiting);
      socket.off('stranger-found', handleStrangerFound);
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stopped-typing', handleStopTyping);
      socket.off('stranger-disconnected', handleStrangerDisconnected);
    };
  }, [socket, currentRoom, createOffer, createAnswer, addAnswer, addIceCandidate]);

  // Add this useEffect after refs are defined
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      console.log('[App] useEffect set localVideoRef.srcObject');
    }
  }, [localVideoRef.current, localStreamRef.current]);

  const startChat = async () => {
    if (!socket || !isConnected) {
      alert('Not connected to server. Please refresh and try again.');
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, status: 'connecting' }));
      console.log('[App] Requesting camera and microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      console.log('[App] Got media stream:', stream);
      localStreamRef.current = stream;
      addLocalTracks(stream);
      setConnectionState({
        status: 'connecting',
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0
      });
      console.log('[App] setConnectionState hasVideo:', stream.getVideoTracks().length > 0);
      setIsStarted(true);
      socket.emit('find-stranger');
    } catch (error) {
      console.error('[App] Error accessing media devices:', error);
      const err = error as any;
      let errorMessage = 'Failed to access camera/microphone. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += `The requested media constraints cannot be satisfied: ${err.constraint}`;
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Camera/mic access is not allowed due to browser security settings.';
      } else {
        errorMessage += 'Please check your camera and microphone settings.';
      }
      errorMessage += `\nError details: ${err.name} - ${err.message}`;
      alert(errorMessage);
      setConnectionState(prev => ({ ...prev, status: 'disconnected' }));
    }
  };

  const stopChat = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (socket && currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom });
    }
    setIsStarted(false);
    setMessages([]);
    setCurrentRoom(null);
    setConnectionState({
      status: 'disconnected',
      hasVideo: false,
      hasAudio: false
    });
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const skipUser = () => {
    if (socket && currentRoom) {
      socket.emit('skip-user');
      setMessages([]);
      setConnectionState(prev => ({ ...prev, status: 'connecting' }));
    }
  };

  const addMessage = (text: string, sender: 'user' | 'stranger' | 'system', timestamp?: Date) => {
    const message: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      sender,
      timestamp: timestamp || new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = (text: string) => {
    if (socket && currentRoom) {
      socket.emit('send-message', { roomId: currentRoom, message: text });
      addMessage(text, 'user');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setConnectionState(prev => ({ ...prev, hasVideo: videoTrack.enabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setConnectionState(prev => ({ ...prev, hasAudio: audioTrack.enabled }));
      }
    }
  };

  if (!isStarted) {
    return <WelcomeScreen onStart={startChat} isConnected={isConnected} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-700/50 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              ChatRoulette
            </h1>
            <ConnectionStatus connectionState={connectionState} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 p-2 sm:p-4">
            <VideoChat
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              connectionState={connectionState}
            />
          </div>

          {/* Chat Section */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-700/50 bg-black/20 backdrop-blur-sm">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isTyping={isTyping}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-700/50 backdrop-blur-sm bg-black/20">
          <Controls
            connectionState={connectionState}
            onStop={stopChat}
            onSkip={skipUser}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
          />
        </div>
      </div>
    </div>
  );
}

export default App;