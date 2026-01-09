import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface StreamControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const StreamControls = ({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}: StreamControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant={audioEnabled ? "default" : "destructive"}
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onToggleAudio}
      >
        {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>

      <Button
        variant={videoEnabled ? "default" : "destructive"}
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onToggleVideo}
      >
        {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        className="h-14 w-14 rounded-full"
        onClick={onEndCall}
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default StreamControls;