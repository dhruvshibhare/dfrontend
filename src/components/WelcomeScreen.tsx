import React from 'react';
import { Video, MessageCircle, Users, Shield, Wifi, WifiOff } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  isConnected: boolean;
}

export function WelcomeScreen({ onStart, isConnected }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Connection Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-medium">
              {isConnected ? 'Connected to server' : 'Connecting to server...'}
            </span>
          </div>
        </div>

        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-400 mb-4">
            <Video size={40} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
            ChatRoulette
          </h1>
          <p className="text-lg sm:text-xl text-gray-400">Connect with strangers around the world</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <Video className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">HD Video Chat</h3>
            <p className="text-xs sm:text-sm text-gray-400">Crystal clear video quality</p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Real-time Chat</h3>
            <p className="text-xs sm:text-sm text-gray-400">Instant messaging while video chatting</p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Anonymous</h3>
            <p className="text-xs sm:text-sm text-gray-400">No registration required</p>
          </div>
          <div className="p-4 sm:p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
            <Users className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Global</h3>
            <p className="text-xs sm:text-sm text-gray-400">Connect worldwide</p>
          </div>
        </div>

        {/* Start Button */}
        <div className="space-y-4">
          <button
            onClick={onStart}
            disabled={!isConnected}
            className="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-full font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            {isConnected ? 'Start Video Chat' : 'Connecting...'}
          </button>
          
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            By clicking "Start Video Chat", you agree to allow camera/microphone access and connect with random strangers
          </p>
        </div>

        {/* Stats */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>12,843 online</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full hidden sm:block"></div>
          <div>Available 24/7</div>
          <div className="w-1 h-1 bg-gray-600 rounded-full hidden sm:block"></div>
          <div>Free to use</div>
        </div>
      </div>
    </div>
  );
}