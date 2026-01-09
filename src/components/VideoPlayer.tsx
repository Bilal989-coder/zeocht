import { useEffect, useRef } from 'react';
import { ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | null;
  userName: string;
  isLocal?: boolean;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export const VideoPlayer = ({ 
  videoTrack, 
  userName, 
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true 
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current && videoEnabled) {
      videoTrack.play(videoRef.current);
    }

    return () => {
      if (videoTrack && videoEnabled) {
        videoTrack.stop();
      }
    };
  }, [videoTrack, videoEnabled]);

  return (
    <Card className="relative aspect-video w-full overflow-hidden bg-muted">
      {videoEnabled && videoTrack ? (
        <div ref={videoRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <User className="h-24 w-24 text-muted-foreground" />
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 backdrop-blur-sm">
        <span className="text-sm font-medium text-foreground">{userName}</span>
        {!audioEnabled && (
          <span className="text-xs text-muted-foreground">(Muted)</span>
        )}
        {isLocal && (
          <span className="text-xs text-primary">(You)</span>
        )}
      </div>
    </Card>
  );
};

export default VideoPlayer;