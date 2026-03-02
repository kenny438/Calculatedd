import { LucideIcon } from "lucide-react";

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarSeed: string;
  text: string;
  timestamp: string;
  media?: {
    type: 'gif' | 'image';
    url: string;
  };
  likes: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: "Politics" | "Economics" | "Science" | "Culture" | "Crypto";
  endDate: string;
  yesPrice: number; // 0.01 to 0.99
  volume: number;
  liquidity: number;
  history: { date: string; price: number }[];
  image?: string;
  comments: Comment[];
  emoji?: string;
  themeColor?: string;
  rules?: string;
  keywords?: string[];
  groupId?: string;
  status?: 'open' | 'resolved';
  result?: 'YES' | 'NO';
}

export interface Position {
  marketId: string;
  side: "YES" | "NO";
  shares: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet_yes' | 'bet_no' | 'tax' | 'sell' | 'payout';
  amount: number;
  marketTitle?: string;
  date: string;
}

export interface UserProfile {
  username: string;
  email: string;
  bio: string;
  avatarSeed: string;
  joinedDate: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  onboardingCompleted?: boolean;
  xp?: number;
  level?: number;
  dailyStreak?: number;
  lastLogin?: string;
  referralCode?: string;
}

export interface GroupMember {
  userId: string;
  username: string;
  avatarSeed: string;
  role: "admin" | "member";
  joinedAt: string;
  totalVolume: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  members: GroupMember[];
  createdAt: string;
  isPrivate: boolean;
  emoji?: string;
  themeColor?: string;
  rules?: string;
  maxMembers?: number;
  minBet?: number;
}

export interface MicroChallenge {
  id: string;
  matchId: string;
  question: string;
  options: string[];
  expiresAt: string; // ISO string
  result?: string;
  type: 'f1' | 'football';
  points: number;
}

export interface LiveMatch {
  id: string;
  type: 'f1' | 'football';
  title: string;
  subtitle: string;
  status: 'live' | 'upcoming' | 'finished';
  currentEvent?: string; // e.g., "Lap 38/57" or "75'"
  stats?: Record<string, string | number>;
  image?: string;
}

export const MOCK_LIVE_MATCHES: LiveMatch[] = [
  {
    id: "f1-monaco-2025",
    type: 'f1',
    title: "Monaco Grand Prix",
    subtitle: "Circuit de Monaco",
    status: 'live',
    currentEvent: "Lap 38/78",
    stats: {
      "Weather": "Cloudy",
      "Tire Life": "Soft (12 laps)",
      "Gap to Leader": "+4.2s"
    },
    image: "https://picsum.photos/seed/monaco/800/400"
  },
  {
    id: "pl-liv-ars-2025",
    type: 'football',
    title: "Liverpool vs Arsenal",
    subtitle: "Premier League • Anfield",
    status: 'live',
    currentEvent: "75'",
    stats: {
      "Score": "1 - 1",
      "Possession": "52% - 48%",
      "Corners": "6 - 4"
    },
    image: "https://picsum.photos/seed/anfield/800/400"
  }
];

export const MOCK_MICRO_CHALLENGES: MicroChallenge[] = [
  {
    id: "mc-1",
    matchId: "f1-monaco-2025",
    question: "Safety Car within next 5 laps?",
    options: ["Yes", "No"],
    expiresAt: new Date(Date.now() + 45000).toISOString(),
    type: 'f1',
    points: 250
  },
  {
    id: "mc-2",
    matchId: "f1-monaco-2025",
    question: "Undercut attempt this lap?",
    options: ["Yes", "No"],
    expiresAt: new Date(Date.now() + 30000).toISOString(),
    type: 'f1',
    points: 150
  },
  {
    id: "mc-3",
    matchId: "pl-liv-ars-2025",
    question: "Goal in next 10 minutes?",
    options: ["Yes", "No"],
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    type: 'football',
    points: 500
  }
];

export interface ArenaSession {
  id: string;
  title: string;
  video_url: string;
  sport: string;
  created_by: string;
  created_at: string;
  status: 'live' | 'finished';
}

export interface ArenaChallenge {
  id: string;
  session_id: string;
  created_by: string;
  username: string;
  question: string;
  options: string[];
  points: number;
  expires_at: string;
  result?: string;
  created_at: string;
}

export const MOCK_MARKETS: Market[] = [];
