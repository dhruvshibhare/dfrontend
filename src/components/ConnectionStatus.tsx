import { Wifi, WifiOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { ConnectionState } from '../App';

interface ConnectionStatusProps {
  connectionState: ConnectionState;
}

export function ConnectionStatus({ connectionState }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (connectionState.status) {
      case 'connected': return 'text-green-400';
      case 'connecting':
      case 'waiting': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getStatusText = () => {
    switch (connectionState.status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'waiting': return 'Waiting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {connectionState.status === 'connected' ? (
          <Wifi size={14} className={getStatusColor()} />
        ) : (
          <WifiOff size={14} className={getStatusColor()} />
        )}
        <span className={`text-xs sm:text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Media Status */}
      {connectionState.status !== 'disconnected' && (
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1">
            {connectionState.hasVideo ? (
              <Video size={14} className="text-green-400" />
            ) : (
              <VideoOff size={14} className="text-red-400" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            {connectionState.hasAudio ? (
              <Mic size={14} className="text-green-400" />
            ) : (
              <MicOff size={14} className="text-red-400" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}