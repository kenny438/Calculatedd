import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("tax_vault.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS tax_pool (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_points INTEGER DEFAULT 0
  );
  INSERT OR IGNORE INTO tax_pool (id, total_points) VALUES (1, 0);

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    email TEXT UNIQUE,
    bio TEXT,
    avatar_seed TEXT,
    balance INTEGER DEFAULT 10000,
    onboarding_completed INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    joined_date TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    daily_streak INTEGER DEFAULT 0,
    last_login TEXT,
    referral_code TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS market_sentiment (
    market_id TEXT,
    user_id TEXT,
    sentiment TEXT,
    timestamp TEXT,
    PRIMARY KEY(market_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS portfolio_history (
    user_id TEXT,
    balance REAL,
    timestamp TEXT
  );

  CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    market_id TEXT,
    side TEXT,
    shares REAL,
    avg_price REAL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT,
    amount REAL,
    market_title TEXT,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    invite_code TEXT UNIQUE,
    created_at TEXT,
    is_private INTEGER DEFAULT 1,
    emoji TEXT,
    theme_color TEXT,
    rules TEXT,
    max_members INTEGER,
    min_bet INTEGER
  );

  CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT,
    user_id TEXT,
    username TEXT,
    avatar_seed TEXT,
    role TEXT,
    joined_at TEXT,
    total_volume REAL,
    PRIMARY KEY(group_id, user_id),
    FOREIGN KEY(group_id) REFERENCES groups(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS markets (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    category TEXT,
    end_date TEXT,
    yes_price REAL,
    volume REAL,
    liquidity REAL,
    emoji TEXT,
    theme_color TEXT,
    rules TEXT,
    image TEXT,
    status TEXT DEFAULT 'open',
    result TEXT
  );

  CREATE TABLE IF NOT EXISTS market_history (
    market_id TEXT,
    date TEXT,
    price REAL,
    FOREIGN KEY(market_id) REFERENCES markets(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    market_id TEXT,
    user_id TEXT,
    username TEXT,
    avatar_seed TEXT,
    text TEXT,
    timestamp TEXT,
    media_type TEXT,
    media_url TEXT,
    likes INTEGER DEFAULT 0,
    FOREIGN KEY(market_id) REFERENCES markets(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Market API ---
  app.get("/api/markets", (req, res) => {
    try {
      const markets = db.prepare("SELECT * FROM markets").all();
      const marketsWithDetails = markets.map((m: any) => {
        const history = db.prepare("SELECT date, price FROM market_history WHERE market_id = ? ORDER BY date ASC").all(m.id);
        const comments = db.prepare("SELECT * FROM comments WHERE market_id = ? ORDER BY timestamp DESC").all(m.id);
        return {
          ...m,
          endDate: m.end_date,
          yesPrice: m.yes_price,
          themeColor: m.theme_color,
          history,
          comments: comments.map((c: any) => ({
            ...c,
            userId: c.user_id,
            avatarSeed: c.avatar_seed,
            media: c.media_type ? { type: c.media_type, url: c.media_url } : undefined
          }))
        };
      });
      res.json(marketsWithDetails);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/markets", (req, res) => {
    const { id, title, description, category, endDate, yesPrice, volume, liquidity, emoji, themeColor, rules, image, history } = req.body;
    try {
      db.prepare(`
        INSERT INTO markets (id, title, description, category, end_date, yes_price, volume, liquidity, emoji, theme_color, rules, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description, category, endDate, yesPrice, volume, liquidity, emoji, themeColor, rules, image);
      
      if (history && history.length > 0) {
        const insertHistory = db.prepare("INSERT INTO market_history (market_id, date, price) VALUES (?, ?, ?)");
        for (const h of history) {
          insertHistory.run(id, h.date, h.price);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/markets/:id/resolve", (req, res) => {
    const { result } = req.body;
    const marketId = req.params.id;
    
    try {
      db.transaction(() => {
        // Update market status
        db.prepare("UPDATE markets SET status = 'resolved', result = ? WHERE id = ?").run(result, marketId);
        
        // Find all positions for this market
        const positions = db.prepare("SELECT * FROM positions WHERE market_id = ?").all(marketId) as any[];
        const market = db.prepare("SELECT title FROM markets WHERE id = ?").get(marketId) as any;

        const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";

        for (const pos of positions) {
          const user = db.prepare("SELECT email FROM users WHERE id = ?").get(pos.user_id) as any;
          const isMinister = user?.email === TAX_COLLECTOR;
          
          const isWinner = pos.side === result;
          if (isWinner) {
            // Payout is 1 point per share for winners
            const payout = pos.shares;
            
            // Apply winning tax (12% as per frontend logic)
            const taxAmount = isMinister ? 0 : Math.floor(payout * 0.12);
            const netPayout = payout - taxAmount;

            // Update user balance
            db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(netPayout, pos.user_id);
            
            // Record transaction
            db.prepare("INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)")
              .run(Math.random().toString(36).substr(2, 9), pos.user_id, 'deposit', netPayout, `Payout: ${market.title}`, new Date().toISOString());
            
            if (taxAmount > 0) {
              db.prepare("UPDATE tax_pool SET total_points = total_points + ? WHERE id = 1").run(taxAmount);
              db.prepare("INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)")
                .run(Math.random().toString(36).substr(2, 9), pos.user_id, 'tax', taxAmount, `Winning Tax: ${market.title}`, new Date().toISOString());
            }
          }
          // Delete the position after resolution
          db.prepare("DELETE FROM positions WHERE id = ?").run(pos.id);
        }
      })();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/markets/order", (req, res) => {
    const { userId, marketId, side, amount } = req.body;
    
    try {
      db.transaction(() => {
        const user = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId) as any;
        const market = db.prepare("SELECT * FROM markets WHERE id = ?").get(marketId) as any;
        
        if (!user || !market) throw new Error("User or Market not found");
        if (user.balance < amount) throw new Error("Insufficient balance");
        if (market.status !== 'open') throw new Error("Market is not open");

        const price = side === "YES" ? market.yes_price : (1 - market.yes_price);
        const shares = amount / price;

        // Update balance
        db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
        
        // Update volume and liquidity
        db.prepare("UPDATE markets SET volume = volume + ?, liquidity = liquidity + ? WHERE id = ?")
          .run(amount, amount * 0.1, marketId);

        // Update or Insert position
        const existingPos = db.prepare("SELECT * FROM positions WHERE user_id = ? AND market_id = ? AND side = ?")
          .get(userId, marketId, side) as any;

        if (existingPos) {
          const totalShares = existingPos.shares + shares;
          const totalCost = (existingPos.shares * existingPos.avg_price) + amount;
          const newAvgPrice = totalCost / totalShares;
          db.prepare("UPDATE positions SET shares = ?, avg_price = ? WHERE id = ?")
            .run(totalShares, newAvgPrice, existingPos.id);
        } else {
          db.prepare("INSERT INTO positions (user_id, market_id, side, shares, avg_price) VALUES (?, ?, ?, ?, ?)")
            .run(userId, marketId, side, shares, price);
        }

        // Record transaction
        db.prepare("INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)")
          .run(Math.random().toString(36).substr(2, 9), userId, side === "YES" ? 'bet_yes' : 'bet_no', amount, market.title, new Date().toISOString());
      })();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/markets/sell", (req, res) => {
    const { userId, marketId, side } = req.body;
    
    try {
      db.transaction(() => {
        const position = db.prepare("SELECT * FROM positions WHERE user_id = ? AND market_id = ? AND side = ?")
          .get(userId, marketId, side) as any;
        const market = db.prepare("SELECT * FROM markets WHERE id = ?").get(marketId) as any;
        
        if (!position || !market) throw new Error("Position or Market not found");

        const currentPrice = side === "YES" ? market.yes_price : (1 - market.yes_price);
        const value = position.shares * currentPrice;
        const cost = position.shares * position.avg_price;
        
        const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";
        const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as any;
        const isMinister = user?.email === TAX_COLLECTOR;
        
        let netPayout = value;
        let taxAmount = 0;

        // If current value is greater than cost, it's a win
        if (value > cost) {
          const profit = value - cost;
          taxAmount = isMinister ? 0 : Math.floor(profit * 0.12); // 12% tax on profit
          netPayout = value - taxAmount;
        }

        // Update balance
        db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(netPayout, userId);
        
        if (taxAmount > 0) {
          db.prepare("UPDATE tax_pool SET total_points = total_points + ? WHERE id = 1").run(taxAmount);
          db.prepare("INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)")
            .run(Math.random().toString(36).substr(2, 9), userId, 'tax', taxAmount, `Profit Tax: ${market.title}`, new Date().toISOString());
        }

        // Record transaction
        db.prepare("INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)")
          .run(Math.random().toString(36).substr(2, 9), userId, 'sell', netPayout, market.title, new Date().toISOString());

        // Delete position
        db.prepare("DELETE FROM positions WHERE id = ?").run(position.id);
      })();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/markets/comment", (req, res) => {
    const { id, marketId, userId, username, avatarSeed, text, timestamp, media } = req.body;
    try {
      db.prepare(`
        INSERT INTO comments (id, market_id, user_id, username, avatar_seed, text, timestamp, media_type, media_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, marketId, userId, username, avatarSeed, text, timestamp, media?.type, media?.url);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.delete("/api/markets/comment/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM comments WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Group API ---
  app.get("/api/groups", (req, res) => {
    try {
      const groups = db.prepare("SELECT * FROM groups").all();
      const groupsWithMembers = groups.map((g: any) => {
        const members = db.prepare("SELECT * FROM group_members WHERE group_id = ?").all(g.id);
        return {
          ...g,
          createdAt: g.created_at,
          isPrivate: g.is_private === 1,
          themeColor: g.theme_color,
          maxMembers: g.max_members,
          minBet: g.min_bet,
          inviteCode: g.invite_code,
          members: members.map((m: any) => ({
            ...m,
            userId: m.user_id,
            avatarSeed: m.avatar_seed,
            joinedAt: m.joined_at,
            totalVolume: m.total_volume
          }))
        };
      });
      res.json(groupsWithMembers);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/groups", (req, res) => {
    const { id, name, description, inviteCode, createdAt, isPrivate, emoji, themeColor, rules, maxMembers, minBet, members } = req.body;
    try {
      db.prepare(`
        INSERT INTO groups (id, name, description, invite_code, created_at, is_private, emoji, theme_color, rules, max_members, min_bet)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, description, inviteCode, createdAt, isPrivate ? 1 : 0, emoji, themeColor, rules, maxMembers, minBet);
      
      if (members && members.length > 0) {
        const insertMember = db.prepare("INSERT INTO group_members (group_id, user_id, username, avatar_seed, role, joined_at, total_volume) VALUES (?, ?, ?, ?, ?, ?, ?)");
        for (const m of members) {
          insertMember.run(id, m.userId, m.username, m.avatarSeed, m.role, m.joinedAt, m.totalVolume);
        }
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/groups/join", (req, res) => {
    const { groupId, userId, username, avatarSeed, role, joinedAt, totalVolume } = req.body;
    try {
      db.prepare(`
        INSERT INTO group_members (group_id, user_id, username, avatar_seed, role, joined_at, total_volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(groupId, userId, username, avatarSeed, role, joinedAt, totalVolume);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/groups/leave", (req, res) => {
    const { groupId, userId } = req.body;
    try {
      db.prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?").run(groupId, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- User API ---
  app.get("/api/user/:id", (req, res) => {
    try {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const positions = db.prepare("SELECT * FROM positions WHERE user_id = ?").all(req.params.id);
      const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(req.params.id);
      
      res.json({ user, positions, transactions });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/user/sync", (req, res) => {
    const { id, username, email, bio, avatarSeed, balance, onboardingCompleted, isAdmin, joinedDate } = req.body;
    try {
      db.prepare(`
        INSERT INTO users (id, username, email, bio, avatar_seed, balance, onboarding_completed, is_admin, joined_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          username = excluded.username,
          bio = excluded.bio,
          avatar_seed = excluded.avatar_seed,
          balance = excluded.balance,
          onboarding_completed = excluded.onboarding_completed,
          is_admin = excluded.is_admin
      `).run(id, username, email, bio, avatarSeed, balance, onboardingCompleted ? 1 : 0, isAdmin ? 1 : 0, joinedDate);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/user/balance", (req, res) => {
    const { id, balance } = req.body;
    try {
      db.prepare("UPDATE users SET balance = ? WHERE id = ?").run(balance, id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/user/positions", (req, res) => {
    const { userId, positions } = req.body;
    try {
      const deleteStmt = db.prepare("DELETE FROM positions WHERE user_id = ?");
      const insertStmt = db.prepare("INSERT INTO positions (user_id, market_id, side, shares, avg_price) VALUES (?, ?, ?, ?, ?)");
      
      const transaction = db.transaction((userId, positions) => {
        deleteStmt.run(userId);
        for (const pos of positions) {
          insertStmt.run(userId, pos.marketId, pos.side, pos.shares, pos.avgPrice);
        }
      });
      
      transaction(userId, positions);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/user/transactions", (req, res) => {
    const { userId, transaction } = req.body;
    try {
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, market_title, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(transaction.id, userId, transaction.type, transaction.amount, transaction.marketTitle, transaction.date);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Tax API ---
  app.post("/api/tax/report", (req, res) => {
    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    try {
      db.prepare("UPDATE tax_pool SET total_points = total_points + ? WHERE id = 1").run(amount);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/tax/balance", (req, res) => {
    const { email } = req.query;
    const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";

    if (email !== TAX_COLLECTOR) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const row = db.prepare("SELECT total_points FROM tax_pool WHERE id = 1").get() as { total_points: number };
      res.json({ balance: row.total_points });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/tax/claim", (req, res) => {
    const { email } = req.body;
    const TAX_COLLECTOR = "mgethmikadinujakumarathunga@gmail.com";

    if (email !== TAX_COLLECTOR) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const row = db.prepare("SELECT total_points FROM tax_pool WHERE id = 1").get() as { total_points: number };
      const amount = row.total_points;

      if (amount <= 0) {
        return res.status(400).json({ error: "No points to claim" });
      }

      db.prepare("UPDATE tax_pool SET total_points = 0 WHERE id = 1").run();
      res.json({ amount });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Arena Sessions
  app.get('/api/arena/sessions', (req, res) => {
    const sessions = db.prepare('SELECT * FROM arena_sessions WHERE status = "live" ORDER BY created_at DESC').all();
    res.json(sessions);
  });

  app.post('/api/arena/sessions', (req, res) => {
    const { id, title, video_url, sport, created_by } = req.body;
    db.prepare('INSERT INTO arena_sessions (id, title, video_url, sport, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, title, video_url, sport, created_by, new Date().toISOString());
    res.json({ success: true });
  });

  app.get('/api/arena/sessions/:id/challenges', (req, res) => {
    const challenges = db.prepare('SELECT * FROM arena_challenges WHERE session_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(challenges.map((c: any) => ({ ...c, options: JSON.parse(c.options) })));
  });

  app.post('/api/arena/challenges', (req, res) => {
    const { id, session_id, created_by, username, question, options, points, expires_at } = req.body;
    db.prepare('INSERT INTO arena_challenges (id, session_id, created_by, username, question, options, points, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, session_id, created_by, username, question, JSON.stringify(options), points, expires_at, new Date().toISOString());
    res.json({ success: true });
  });

  app.post('/api/arena/predict', (req, res) => {
    const { challenge_id, user_id, prediction } = req.body;
    db.prepare('INSERT OR REPLACE INTO arena_predictions (challenge_id, user_id, prediction) VALUES (?, ?, ?)')
      .run(challenge_id, user_id, prediction);
    res.json({ success: true });
  });

  app.post('/api/arena/challenges/:id/resolve', (req, res) => {
    const { result } = req.body;
    const challengeId = req.params.id;
    
    db.transaction(() => {
      db.prepare('UPDATE arena_challenges SET result = ? WHERE id = ?').run(result, challengeId);
      
      const predictions = db.prepare('SELECT * FROM arena_predictions WHERE challenge_id = ?').all(challengeId);
      const challenge = db.prepare('SELECT points FROM arena_challenges WHERE id = ?').get(challengeId) as any;

      for (const pred of predictions) {
        const isCorrect = pred.prediction === result ? 1 : 0;
        const pointsAwarded = isCorrect ? challenge.points : 0;
        
        db.prepare('UPDATE arena_predictions SET is_correct = ?, points_awarded = ? WHERE challenge_id = ? AND user_id = ?')
          .run(isCorrect, pointsAwarded, challengeId, pred.user_id);
        
        if (isCorrect) {
          db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(pointsAwarded, pred.user_id);
          db.prepare('INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)')
            .run(Math.random().toString(36).substr(2, 9), pred.user_id, 'deposit', pointsAwarded, `Correct Arena Prediction`, new Date().toISOString());
        }
      }
    })();
    
    res.json({ success: true });
  });

  // --- Sentiment API ---
  app.get("/api/sentiment/:marketId", (req, res) => {
    try {
      const counts = db.prepare(`
        SELECT sentiment, COUNT(*) as count 
        FROM market_sentiment 
        WHERE market_id = ? 
        GROUP BY sentiment
      `).all(req.params.marketId);
      res.json(counts);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/sentiment", (req, res) => {
    const { marketId, userId, sentiment } = req.body;
    try {
      db.prepare(`
        INSERT INTO market_sentiment (market_id, user_id, sentiment, timestamp)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(market_id, user_id) DO UPDATE SET sentiment = excluded.sentiment, timestamp = excluded.timestamp
      `).run(marketId, userId, sentiment, new Date().toISOString());
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Portfolio History API ---
  app.get("/api/portfolio/history/:userId", (req, res) => {
    try {
      const history = db.prepare("SELECT * FROM portfolio_history WHERE user_id = ? ORDER BY timestamp ASC").all(req.params.userId);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/portfolio/history", (req, res) => {
    const { userId, balance } = req.body;
    try {
      db.prepare("INSERT INTO portfolio_history (user_id, balance, timestamp) VALUES (?, ?, ?)").run(userId, balance, new Date().toISOString());
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Daily Rewards & XP API ---
  app.post("/api/user/daily-claim", (req, res) => {
    const { userId } = req.body;
    try {
      const user = db.prepare("SELECT last_login, daily_streak FROM users WHERE id = ?").get(userId) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const now = new Date();
      const lastLogin = user.last_login ? new Date(user.last_login) : null;
      
      let newStreak = 1;
      if (lastLogin) {
        const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = user.daily_streak + 1;
        } else if (diffDays === 0) {
          return res.status(400).json({ error: "Already claimed today" });
        }
      }

      const reward = 100 + (newStreak * 10);
      db.prepare("UPDATE users SET balance = balance + ?, daily_streak = ?, last_login = ?, xp = xp + 50 WHERE id = ?")
        .run(reward, newStreak, now.toISOString(), userId);
      
      db.prepare("INSERT INTO transactions (id, user_id, type, amount, market_title, date) VALUES (?, ?, ?, ?, ?, ?)")
        .run(Math.random().toString(36).substr(2, 9), userId, 'deposit', reward, `Daily Reward (Streak: ${newStreak})`, now.toISOString());

      res.json({ success: true, reward, streak: newStreak });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/user/xp", (req, res) => {
    const { userId, xp } = req.body;
    try {
      db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(xp, userId);
      
      // Check for level up
      const user = db.prepare("SELECT xp, level FROM users WHERE id = ?").get(userId) as any;
      const nextLevelXp = user.level * 1000;
      if (user.xp >= nextLevelXp) {
        db.prepare("UPDATE users SET level = level + 1 WHERE id = ?").run(userId);
        res.json({ success: true, leveledUp: true, newLevel: user.level + 1 });
      } else {
        res.json({ success: true, leveledUp: false });
      }
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BUSSIN SERVER RUNNING ON http://localhost:${PORT}`);
  });
}

startServer();
