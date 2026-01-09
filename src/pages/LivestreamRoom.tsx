import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { StreamControls } from '@/components/StreamControls';
import { toast } from 'sonner';
import { Loader2, Video, VideoOff } from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

const SERVERS = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export default function LivestreamRoom() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [roomJoined, setRoomJoined] = useState(false);
  const [otherParticipantName, setOtherParticipantName] = useState('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    setRemoteStream(null);
    setRoomJoined(false);
  }, []);

  useEffect(() => {
    if (!user || !bookingId) {
      navigate('/');
      return;
    }

    initializeSession();

    return () => {
      cleanup();
    };
  }, [bookingId, user]);

  // Handle remote stream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, loading]);

  // Handle local stream attachment after loading
  useEffect(() => {
    if (!loading && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [loading]);

  // Timer logic
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const start = new Date(sessionStartTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const initializeSession = async () => {
    try {
      setLoading(true);

      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          explorer:profiles!bookings_explorer_id_fkey(full_name, avatar_url),
          guide:profiles!bookings_guide_id_fkey(full_name, avatar_url)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError || !bookingData) {
        throw new Error('Booking not found');
      }

      // Verify user is authorized
      if (bookingData.explorer_id !== user.id && bookingData.guide_id !== user.id) {
        toast.error('You are not authorized to join this session');
        navigate('/');
        return;
      }

      setBooking(bookingData);

      // Set other participant name
      const otherName = bookingData.explorer_id === user.id
        ? (bookingData.guide?.full_name || 'Guide')
        : (bookingData.explorer?.full_name || 'Explorer');
      setOtherParticipantName(otherName);

      // Initialize WebRTC
      await setupWebRTC();

      // Get or create session for timer
      const { data: existingSession, error: sessionError } = await supabase
        .from('livestream_sessions')
        .select('session_start_time')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (existingSession?.session_start_time) {
        setSessionStartTime(existingSession.session_start_time);
      } else {
        const startTime = new Date().toISOString();
        const { error: createError } = await supabase
          .from('livestream_sessions')
          .insert({
            booking_id: bookingId,
            channel_name: `booking-${bookingId}`,
            session_start_time: startTime,
            status: 'active'
          });

        if (!createError) {
          setSessionStartTime(startTime);
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error initializing session:', error);
      toast.error(error.message || 'Failed to join livestream');
      setLoading(false);
    }
  };

  const setupWebRTC = async () => {
    try {
      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create PeerConnection
      const pc = new RTCPeerConnection(SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks to PeerConnection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        console.log('Received remote track');
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { candidate: event.candidate },
          });
        }
      };

      // Setup Signaling
      const channel = supabase.channel(`room-${bookingId}`, {
        config: {
          broadcast: { self: false },
        },
      });
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          console.log('Received offer');
          if (!peerConnectionRef.current) return;

          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          channel.send({
            type: 'broadcast',
            event: 'answer',
            payload: { answer },
          });
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          console.log('Received answer');
          if (!peerConnectionRef.current) return;

          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        })
        .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
          console.log('Received ICE candidate');
          if (!peerConnectionRef.current) return;

          try {
            await peerConnectionRef.current.addIceCandidate(payload.candidate);
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        })
        .on('broadcast', { event: 'ready' }, async () => {
          console.log('Peer is ready, initiating offer');
          createOffer();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Connected to signaling channel');
            setRoomJoined(true);
            // Announce we are ready
            channel.send({
              type: 'broadcast',
              event: 'ready',
              payload: {},
            });
          }
        });

    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      throw error;
    }
  };

  const createOffer = async () => {
    if (!peerConnectionRef.current || !channelRef.current) return;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      channelRef.current.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer },
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleToggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  }, [audioEnabled]);

  const handleToggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  }, [videoEnabled]);

  const handleEndCall = useCallback(async () => {
    cleanup();

    // Update session status in DB
    try {
      const { data: sessionData } = await supabase
        .from('livestream_sessions')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (sessionData) {
        await supabase
          .from('livestream_sessions')
          .update({
            status: 'completed',
            session_end_time: new Date().toISOString(),
          })
          .eq('id', sessionData.id);
      }
    } catch (error) {
      console.error("Error updating session status:", error);
    }

    toast.success('Call ended');

    if (booking?.explorer_id === user?.id) {
      navigate('/explorer/bookings');
    } else {
      navigate('/guide/bookings');
    }
  }, [bookingId, booking, user, navigate, cleanup]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Connecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Session</h1>
            {booking && (
              <p className="text-sm text-muted-foreground">
                {booking.explorer_id === user?.id ? 'with ' : 'hosting '}
                {otherParticipantName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-muted px-3 py-1 font-mono text-lg font-medium">
              {elapsedTime}
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${roomJoined ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
              <span className="text-sm text-muted-foreground">
                {roomJoined ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="grid h-full gap-4 lg:grid-cols-2">
          {/* Local Video */}
          <Card className="relative overflow-hidden bg-muted">
            <div className="absolute inset-0">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover -scale-x-100"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <VideoOff className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 px-3 py-2 backdrop-blur-sm">
              <span className="text-sm font-medium text-foreground">You</span>
              {!audioEnabled && (
                <span className="ml-2 text-xs text-muted-foreground">(Muted)</span>
              )}
            </div>
          </Card>

          {/* Remote Video */}
          <Card className="relative overflow-hidden bg-muted">
            <div className="absolute inset-0">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <Video className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Waiting for {otherParticipantName}...
                    </p>
                  </div>
                </div>
              )}
            </div>
            {remoteStream && (
              <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 px-3 py-2 backdrop-blur-sm">
                <span className="text-sm font-medium text-foreground">
                  {otherParticipantName}
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="border-t border-border bg-card px-6 py-4">
        <StreamControls
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}
