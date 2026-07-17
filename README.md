Here's an updated version of your README that reflects the current state of **PickleStack v1.1**:

````md
# 🏓 PickleStack

A pickleball session management system built with **React** and **Dexie (IndexedDB)**.

PickleStack helps organize recreational pickleball sessions by managing player check-ins, court assignments, match results, attendance, statistics, session history, and exports, all directly in the browser.

***

## ✨ Features

### 🏠 Dashboard

* Player check-in system
* Smart player queue management
* Priority player support ⭐
* Court management
  * Add courts
  * Remove courts
* Manual player-to-court assignment
* Automatic game setup
* Drag & Drop support
  * Queue → Court
  * Court → Queue
  * Court ↔ Court
  * Queue ↔ Court swapping
* Live court timers
* Queue balancing based on:
  * Priority status
  * Games played
  * Winner/Loser bracket
  * Waiting time
* Clear active courts and queue

### 🏆 Standings

* Lifetime player statistics
* Wins
* Losses
* Games Played
* Win Rate ranking
* Current win streak
* Best win streak
* Medal placement for top players
* Standings history snapshots per session
* Clear standings without deleting player profiles
* CSV export

### 👥 Attendance

* Automatic attendance tracking
* Attendance leaderboard
* Attendance Champion tracking 👑
* Attendance percentage calculation
* Session attendance history
* Historical attendance review
* Reset attendance records
* CSV export

### 📜 Match History

* Automatic match recording
* Match duration tracking
* Match winner editing
* Session grouping
* Session statistics
  * Match count
  * Player count
  * Average match duration
  * Longest match
* Best session record tracking
* Historical session review
* Delete individual sessions
* Clear complete history
* CSV export

### 📚 Session Management

* Session numbering
* New Session workflow
* Historical session preservation
* Attendance history snapshots
* Match history snapshots
* Standings history snapshots
* Prevent session changes while games are active

### 👥 Player Directory

* Persistent player database
* Player autocomplete
* Permanent player storage
* Delete saved players
* Prevent duplicate check-ins
* Priority status persistence

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

### 1. Priority Players

Priority players are always moved ahead of non-priority players.

### 2. Games Played

Players with fewer games are prioritized.

### 3. Match Result Bracket

Priority:

```text
Winner Bracket
↓
Normal
↓
Loser Bracket
````

### 4. Waiting Time

Players waiting the longest move up the queue.

***

## 🏓 Match Flow

### Start Game

1. Select 4 players from the queue
2. Players are shuffled into teams
3. Assigned to an empty court
4. Court timer starts automatically

### End Game

1. Winning team selected
2. Match saved to history
3. Statistics updated
4. Players returned to queue
5. Court becomes available
6. Court timer stops

***

## 🗂 Data Stored

### Player

```json
{
  "id": "uuid",
  "name": "Player Name",
  "priority": false,
  "gamesPlayed": 0,
  "wins": 0,
  "losses": 0,
  "currentStreak": 0,
  "bestStreak": 0,
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

### 🧹 Clear Courts & Queue

Clears:

* Waiting queue
* Active courts
* Court timers

Keeps:

* Player directory
* Attendance
* Standings
* Match history
* Session history

***

### ➡️ New Session

Creates a new session while preserving:

* Match history
* Attendance history
* Standings history

Resets:

* Queue
* Courts
* Current session statistics

***

### 🏆 Clear Standings

Resets:

* Wins
* Losses
* Games Played
* Current streak
* Best streak
* Brackets

Keeps:

* Player directory

***

### ☢️ Factory Reset

Permanently removes:

* Player directory
* Attendance records
* Match history
* Standings history
* Session history
* Active courts
* Queue

Returns the application to a fresh installation state.

***

## 📤 Export Features

* Export Standings CSV
* Export Attendance CSV
* Export Match History CSV

***

## 📱 Install on Phone

### Android

Chrome → Install App

### iPhone

Safari → Share → Add to Home Screen

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

* Undo Last Match
* King of the Court Mode
* Match Scoring
* ELO Ranking System
* Doubles Partner Statistics
* Cloud Synchronization
* Multi-Device Support
* Dark Mode

***

## 📄 License

MIT License

***

## 👨‍💻 Author

**RNL**

Built as a personal project to simplify pickleball session management and player rotation.

**PickleStack v1.1** 🏓✨

## 🚀 Version 1.1 Highlights

✅ Priority Players

✅ Drag & Drop Court Management

✅ Queue ↔ Court Swapping

✅ Court ↔ Court Swapping

✅ Live Court Timers

✅ Attendance Tracking

✅ Attendance History

✅ Attendance Champion

✅ Standings History

✅ Match History by Session

✅ Match Winner Editing

✅ Current & Best Win Streaks

✅ Session Management

✅ CSV Export Functions

✅ Persistent Player Directory

✅ Factory Reset

✅ Automatic Queue Balancing

✅ Local Persistence with IndexedDB & LocalStorage



