import { format, addMinutes, addHours, isPast, isFuture } from "date-fns";

// 🧪 TESTING MODE: Set to true to bypass time window validation
const ENABLE_TESTING_MODE = true;

export interface TimeWindowResult {
  canJoin: boolean;
  status: 'too-early' | 'live-now' | 'ended' | 'available-soon';
  message: string;
  timeUntilStart?: string;
  testingMode?: boolean;
}

export const checkSessionTimeWindow = (
  scheduledDate: string,
  scheduledTime: string | null,
  beforeMinutes: number = 15,
  afterHours: number = 2
): TimeWindowResult => {
  // 🧪 Testing mode override - allow joining any session with meeting_link
  if (ENABLE_TESTING_MODE) {
    return {
      canJoin: true,
      status: 'live-now',
      message: '🧪 Testing Mode - Join anytime',
      testingMode: true,
    };
  }
  const now = new Date();
  
  // Create session start time
  const sessionStart = new Date(scheduledDate);
  if (scheduledTime) {
    const [hours, minutes] = scheduledTime.split(':');
    sessionStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  // Calculate time window boundaries
  const earliestJoinTime = addMinutes(sessionStart, -beforeMinutes);
  const latestJoinTime = addHours(sessionStart, afterHours);
  
  // Check if current time is within window
  const canJoinNow = now >= earliestJoinTime && now <= latestJoinTime;
  const hasStarted = now >= earliestJoinTime;
  const hasEnded = now > latestJoinTime;
  
  // Calculate time until start
  const minutesUntilStart = Math.floor((sessionStart.getTime() - now.getTime()) / 1000 / 60);
  const hoursUntilStart = Math.floor(minutesUntilStart / 60);
  
  let timeUntilStart = '';
  if (minutesUntilStart > 0) {
    if (hoursUntilStart > 24) {
      const days = Math.floor(hoursUntilStart / 24);
      timeUntilStart = `${days} day${days > 1 ? 's' : ''}`;
    } else if (hoursUntilStart > 0) {
      const remainingMinutes = minutesUntilStart % 60;
      timeUntilStart = `${hoursUntilStart}h ${remainingMinutes}m`;
    } else {
      timeUntilStart = `${minutesUntilStart} minute${minutesUntilStart > 1 ? 's' : ''}`;
    }
  }
  
  if (hasEnded) {
    return {
      canJoin: false,
      status: 'ended',
      message: 'Session has ended',
    };
  }
  
  if (canJoinNow) {
    return {
      canJoin: true,
      status: 'live-now',
      message: hasStarted ? 'Session is live' : 'Join session',
    };
  }
  
  if (minutesUntilStart <= beforeMinutes) {
    return {
      canJoin: false,
      status: 'available-soon',
      message: `Available in ${timeUntilStart}`,
      timeUntilStart,
    };
  }
  
  return {
    canJoin: false,
    status: 'too-early',
    message: `Starts in ${timeUntilStart}`,
    timeUntilStart,
  };
};

export const getSessionStatusBadge = (
  scheduledDate: string,
  scheduledTime: string | null
): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string } => {
  const result = checkSessionTimeWindow(scheduledDate, scheduledTime);
  
  switch (result.status) {
    case 'live-now':
      return { variant: 'destructive', text: 'Live Now' };
    case 'available-soon':
      return { variant: 'default', text: `Starts ${result.timeUntilStart}` };
    case 'ended':
      return { variant: 'secondary', text: 'Completed' };
    case 'too-early':
      return { variant: 'outline', text: `Starts ${result.timeUntilStart}` };
    default:
      return { variant: 'outline', text: 'Scheduled' };
  }
};
