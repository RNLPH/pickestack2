***

# 🏓 PickleStack

A lightweight pickleball queue, court management, standings, and match history tracker built with **React** and **Dexie (IndexedDB)**.

PickleStack helps organize recreational pickleball sessions by managing player check-ins, court assignments, match results, statistics, and session history—all directly in the browser.

***

## ✨ Features

### 🏠 Dashboard

* Player check-in system
* Smart player queue management
* Court management
  * Add courts
  * Remove courts
* Manual player-to-court assignment
* Automatic game setup
* Queue balancing based on:
  * Games played
  * Winner/Loser bracket
  * Waiting time
* Dashboard reset option

### 🏆 Standings

* Lifetime player statistics
* Wins
* Losses
* Games Played
* Win Rate ranking
* Medal placement for top players
* Clear standings without deleting player profiles

### 📜 Match History

* Automatic match recording
* Match duration tracking
* Session grouping
* Session statistics
  * Match count
  * Player count
  * Average match duration
  * Longest match
* Best session record tracking
* Delete individual sessions
* Clear complete history

### 👥 Player Directory

* Persistent player database
* Player autocomplete
* Permanent player storage
* Delete saved players
* Prevent duplicate check-ins

### 💾 Local Persistence

Data is stored locally using:

* IndexedDB (Dexie)
* LocalStorage

No backend required.

***

## 🚀 Tech Stack

### Frontend

* React
* JavaScript
* TailwindCSS

### Storage

* Dexie.js
* IndexedDB
* LocalStorage

***

## 📊 Queue Logic

Players are prioritized using:

### 1. Games Played

Players with fewer games are prioritized.

### 2. Match Result Bracket

Priority:

```text
Winner Bracket
↓
Normal
↓
Loser Bracket
```

### 3. Waiting Time

Players waiting the longest move up the queue.

***

## 🏓 Match Flow

### Start Game

1. Select 4 players from queue
2. Players are shuffled into teams
3. Assigned to an empty court

### End Game

1. Winning team selected
2. Match saved to history
3. Statistics updated
4. Players returned to queue
5. Court becomes available

***

## 🗂 Data Stored

### Player

```json
{
  "id": "uuid",
  "name": "Player Name",
  "gamesPlayed": 0,
  "wins": 0,
  "losses": 0,
  "bracket": "normal",
  "waitingSince": 0
}
```

### Match

```json
{
  "sessionId": 1,
  "courtId": 1,
  "teamA": ["Player A", "Player B"],
  "teamB": ["Player C", "Player D"],
  "winner": "A",
  "startedAt": 0,
  "endedAt": 0
}
```

***

## 🧹 Reset Options

### Reset Dashboard

Clears:

* Waiting queue
* Active courts

Keeps:

* Player directory
* Standings
* Match history

***

### Clear Standings

Resets:

* Wins
* Losses
* Games Played
* Brackets

Keeps:

* Player directory

***

### Clear History

Removes:

* Match history
* Session history

Resets:

* Session counter

***

## 📦 Installation

```bash
git clone https://github.com/yourusername/picklestack.git

cd picklestack

npm install

npm run dev
```

***

## 🏗 Build

```bash
npm run build
```

***

## 🎯 Future Enhancements

* Dark Mode
* Court timers
* Export session reports
* Player profiles
* ELO ranking system
* Match score tracking
* Doubles partner statistics
* Cloud synchronization
* Mobile PWA support

***

## 📄 License

MIT License

***

## 👨‍💻 Author

Built as a personal project to simplify pickleball session management and player rotation.

**PickleStack v1.0** 🏓✨
