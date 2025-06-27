import React from 'react';
import { CameraOff, User, Loader } from 'lucide-react';
import { ConnectionState } from '../App';

interface VideoChatProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  connectionState: ConnectionState;
}

export function VideoChat({ localVideoRef, remoteVideoRef, connectionState }: VideoChatProps) {
  console.log('[VideoChat] Rendered. hasVideo:', connectionState.hasVideo, 'localVideoRef:', localVideoRef.current);

  const getStatusMessage = () => {
    switch (connectionState.status) {
      case 'connecting': return 'Looking for someone to chat with...';
      case 'waiting': return 'Waiting for stranger...';
      case 'connected': return 'Connected! Say hello!';
      default: return 'Click start to begin';
    }
  };

  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected': return 'text-green-400';
      case 'connecting':
      case 'waiting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-2 sm:space-y-4">
      {/* Remote Video (Main) */}
      <div className="flex-1 relative rounded-lg sm:rounded-xl overflow-hidden bg-gray-800 shadow-2xl min-h-[200px]">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Placeholder when no remote video */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center p-4">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
              {connectionState.status === 'connecting' || connectionState.status === 'waiting' ? (
                <Loader size={24} className="text-gray-400 animate-spin" />
              ) : (
                <User size={24} className="text-gray-400" />
              )}
            </div>
            <p className={`text-sm sm:text-lg font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {/* Connection Status Overlay */}
        {(connectionState.status === 'connecting' || connectionState.status === 'waiting') && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-yellow-500/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-white">
                {connectionState.status === 'waiting' ? 'Waiting...' : 'Connecting...'}
              </span>
            </div>
          </div>
        )}

        {connectionState.status === 'connected' && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-green-500/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-white">Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="relative w-full sm:w-64 h-32 sm:h-48 rounded-lg overflow-hidden bg-gray-800 shadow-xl border-2 border-gray-700 sm:self-end">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!connectionState.hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <CameraOff size={20} className="text-gray-400" />
          </div>
        )}

        {/* Video Status Indicator */}
        <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${connectionState.hasVideo ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>

        {/* Label */}
        <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-black/60 backdrop-blur-sm">
          <span className="text-xs text-white font-medium">You</span>
        </div>
      </div>
    </div>
  );
}