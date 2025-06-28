import { useRef, useCallback } from 'react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

export function useWebRTC(
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>
) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }
    const peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the other peer via signaling server
        console.log('ICE candidate generated:', event.candidate);
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Remote stream received');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };

    // Add local stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
    }

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [localVideoRef, remoteVideoRef]);

  const createOffer = useCallback(async () => {
    try {
      const peerConnection = createPeerConnection();
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }, [createPeerConnection]);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = createPeerConnection();
      await peerConnection.setRemoteDescription(offer);
      
      // Process queued ICE candidates
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        if (candidate) {
          await peerConnection.addIceCandidate(candidate);
        }
      }
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      return null;
    }
  }, [createPeerConnection]);

  const addAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current) {
        // Only set remote answer if signalingState is 'have-local-offer'
        if (peerConnectionRef.current.signalingState === 'have-local-offer') {
          await peerConnectionRef.current.setRemoteDescription(answer);
          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            if (candidate) {
              await peerConnectionRef.current.addIceCandidate(candidate);
            }
          }
        } else {
          console.warn('Skipping setRemoteDescription(answer) because signalingState is', peerConnectionRef.current.signalingState);
        }
      }
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } else {
        // Queue the candidate if remote description is not set yet
        iceCandidatesQueue.current.push(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const setRemoteStream = useCallback((stream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, [remoteVideoRef]);

  return {
    createOffer,
    createAnswer,
    addAnswer,
    addIceCandidate,
    setRemoteStream
  };
}