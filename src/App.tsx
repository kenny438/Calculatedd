import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { MarketCard } from "./components/MarketCard";
import { MarketDetail } from "./components/MarketDetail";
import { Portfolio } from "./components/Portfolio";
import { Wallet } from "./components/Wallet";
import { Profile } from "./components/Profile";
import { Government } from "./components/Government";
import { CreateMarketModal } from "./components/CreateMarketModal";
import { MOCK_MARKETS, Market, Position, Transaction, UserProfile, Comment, Group } from "./data/mockData";
import { Filter, TrendingUp, ArrowUpRight, ArrowDownRight, Users, Activity, Plus, Shield } from "lucide-react";
import { cn, formatPercent, formatCurrency } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useToast } from "./components/ui/Toast";
import { useAuth } from "./contexts/AuthContext";
import { Auth } from "./components/Auth";
import { OnboardingModal } from "./components/OnboardingModal";
import { Leaderboard } from "./components/Leaderboard";
import { Groups } from "./components/Groups";
import { TermsOfService } from "./components/TermsOfService";
import { Quests } from "./components/Quests";
import { Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { ShortcutsHelp } from "./components/ShortcutsHelp";

const DEFAULT_PROFILE: UserProfile = {
  username: "Trader123",
  email: "trader@example.com",
  bio: "Just a crypto enthusiast predicting the future one block at a time.",
  avatarSeed: "user123",
  joinedDate: new Date().toISOString(),
  onboardingCompleted: false,
};

export default function App() {
  const { session, loading, signOut } = useAuth();
  const userId = session?.user?.id || "guest";

  const [activeTab, setActiveTab] = useState("markets");
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  
  // Real State - User Specific (No more fake local storage for core data)
  const [balance, setBalance] = useState<number>(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [watchlist, setWatchlist] = useLocalStorage<string[]>(`kalshi-clone-watchlist-${userId}`, []);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sync with server on login
  useEffect(() => {
    if (session?.user?.id) {
      // Reset state immediately when user changes to prevent data leakage
      setIsInitialSyncDone(false);
      setSyncError(null);
      setUserProfile(DEFAULT_PROFILE);
      setBalance(10000);
      setPositions([]);
      setTransactions([]);
      setPortfolioHistory([]);
      
      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/user/${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            
            // Security check: Ensure we got the correct user's data
            if (data.user.id !== session.user.id) {
              console.error("Security Mismatch: Fetched user ID does not match session ID");
              setSyncError("Security mismatch detected. Please log in again.");
              return;
            }

            const { user, positions: serverPositions, transactions: serverTransactions } = data;
            
            setBalance(user.balance);
            setUserProfile({
              username: user.username || DEFAULT_PROFILE.username,
              email: user.email || session.user.email || "",
              bio: user.bio || DEFAULT_PROFILE.bio,
              avatarSeed: user.avatar_seed || DEFAULT_PROFILE.avatarSeed,
              joinedDate: user.joined_date || DEFAULT_PROFILE.joinedDate,
              isAdmin: user.is_admin === 1,
              onboardingCompleted: user.onboarding_completed === 1,
              xp: user.xp || 0,
              level: user.level || 1,
              dailyStreak: user.daily_streak || 0,
              lastLogin: user.last_login,
              referralCode: user.referral_code
            });
            setPositions(serverPositions.map((p: any) => ({
              marketId: p.market_id,
              side: p.side,
              shares: p.shares,
              avgPrice: p.avg_price
            })));
            setTransactions(serverTransactions);
            setIsInitialSyncDone(true);

            // Fetch portfolio history
            fetch(`/api/portfolio/history/${session.user.id}`)
              .then(res => res.json())
              .then(data => setPortfolioHistory(data));
          } else if (res.status === 404) {
            // New user - initialize on server
            const isAdmin = ["mgethmikadinujakumarathunga@gmail.com", "thewantab2012@gmail.com"].includes(session.user.email || "");
            
            // Ensure we use the default profile for new users, NOT any stale state
            const newProfile = {
              ...DEFAULT_PROFILE,
              email: session.user.email || "",
              isAdmin: isAdmin,
              joinedDate: new Date().toISOString()
            };

            await fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: session.user.id,
                username: newProfile.username,
                email: newProfile.email,
                bio: newProfile.bio,
                avatarSeed: newProfile.avatarSeed,
                balance: 10000,
                onboardingCompleted: false,
                isAdmin: isAdmin,
                joinedDate: newProfile.joinedDate
              })
            });
            
            // Update local state to reflect new user
            setUserProfile(newProfile);
            setIsInitialSyncDone(true);
          } else {
             throw new Error(`Server responded with status: ${res.status}`);
          }
        } catch (err: any) {
          console.error("Failed to sync user data:", err);
          setSyncError(err.message || "Failed to load user data");
          // Do NOT set isInitialSyncDone(true) here to prevent overwriting server data with default profile
        }
      };
      fetchUserData();
    } else {
      // Reset state on logout
      setUserProfile(DEFAULT_PROFILE);
      setBalance(10000);
      setPositions([]);
      setTransactions([]);
      setIsInitialSyncDone(false);
      setSyncError(null);
    }
  }, [session?.user?.id]);

  // Global State
  const [markets, setMarkets] = useState<Market[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Fetch global data on mount
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const [marketsRes, groupsRes] = await Promise.all([
          fetch('/api/markets'),
          fetch('/api/groups')
        ]);
        
        if (marketsRes.ok) {
          const serverMarkets = await marketsRes.json();
          if (serverMarkets.length > 0) {
            setMarkets(serverMarkets);
          } else {
            // If server has no markets, seed it with mock data
            for (const m of MOCK_MARKETS) {
              fetch('/api/markets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
              });
            }
          }
        }
        
        if (groupsRes.ok) {
          const serverGroups = await groupsRes.json();
          setGroups(serverGroups);
        }


      } catch (err) {
        console.error("Failed to fetch global data:", err);
      }
    };
    fetchGlobalData();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case 'm':
          setActiveTab("markets");
          break;
        case 'p':
          setActiveTab("portfolio");
          break;
        case 'l':
          setActiveTab("live");
          break;
        case 'c':
          setIsCreateModalOpen(true);
          break;
        case 'escape':
          setIsCreateModalOpen(false);
          setSelectedMarketId(null);
          setIsShortcutsOpen(false);
          break;
        case '?':
          setIsShortcutsOpen(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taxBalance, setTaxBalance] = useState(0);
  const { addToast } = useToast();

  const addTransaction = React.useCallback((type: Transaction['type'], amount: number, marketTitle?: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      marketTitle,
      date: new Date().toISOString()
    };
    setTransactions(prev => [...prev, newTx]);

    // Sync transaction to server
    if (session?.user?.id) {
      fetch('/api/user/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, transaction: newTx })
      }).catch(err => console.error("Failed to sync transaction:", err));
    }

    // Report tax to server for global collection
    if (type === 'tax' && amount > 0) {
      fetch('/api/tax/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }).catch(err => console.error("Failed to report tax:", err));
    }
  }, [setTransactions]);

  const handleClaimTaxes = async () => {
    const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
    if (session?.user?.email !== TAX_COLLECTOR) return;

    try {
      const res = await fetch('/api/tax/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TAX_COLLECTOR })
      });
      const data = await res.json();
      if (data.amount > 0) {
        setBalance(prev => prev + data.amount);
        setTaxBalance(0);
        addTransaction('deposit', data.amount, "Tax Collection Revenue");
        addToast(`Successfully claimed ${data.amount} pts in collected taxes! ↈ∭`, "success");
        addXP(200);
      } else {
        addToast("No taxes available to claim at this time.", "info");
      }
    } catch (err) {
      addToast("Failed to claim taxes.", "error");
    }
  };

  const addXP = async (amount: number) => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, xp: amount })
      });
      const data = await res.json();
      if (data.leveledUp) {
        addToast(`LEVEL UP! You are now Level ${data.newLevel}! 🚀`, "success");
        setUserProfile(prev => ({ ...prev, level: data.newLevel }));
      }
      setUserProfile(prev => ({ ...prev, xp: (prev.xp || 0) + amount }));
    } catch (err) {
      console.error("Failed to add XP:", err);
    }
  };

  const handleDailyClaim = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch('/api/user/daily-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(prev => prev + data.reward);
        setUserProfile(prev => ({ ...prev, dailyStreak: data.streak, lastLogin: new Date().toISOString() }));
        addToast(`Claimed ${data.reward} PTS! Daily streak: ${data.streak} days 🔥`, "success");
        addXP(50);
      } else {
        addToast(data.error || "Failed to claim daily reward", "error");
      }
    } catch (err) {
      addToast("Failed to claim daily reward", "error");
    }
  };



  const handleVoteSentiment = async (marketId: string, sentiment: 'YES' | 'NO') => {
    if (!session?.user?.id) return;
    try {
      await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId, userId: session.user.id, sentiment })
      });
      addToast(`Vibe check recorded: ${sentiment}!`, "success");
      addXP(10);
    } catch (err) {
      console.error("Failed to vote sentiment:", err);
    }
  };

  // Tax Collector Notification
  useEffect(() => {
    const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
    if (session?.user?.email === TAX_COLLECTOR) {
      const checkTaxBalance = async () => {
        try {
          const res = await fetch(`/api/tax/balance?email=${TAX_COLLECTOR}`);
          const data = await res.json();
          setTaxBalance(data.balance);
          if (data.balance > 0) {
            addToast(`You have ${data.balance} pts in collected taxes waiting for you! ↈ∭`, "success");
          }
        } catch (err) {
          console.error("Failed to check tax balance:", err);
        }
      };
      checkTaxBalance();
    }
  }, [session, addToast]);

  const handleCreateGroup = (name: string, description: string, customization: {
    emoji: string;
    themeColor: string;
    rules: string;
    maxMembers: number;
    minBet: number;
  }) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      description,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      isPrivate: true,
      ...customization,
      members: [{
        userId: session?.user.id || "me",
        username: userProfile.username,
        avatarSeed: userProfile.avatarSeed,
        role: "admin",
        joinedAt: new Date().toISOString(),
        totalVolume: 0
      }]
    };
    setGroups(prev => [newGroup, ...prev]);
    addToast(`Group "${name}" created!`, "success");

    // Sync group to server
    fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup)
    }).catch(err => console.error("Failed to sync group:", err));
  };

  const handleJoinGroup = (code: string) => {
    const group = groups.find(g => g.inviteCode === code);
    if (!group) {
      addToast("Invalid invite code", "error");
      return;
    }
    
    if (group.members.some(m => m.username === userProfile.username)) {
      addToast("You are already a member of this group", "info");
      return;
    }

    const newMember = {
      userId: session?.user.id || "me",
      username: userProfile.username,
      avatarSeed: userProfile.avatarSeed,
      role: "member" as const,
      joinedAt: new Date().toISOString(),
      totalVolume: 0
    };

    const updatedGroups = groups.map(g => {
      if (g.inviteCode === code) {
        return {
          ...g,
          members: [...g.members, newMember]
        };
      }
      return g;
    });
    
    setGroups(updatedGroups);
    addToast(`Joined "${group.name}"!`, "success");

    // Sync join to server
    fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: group.id,
        ...newMember
      })
    }).catch(err => console.error("Failed to sync group join:", err));
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, members: g.members.filter(m => m.username !== userProfile.username) }
        : g
    ));
    addToast("You have left the group", "info");

    // Sync leave to server
    if (session?.user?.id) {
      fetch('/api/groups/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          userId: session.user.id
        })
      }).catch(err => console.error("Failed to sync group leave:", err));
    }
  };

  useEffect(() => {
    if (isInitialSyncDone && session?.user?.id && balance !== undefined) {
      fetch('/api/user/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id, balance })
      }).catch(err => console.error("Failed to sync balance:", err));
    }
  }, [balance, session?.user?.id, isInitialSyncDone]);

  useEffect(() => {
    if (isInitialSyncDone && session?.user?.id && positions.length >= 0) {
      fetch('/api/user/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, positions })
      }).catch(err => console.error("Failed to sync positions:", err));
    }
  }, [positions, session?.user?.id, isInitialSyncDone]);

  // Sync profile to server is now handled manually via updateProfile function to prevent data corruption
  
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!session?.user?.id) return;
    
    let newProfile: UserProfile | null = null;
    setUserProfile(prev => {
      newProfile = { ...prev, ...data };
      return newProfile;
    });

    // Sync to server outside of the state update to avoid side effects during render
    if (newProfile) {
      const profileToSync = newProfile as UserProfile;
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id,
          username: profileToSync.username,
          email: session.user.email,
          bio: profileToSync.bio,
          avatarSeed: profileToSync.avatarSeed,
          balance: balance,
          onboardingCompleted: profileToSync.onboardingCompleted,
          isAdmin: profileToSync.isAdmin,
          joinedDate: profileToSync.joinedDate
        })
      }).catch(err => {
        console.error("Failed to sync profile change:", err);
        addToast("Failed to save profile changes", "error");
      });
    }
  };

  const handleOnboardingComplete = async (data: Partial<UserProfile>) => {
    await updateProfile({ ...data, onboardingCompleted: true });
    addToast("Profile setup complete!", "success");
  };

  // Simulate market movement (only for active session to keep it alive)
  // REMOVED: Fake market movement simulation
  
  // Save portfolio history every 5 minutes
  useEffect(() => {
    if (!session?.user?.id || !isInitialSyncDone) return;
    
    const saveHistory = () => {
      fetch('/api/portfolio/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, balance })
      });
    };

    const interval = setInterval(saveHistory, 5 * 60 * 1000);
    saveHistory(); // Initial save
    return () => clearInterval(interval);
  }, [balance, session?.user?.id, isInitialSyncDone]);

  // Random Tax Audit
  useEffect(() => {
    const taxInterval = setInterval(() => {
      const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
      if (session?.user?.email === TAX_COLLECTOR) return; // Ministerial Immunity

      if (Math.random() > 0.95) {
        setBalance(prev => {
          if (prev > 1000) {
            const auditAmount = Math.floor(prev * 0.05);
            
            // Side effects should be outside of state updates
            // We use a timeout to defer the side effects until after the render phase
            setTimeout(() => {
              addTransaction('tax', auditAmount, "Random Wealth Tax Audit");
              addToast(`TAX AUDIT! The government seized ${auditAmount} points 😵`, "error");
            }, 0);

            return prev - auditAmount;
          }
          return prev;
        });
      }
    }, 30000);

    return () => {
      clearInterval(taxInterval);
    };
  }, [setBalance, addTransaction, addToast, session]);

  const handlePlaceOrder = async (marketId: string, side: "YES" | "NO", amount: number) => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch('/api/markets/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, marketId, side, amount })
      });
      
      if (res.ok) {
        addToast(`Order placed!`, "success");
        addXP(Math.floor(amount / 10));
        
        // Refresh user data
        const userRes = await fetch(`/api/user/${session.user.id}`);
        if (userRes.ok) {
          const data = await userRes.json();
          setBalance(data.user.balance);
          setPositions(data.positions.map((p: any) => ({
            marketId: p.market_id,
            side: p.side,
            shares: p.shares,
            avgPrice: p.avg_price
          })));
          setTransactions(data.transactions);
        }
        
        // Refresh markets
        const marketsRes = await fetch('/api/markets');
        if (marketsRes.ok) {
          setMarkets(await marketsRes.json());
        }

        setActiveTab("portfolio");
        setSelectedMarketId(null);
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to place order", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to place order", "error");
    }
  };

  const handleSellPosition = async (marketId: string, side: "YES" | "NO") => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch('/api/markets/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, marketId, side })
      });

      if (res.ok) {
        addToast("Position sold!", "success");
        
        // Refresh user data
        const userRes = await fetch(`/api/user/${session.user.id}`);
        if (userRes.ok) {
          const data = await userRes.json();
          setBalance(data.user.balance);
          setPositions(data.positions.map((p: any) => ({
            marketId: p.market_id,
            side: p.side,
            shares: p.shares,
            avgPrice: p.avg_price
          })));
          setTransactions(data.transactions);
        }

        // Refresh markets
        const marketsRes = await fetch('/api/markets');
        if (marketsRes.ok) {
          setMarkets(await marketsRes.json());
        }
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to sell position", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to sell position", "error");
    }
  };

  const handleResolveMarket = async (marketId: string, result: "YES" | "NO") => {
    if (!userProfile.isAdmin) return;

    try {
      const res = await fetch(`/api/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      });

      if (res.ok) {
        addToast(`Market resolved as ${result}!`, "success");
        
        // Refresh all data
        const [marketsRes, userRes] = await Promise.all([
          fetch('/api/markets'),
          fetch(`/api/user/${session?.user?.id}`)
        ]);

        if (marketsRes.ok) setMarkets(await marketsRes.json());
        if (userRes.ok) {
          const data = await userRes.json();
          setBalance(data.user.balance);
          setPositions(data.positions.map((p: any) => ({
            marketId: p.market_id,
            side: p.side,
            shares: p.shares,
            avgPrice: p.avg_price
          })));
          setTransactions(data.transactions);
        }
      } else {
        addToast("Failed to resolve market", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to resolve market", "error");
    }
  };

  const handleCreateMarket = (newMarketData: Omit<Market, "id" | "volume" | "liquidity" | "history" | "yesPrice" | "comments">) => {
    const newMarket: Market = {
      ...newMarketData,
      id: `custom-${Date.now()}`,
      yesPrice: 0.5,
      volume: 0,
      liquidity: 0,
      history: [{ date: new Date().toISOString().split("T")[0], price: 0.5 }],
      comments: []
    };
    
    setMarkets(prev => [newMarket, ...prev]);
    addToast("Party created successfully!", "success");

    // Sync market to server
    fetch('/api/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMarket)
    }).catch(err => console.error("Failed to sync market:", err));
  };

  const handleDeposit = (amount: number) => {
    const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
    const isMinister = session?.user?.email === TAX_COLLECTOR;
    
    const taxAmount = isMinister ? 0 : Math.floor(amount * 0.15); // 15% Deposit Tax
    const netAmount = amount - taxAmount;
    
    setBalance(prev => prev + netAmount);
    addTransaction('deposit', netAmount);
    addXP(Math.floor(amount / 50));
    if (taxAmount > 0) {
      addTransaction('tax', taxAmount, "Deposit Processing Tax");
      addToast(`Deposited ${netAmount} pts (Paid ${taxAmount} pts in tax 😈)`, "info");
    } else if (isMinister) {
      addToast(`Successfully added ${amount} points (Ministerial Immunity: 0% tax) 👑`, "success");
    } else {
      addToast(`Successfully added ${amount} points`, "success");
    }
  };

  const handleWithdraw = (amount: number) => {
    if (amount > balance) {
      addToast("Insufficient balance", "error");
      return;
    }
    const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
    const isMinister = session?.user?.email === TAX_COLLECTOR;
    
    const taxAmount = isMinister ? 0 : Math.floor(amount * 0.20); // 20% Withdrawal Tax
    const netAmount = amount - taxAmount;
    
    setBalance(prev => prev - amount);
    addTransaction('withdraw', netAmount);
    addXP(Math.floor(amount / 100));
    if (taxAmount > 0) {
      addTransaction('tax', taxAmount, "Capital Gains Tax");
      addToast(`Redeemed ${netAmount} points (Tax Man took ${taxAmount} pts 😭)`, "error");
    } else if (isMinister) {
      addToast(`Redeemed ${amount} points (Ministerial Immunity: 0% tax) 👑`, "success");
    }
  };

  const toggleWatchlist = (marketId: string) => {
    setWatchlist(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
    if (!watchlist.includes(marketId)) {
      addToast("Added to watchlist", "success");
    } else {
      addToast("Removed from watchlist", "info");
    }
  };

  const handleAddComment = (marketId: string, text: string, media?: { type: 'gif' | 'image', url: string }) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: session?.user?.id || userProfile.email,
      username: userProfile.username,
      avatarSeed: userProfile.avatarSeed,
      text,
      timestamp: new Date().toISOString(),
      media,
      likes: 0
    };

    setMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return { ...m, comments: [newComment, ...(m.comments || [])] };
      }
      return m;
    }));
    addXP(15);
    addToast("Comment posted!", "success");

    // Sync comment to server
    fetch('/api/markets/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newComment,
        marketId
      })
    }).catch(err => console.error("Failed to sync comment:", err));
  };

  const handleDeleteComment = (marketId: string, commentId: string) => {
    setMarkets(prev => prev.map(m => {
      if (m.id === marketId) {
        return { ...m, comments: (m.comments || []).filter(c => c.id !== commentId) };
      }
      return m;
    }));
    addToast("Comment deleted", "info");

    // Sync delete to server
    fetch(`/api/markets/comment/${commentId}`, {
      method: 'DELETE'
    }).catch(err => console.error("Failed to sync comment deletion:", err));
  };

  const handleToggleWatchlist = (marketId: string) => {
    setWatchlist(prev => {
      if (prev.includes(marketId)) {
        return prev.filter(id => id !== marketId);
      } else {
        return [...prev, marketId];
      }
    });
  };

  const filteredMarkets = markets.filter(m => {
    let matchesCategory = true;
    if (selectedCategory === "All") {
      matchesCategory = true;
    } else if (selectedCategory === "Watchlist") {
      matchesCategory = watchlist.includes(m.id);
    } else if (selectedCategory === "Ending Soon") {
      matchesCategory = new Date(m.endDate) > new Date();
    } else {
      matchesCategory = m.category === selectedCategory;
    }

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = m.title.toLowerCase().includes(searchLower) || 
                          m.description.toLowerCase().includes(searchLower) ||
                          m.keywords?.some(k => k.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (selectedCategory === "Ending Soon") {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    return 0;
  });

  const [quests, setQuests] = useState([
    {
      id: "q1",
      title: "Market Mover",
      description: "Place 3 bets on different markets",
      reward: 150,
      progress: 1,
      total: 3,
      completed: false,
      icon: <Activity className="w-5 h-5" />
    },
    {
      id: "q2",
      title: "Diamond Hands",
      description: "Hold a position for 24 hours",
      reward: 300,
      progress: 1,
      total: 1,
      completed: true,
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: "q3",
      title: "Community Member",
      description: "Join your first group",
      reward: 50,
      progress: 0,
      total: 1,
      completed: false,
      icon: <Users className="w-5 h-5" />
    }
  ]);

  const handleClaimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (quest && quest.completed) {
      addXP(quest.reward);
      addToast(`Quest claimed! +${quest.reward} XP`, "success");
      setQuests(prev => prev.filter(q => q.id !== questId));
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#F59E0B']
      });
    }
  };

  const RightSidebar = (
    <>
      <div className="mb-6">
        <Quests quests={quests} onClaim={handleClaimQuest} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Trending
          </h3>
          <button 
            onClick={() => {
              setActiveTab("markets");
              setSelectedCategory("All");
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {markets.slice(0, 3).map((m, i) => (
            <div key={m.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setSelectedMarketId(m.id)}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{m.title}</p>
                  <p className="text-xs text-gray-400">{formatPercent(m.yesPrice)} chance</p>
                </div>
              </div>
              <div className={cn("text-xs font-bold flex items-center", m.yesPrice > 0.5 ? "text-emerald-600" : "text-red-600")}>
                {m.yesPrice > 0.5 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {/* Removed fake percentage */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-lg mb-1">Refer a friend</h3>
          <p className="text-emerald-100 text-sm mb-4">Get 500 points when they place their first bet.</p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText("https://kalshiclone.app/refer/USER123");
              addToast("Referral link copied!", "success");
            }}
            className="w-full py-2 bg-white text-emerald-900 font-bold rounded-lg text-sm hover:bg-emerald-50 transition-colors"
          >
            Invite Friends
          </button>
        </div>
        <div className="absolute top-0 right-0 p-16 bg-white opacity-5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
      </div>
    </>
  );

  const renderContent = () => {
    if (selectedMarketId) {
      const market = markets.find(m => m.id === selectedMarketId);
      if (!market) return <div>Market not found</div>;
      return (
        <MarketDetail 
          market={market} 
          onBack={() => setSelectedMarketId(null)}
          onPlaceOrder={handlePlaceOrder}
          balance={balance}
          isWatched={watchlist.includes(market.id)}
          onToggleWatch={() => toggleWatchlist(market.id)}
          userProfile={userProfile}
          onAddComment={(text, media) => handleAddComment(market.id, text, media)}
          onDeleteComment={(commentId) => handleDeleteComment(market.id, commentId)}
          onVoteSentiment={handleVoteSentiment}
          onResolve={handleResolveMarket}
        />
      );
    }

    switch (activeTab) {
      case "markets":
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <AnimatePresence mode="popLayout">
                  {["All", "Watchlist", "Ending Soon", "Politics", "Economics", "Science", "Crypto", "Culture"].map((cat) => (
                    <motion.button 
                      layout
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={cn(
                        "px-4 py-2 text-sm font-bold rounded-full transition-colors whitespace-nowrap",
                        selectedCategory === cat 
                          ? "bg-gray-900 text-white shadow-md" 
                          : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {filteredMarkets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {markets.length === 0 ? "No parties available yet. Be the first to start one!" : "No parties found matching your criteria."}
                </p>
                {markets.length > 0 && (
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="mt-4 text-emerald-600 font-bold text-sm hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
                {markets.length === 0 && (
                   <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold mx-auto hover:bg-emerald-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Party
                  </button>
                )}
              </div>
            ) : (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredMarkets.map(market => (
                    <MarketCard 
                      key={market.id} 
                      market={market} 
                      onClick={(m) => setSelectedMarketId(m.id)} 
                      isWatchlisted={watchlist.includes(market.id)}
                      onToggleWatchlist={(e) => handleToggleWatchlist(market.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        );
      case "groups":
        return (
          <Groups 
            groups={groups} 
            onCreateGroup={handleCreateGroup} 
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            currentUser={userProfile}
          />
        );
      case "live":
        const liveMarkets = markets.filter(m => new Date(m.endDate) > new Date()).slice(0, 4);
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-red-500" />
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMarkets.map(market => (
                <MarketCard 
                  key={market.id} 
                  market={market} 
                  onClick={(m) => setSelectedMarketId(m.id)} 
                />
              ))}
            </div>
          </div>
        );
      case "social":
        const recentBets = transactions.filter(t => t.type.startsWith('bet')).slice().reverse();
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Social Feed
            </h2>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100"
            >
              {recentBets.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No recent activity to display. Start trading to see your actions here!
                </div>
              ) : (
                recentBets.map((tx) => (
                  <motion.div 
                    key={tx.id} 
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="p-4 flex gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${userProfile.avatarSeed}/100/100`} 
                        alt="User" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-bold">{userProfile.username}</span> placed a bet on <span className="font-medium text-emerald-600">{tx.marketTitle || "Unknown Market"}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        );

      case "portfolio":
        return (
          <Portfolio 
            positions={positions} 
            markets={markets} 
            onSellPosition={handleSellPosition} 
            history={portfolioHistory}
          />
        );
      case "government":
        return (
          <Government 
            userProfile={userProfile} 
            onClaimTaxes={handleClaimTaxes} 
            taxBalance={taxBalance} 
          />
        );
      case "wallet":
        return (
          <Wallet 
            balance={balance} 
            onDeposit={handleDeposit} 
            onWithdraw={handleWithdraw} 
            transactions={transactions}
            currentUser={userProfile}
            onClaimTaxes={handleClaimTaxes}
          />
        );
      case "profile":
        return (
          <Profile 
            profile={userProfile} 
            onUpdateProfile={updateProfile}
            transactions={transactions}
            stats={{
              totalBets: transactions.filter(t => t.type.startsWith('bet')).length,
              totalVolume: transactions.filter(t => t.type.startsWith('bet')).reduce((acc, t) => acc + t.amount, 0),
              winRate: transactions.filter(t => t.type === 'payout' || t.type === 'sell').length > 0 
                ? Math.round((transactions.filter(t => t.type === 'payout').length / (transactions.filter(t => t.type === 'payout' || t.type === 'sell').length || 1)) * 100)
                : 0,
              totalWins: transactions.filter(t => t.type === 'payout').length
            }}
            onClaimDaily={handleDailyClaim}
            balance={balance}
          />
        );
      case "terms":
        return <TermsOfService onBack={() => setActiveTab("markets")} />;
      default:
        return <div className="p-12 text-center text-gray-500">Coming Soon</div>;
    }
  };

  if (syncError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Issue</h2>
          <p className="text-gray-500 mb-6">{syncError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading || (session && !isInitialSyncDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!userProfile.onboardingCompleted) {
    return <OnboardingModal onComplete={handleOnboardingComplete} initialEmail={session.user.email!} />;
  }

  const userStats = {
    totalVolume: transactions.filter(t => t.type.startsWith('bet')).reduce((acc, t) => acc + t.amount, 0),
    winRate: 65, // Mocked
    rank: 42 // Mocked
  };

  return (
    <Layout 
      activeTab={selectedMarketId ? "markets" : activeTab} 
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedMarketId(null);
      }}
      balance={balance}
      rightSidebar={RightSidebar}
      onOpenCreateModal={() => setIsCreateModalOpen(true)}
      onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userProfile={userProfile}
      onLogout={signOut}

    >
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMarketId ? `market-${selectedMarketId}` : activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      
      <Leaderboard 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)}
        currentUser={userProfile}
        currentUserStats={userStats}
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateMarketModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onCreate={handleCreateMarket} 
            groups={groups}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isShortcutsOpen && (
          <ShortcutsHelp isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
