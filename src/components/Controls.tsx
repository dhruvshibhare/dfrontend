import React from 'react';
import { PhoneOff, SkipForward, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { ConnectionState } from '../App';

interface ControlsProps {
  connectionState: ConnectionState;
  onStop: () => void;
  onSkip: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

export function Controls({ 
  connectionState, 
  onStop, 
  onSkip, 
  onToggleVideo, 
  onToggleAudio 
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4">
      {/* Video Toggle */}
      <button
        onClick={onToggleVideo}
        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
          connectionState.hasVideo
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={connectionState.hasVideo ? 'Turn off camera' : 'Turn on camera'}
      >
        {connectionState.hasVideo ? <Video size={16} /> : <VideoOff size={16} />}
      </button>

      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
          connectionState.hasAudio
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={connectionState.hasAudio ? 'Mute microphone' : 'Unmute microphone'}
      >
        {connectionState.hasAudio ? <Mic size={16} /> : <MicOff size={16} />}
      </button>

      {/* Skip User */}
      <button
        onClick={onSkip}
        disabled={connectionState.status !== 'connected'}
        className="p-2 sm:p-3 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-all duration-200"
        title="Skip to next person"
      >
        <SkipForward size={16} />
      </button>

      {/* Stop Chat */}
      <button
        onClick={onStop}
        className="p-2 sm:p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
        title="End chat"
      >
        <PhoneOff size={16} />
      </button>
    </div>
  );
}