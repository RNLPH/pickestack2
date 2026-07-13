import { useEffect, useRef, useState } from "react";
import { getDirectory, saveDirectoryPlayer, deleteDirectoryPlayer, } from "./db/directoryService";
import { getPlayers, savePlayers } from "./db/playerService";
import { saveMatch, getMatches, deleteMatchesBySession, } from "./db/matchService";

const APP_VERSION = "1.0.0";

const STORAGE_KEYS = {
  PLAYERS: "picklestack_players",
  COURTS: "picklestack_courts",
};

const DEFAULT_COURTS = [
  { id: 1, players: [] },
  { id: 2, players: [] },
];




export default function App() {

  // ===== REFS =====
  const inputRef = useRef(null);

  // ===== UI STATE =====
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // ===== LOAD MATCHES =====
  useEffect(() => {
  async function loadMatches() {
    const savedMatches =
      await getMatches();

    setMatches(savedMatches);
  }

  loadMatches();
}, []);

  const [directory, setDirectory] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // ===== LOAD DIRECTORY =====
  useEffect(() => {
  async function loadDirectory() {
    const players =
      await getDirectory();

    setDirectory(players);
  }

  loadDirectory();
}, []);

  const [selectedCourt, setSelectedCourt] =
  useState({});



// ===== DATA STATE =====

const [players, setPlayers] = useState([]);
const [playersLoaded, setPlayersLoaded] =
  useState(false);

  // ===== LOAD PLAYERS =====
useEffect(() => {
  async function loadPlayers() {
    const storedPlayers =
      await getPlayers();

   // console.log("Loaded players:", storedPlayers);Show more lines

    setPlayers(storedPlayers);
    setPlayersLoaded(true);
  }

  loadPlayers();
}, []);


  const [courts, setCourts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURTS);
    return saved ? JSON.parse(saved) : DEFAULT_COURTS;
  });

// ===== SAVE PLAYERS =====
useEffect(() => {
  if (!playersLoaded) return;


  async function persistPlayers() {
    await savePlayers(players);
  }

  persistPlayers();

}, [
  players,
  playersLoaded,
]);

// ===== SAVE COURTS =====
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.COURTS,
      JSON.stringify(courts)
    );
  }, [courts]);

  // ===== PLAYER SORTING =====
const sortPlayers = (playerList) => {
  return [...playerList].sort((a, b) => {

    // Priority 1 - Lowest games played
    if (a.gamesPlayed !== b.gamesPlayed) {
      return a.gamesPlayed - b.gamesPlayed;
    }

    // Priority 2 - Winners before losers
    if (
      a.bracket === "winner" &&
      b.bracket === "loser"
    ) {
      return -1;
    }

    if (
      a.bracket === "loser" &&
      b.bracket === "winner"
    ) {
      return 1;
    }

    // Priority 3 - Waiting longest
    return a.waitingSince - b.waitingSince;
  });
};

// ===== PLAYER SHUFFLING =====
const shufflePlayers = (playerList) => {
  const shuffled = [...playerList];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};

// ===== RELATIVE TIME =====
const getRelativeTime = (timestamp) => {
  const seconds = Math.floor(
    (Date.now() - timestamp) / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes !== 1 ? "s" : ""
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours !== 1 ? "s" : ""
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days} day${
    days !== 1 ? "s" : ""
  } ago`;
};

// ===== PLAYER ACTIONS =====
 const addPlayer = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a player name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Player name must be at least 2 characters.");
      return;
    }

    if (trimmedName.length > 20) {
      setError("Player name cannot exceed 20 characters.");
      return;
    }

    const validName = /^[a-zA-Z0-9\s]+$/;

    if (!validName.test(trimmedName)) {
      setError("Only letters, numbers and spaces are allowed.");
      return;
    }

    const existsInQueue = players.some(
      (player) =>
        player.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const existsInCourts = courts.some((court) =>
      court.players.some(
        (player) =>
          player.name.toLowerCase() === trimmedName.toLowerCase()
      )
    );

    if (existsInQueue || existsInCourts) {
      setError(`"${trimmedName}" is already checked in.`);
      return;
    }
    const existingDirectoryPlayer =
  directory.find(
    (player) =>
      player.name.toLowerCase() ===
      trimmedName.toLowerCase()
  );

let newPlayer;

if (existingDirectoryPlayer) {
  newPlayer = {
    ...existingDirectoryPlayer,
    waitingSince: Date.now(),
  };
} else {
  newPlayer = {
    id: crypto.randomUUID(),
    name: trimmedName,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    bracket: "normal",
    waitingSince: Date.now(),
  };

  await saveDirectoryPlayer(newPlayer);

  setDirectory((prev) => [
    ...prev,
    newPlayer,
  ]);
}

setPlayers((prev) => [
  ...prev,
  newPlayer,
]);

    setName("");
    setError("");

    inputRef.current?.focus();
  };

const removePlayer = (id) => {
  const player = players.find(
    (p) => p.id === id
  );

  if (!player) return;

  if (
    !window.confirm(
      `Remove ${player.name} from the waiting queue?`
    )
  ) {
    return;
  }

  setPlayers((prev) =>
    prev.filter((player) => player.id !== id)
  );
};

// ===== COURT ACTIONS =====
  const addCourt = () => {
    setCourts((prev) => {
      const nextId =
        Math.max(...prev.map((court) => court.id), 0) + 1;

      return [
        ...prev,
        {
          id: nextId,
          players: [],
        },
      ];
    });
  };

const removeCourtPlayer = (courtId, playerId) => {
  const court = courts.find(
    (c) => c.id === courtId
  );

  if (!court) return;

  const player = court.players.find(
    (p) => p.id === playerId
  );

  if (!player) return;

  if (
    !window.confirm(
      `Remove ${player.name} from the court?`
    )
  ) {
    return;
  }

  setPlayers((prev) =>
    sortPlayers([
      ...prev,
      {
        ...player,
        waitingSince: Date.now(),
      },
    ])
  );

  setCourts((prev) =>
    prev.map((court) =>
      court.id === courtId
        ? {
            ...court,
            players: court.players.filter(
              (p) => p.id !== playerId
            ),
          }
        : court
    )
  );
};

const addPlayerToCourt = (
  playerId,
  courtId
) => {
  const player = players.find(
    (p) => p.id === playerId
  );

  if (!player) return;

  const court = courts.find(
    (c) => c.id === Number(courtId)
  );

  if (!court) return;

 if (court.players.length >= 4) {
  alert("Court is already full.");
  return;
}

if (
  !window.confirm(
    `Add ${player.name} to Court ${court.id}?`
  )
) {
  return;
}

  setCourts((prev) =>
    prev.map((court) =>
      court.id === Number(courtId)
        ? {
            ...court,
            players: [
              ...court.players,
              player,
            ],
          }
        : court
    )
  );

  setPlayers((prev) =>
    prev.filter(
      (p) => p.id !== playerId
    )
  );
};

  const removeCourt = () => {
    if (courts.length <= 1) return;

    const lastCourt = courts[courts.length - 1];

    if (lastCourt.players.length > 0) {
      setPlayers((prev) => [
        ...prev,
        ...lastCourt.players,
      ]);
    }

    setCourts((prev) => prev.slice(0, -1));
  };

  // ===== MATCH ACTIONS =====
const assignPlayers = () => {
  const emptyCourt = courts.find(
    (court) => court.players.length === 0
  );

  if (!emptyCourt) {
    alert("No empty courts available.");
    return;
  }

  if (players.length < 4) {
    alert(
      "Need at least 4 waiting players."
    );
    return;
  }

  const sorted = sortPlayers(players);

  const selectedPlayers = sorted.slice(0, 4);

  const randomizedTeams =
    shufflePlayers(selectedPlayers);

  setCourts((prev) =>
    prev.map((court) =>
      court.id === emptyCourt.id
        ? {
            ...court,
            players: randomizedTeams,
          }
        : court
    )
  );

  setPlayers(sorted.slice(4));
};

const endGame = async (
  courtId,
  winningTeam
) => {
  if (players.length < 4) {
    alert(
      "You need at least 4 players waiting in the queue before ending a game."
    );
    return;
  }

  const court = courts.find(
    (c) => c.id === courtId
  );

  if (!court) return;

  const matchRecord = {
  date: Date.now(),
  courtId,

  teamA: court.players
    .slice(0, 2)
    .map((p) => p.name),

  teamB: court.players
    .slice(2, 4)
    .map((p) => p.name),

  winner: winningTeam,
};

await saveMatch(matchRecord);

setMatches((prev) => [
  matchRecord,
  ...prev,
]);

  const returningPlayers = court.players.map(
    (player, index) => {
      const isTeamA = index < 2;

      const won =
        (winningTeam === "A" && isTeamA) ||
        (winningTeam === "B" && !isTeamA);

    return {
  ...player,
  gamesPlayed: player.gamesPlayed + 1,
  wins:
    (player.wins || 0) +
    (won ? 1 : 0),
  losses:
    (player.losses || 0) +
    (won ? 0 : 1),
  bracket: won ? "winner" : "loser",
  waitingSince: Date.now(),
};
    }
  );

  setPlayers((prev) =>
    sortPlayers([
      ...prev,
      ...returningPlayers,
    ])
  );

  setCourts((prev) =>
    prev.map((court) =>
      court.id === courtId
        ? {
            ...court,
            players: [],
          }
        : court
    )
  );
};

// ===== SESSION ACTIONS =====
const resetAll = () => {
  const confirmed = window.confirm(
    "Start a new session?"
  );

  if (!confirmed) return;

  localStorage.removeItem(
    STORAGE_KEYS.COURTS
  );

  setPlayers([]);
  setCourts(DEFAULT_COURTS);

  setName("");
  setError("");
};


// ===== DERIVED DATA =====

const sortedPlayers = sortPlayers(players);
const matchingPlayers =
  name.trim().length > 0
    ? directory
        .filter((player) => {
          const playerName =
            player.name.toLowerCase();

          const searchName =
            name.toLowerCase();

          return (
            playerName.includes(searchName) &&
            playerName !== searchName
          );
        })
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        )
        .slice(0, 5)
    : [];

const activePlayers = courts.reduce(
  (count, court) => count + court.players.length,
  0
);

const totalPlayers =
  players.length + activePlayers;

const totalGamesPlayed =
  [...players, ...courts.flatMap(c => c.players)]
    .reduce(
      (sum, p) => sum + p.gamesPlayed,
      0
    );  

    const standings = [
  ...players,
  ...courts.flatMap((c) => c.players),
].sort((a, b) => {

  const winRateA =
    (a.wins || 0) + (a.losses || 0) > 0
      ? (a.wins || 0) /
        ((a.wins || 0) + (a.losses || 0))
      : 0;

  const winRateB =
    (b.wins || 0) + (b.losses || 0) > 0
      ? (b.wins || 0) /
        ((b.wins || 0) + (b.losses || 0))
      : 0;

  if (winRateB !== winRateA) {
    return winRateB - winRateA;
  }

  return (b.wins || 0) - (a.wins || 0);
});

  return (

    /* ===== APP CONTAINER START ===== */
    <div className="min-h-screen bg-slate-100 p-6">

     {/* ===== PAGE CONTAINER START ===== */}
      <div className="max-w-7xl mx-auto">

        {/* ===== HEADER START ===== */}
        <h1 className="text-5xl font-bold text-center mb-8">
          🏓 PickleStack
        </h1>
         {/* ===== HEADER END ===== */}

      {/* TAB NAVIGATION START */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">

      {/* ==DASHBOARD ==*/}

  <button
    onClick={() =>
      setActiveTab("dashboard")
    }
    className={`px-4 py-2 rounded ${
      activeTab === "dashboard"
        ? "bg-blue-600 text-white"
        : "bg-white"
    }`}
  >
    🏠 Dashboard
  </button>

{/* == STANDINGS ==*/}
  <button
    onClick={() =>
      setActiveTab("standings")
    }
    className={`px-4 py-2 rounded ${
      activeTab === "standings"
        ? "bg-blue-600 text-white"
        : "bg-white"
    }`}
  >
    🏆 Standings
  </button>

{/* == HISTORY ==*/}
  <button
    onClick={() =>
      setActiveTab("history")
    }
    className={`px-4 py-2 rounded ${
      activeTab === "history"
        ? "bg-blue-600 text-white"
        : "bg-white"
    }`}
  >
    📜 History
  </button>

  <button
  onClick={() =>
    alert(
`🏓 PickleStack v${APP_VERSION}

Features:
• Player Queue Management
• Court Management
• Match History
• Player Standings
• Offline Support
• Installable PWA

Built for Pickleball Session Management`
    )
  }
  className="px-4 py-2 rounded bg-white"
>
  ℹ️ About
</button>

</div>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">

         
<div className="relative flex-1">
  <input
    ref={inputRef}
    type="text"
    value={name}
    placeholder="Player Name"

    onChange={(e) => {
  setName(e.target.value);
  setError("");
  setHighlightedIndex(-1);
}}

   onKeyDown={(e) => {
  if (
    e.key === "ArrowDown"
  ) {
    e.preventDefault();

    setHighlightedIndex((prev) =>
      prev < matchingPlayers.length - 1
        ? prev + 1
        : prev
    );
  }

  else if (
    e.key === "ArrowUp"
  ) {
    e.preventDefault();

    setHighlightedIndex((prev) =>
      prev > 0
        ? prev - 1
        : 0
    );
  }

  else if (
    e.key === "Enter" &&
    highlightedIndex >= 0
  ) {
    e.preventDefault();

    const selected =
      matchingPlayers[
        highlightedIndex
      ];

    setName(selected.name);
    setHighlightedIndex(-1);
  }

  else if (e.key === "Enter") {
    addPlayer();
  }

  else if (e.key === "Escape") {
    setHighlightedIndex(-1);
  }
}}

    className="border rounded p-2 w-full"
  />

  {matchingPlayers.length > 0 &&
    name.trim() !== "" && (
      <div className="absolute bg-white border rounded shadow mt-1 w-full max-h-40 overflow-y-auto z-10">
        {matchingPlayers.map(
  (player, index) => (
  <div
    key={player.id}
    className={`flex items-center justify-between px-3 py-2 ${
  highlightedIndex === index
    ? "bg-blue-100"
    : "hover:bg-gray-100"
}`}
  >
    <button
      type="button"
      onClick={() => {
        setName(player.name);
        setError("");
        setHighlightedIndex(-1);
        inputRef.current?.focus();
      }}
      className="flex-1 text-left"
    >
      {player.name}
    </button>

    <button

      type="button"
      onClick={async (e) => {
  e.stopPropagation();

  const confirmed = window.confirm(
    `Delete ${player.name} permanently?`
  );

  if (!confirmed) return;

  const isActive =
    players.some(
      (p) => p.id === player.id
    ) ||
    courts.some((court) =>
      court.players.some(
        (p) => p.id === player.id
      )
    );

  if (isActive) {
    alert(
      "Cannot delete a player currently in the queue or on a court."
    );
    return;
  }

  await deleteDirectoryPlayer(
    player.id
  );

  setDirectory((prev) =>
    prev.filter(
      (p) => p.id !== player.id
    )
  );

  if (
    name.toLowerCase() ===
    player.name.toLowerCase()
  ) {
    setName("");
  }
}}

      className="text-red-500 hover:text-red-700 font-bold px-2"
      title="Delete saved player"
    >
      🗑️
    </button>
  </div>
))}

      </div>
    )}
</div>
            

            <button
              onClick={addPlayer}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Add Player
            </button>

            <button
  onClick={assignPlayers}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
>
  Start Game
</button>

            <button
              onClick={addCourt}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              + Court
            </button>

            <button
              onClick={removeCourt}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              - Court
            </button>

           <button
  onClick={resetAll}
  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded w-full sm:w-auto"
>
  New Session
</button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded bg-red-100 text-red-700">
              {error}
            </div>
          )}

        <div className="mt-4 space-y-1">
  <p>
    <strong>Courts:</strong> {courts.length}
  </p>

  <p>
    <strong>Players Waiting:</strong>{" "}
    {players.length}
  </p>

  <p>
    <strong>Players Playing:</strong>{" "}
    {activePlayers}
  </p>

  <p>
    <strong>Total Players:</strong>{" "}
    {totalPlayers}
  </p>

  <p>
    <strong>Total Games Recorded:</strong>{" "}
    {totalGamesPlayed}
  </p>
</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
  <h2 className="text-2xl font-bold mb-4">
    🏆 Standings
  </h2>

  {standings.length === 0 ? (
    <p>No players available</p>
  ) : (
    standings.map((player, index) => (
      <div
        key={player.id}
        className="flex justify-between border-b py-2"
      >
        <div>
          <strong>
            {index === 0 && "🥇 "}
            {index === 1 && "🥈 "}
            {index === 2 && "🥉 "}
            #{index + 1} {player.name}
          </strong>
        </div>
        <div className="text-sm">
  W: {player.wins || 0}
  {" | "}
  L: {player.losses || 0}
  {" | "}
  WR: {
    ((player.wins || 0) +
      (player.losses || 0))
      ? Math.round(
          ((player.wins || 0) /
            ((player.wins || 0) +
             (player.losses || 0))) *
          100
        )
      : 0
  }%
</div>
      </div>
    ))
  )}
</div>

<div className="bg-white rounded-xl shadow p-4 mb-6">
 <h2 className="text-2xl font-bold mb-4">
  📜 Match History ({matches.length})
</h2>

  {matches.length === 0 ? (
    <p className="text-gray-500">
  No matches recorded yet 🎾
</p>
  ) : (
    matches.slice(0, 10)
      .map((match, index) => (
  <div
    key={index}
    className="border-b py-4"
  >
    <div className="text-sm text-gray-400 mb-2">
  Match #{matches.length - index}
</div>

        <div className="mb-2">
  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
    Court {match.courtId}
  </span>
</div>

<div className="space-y-1">
  <div>
    🔵 <strong>Team A</strong>
  </div>

  <div
  className={`ml-6 ${
    match.winner === "A"
      ? "font-bold text-green-600"
      : "text-gray-700"
  }`}
>
  {match.teamA.join(" & ")}
</div>

  <div>
    🟣 <strong>Team B</strong>
  </div>

 <div
  className={`ml-6 ${
    match.winner === "B"
      ? "font-bold text-green-600"
      : "text-gray-700"
  }`}
>
  {match.teamB.join(" & ")}
</div>

  <div className="mt-2 text-green-600 font-semibold">
    🏆 Winner: Team {match.winner}
  </div>
</div>


<div className="text-xs text-gray-400 mt-2">
  🕒 {getRelativeTime(match.date)}
</div>
     
        </div>
      ))
  )}
</div>

<div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-2xl font-bold mb-4">
              Waiting Queue
            </h2>



            {sortedPlayers.length === 0 ? (
              <p className="text-gray-500 text-center">
  No players waiting 🏓
</p>
            ) : (
              sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <div>
                    <div>
                      {index + 1}. {player.name}
                    </div>

                    <div className="text-sm text-gray-500">
  Games: {player.gamesPlayed} |
  W: {player.wins || 0} |
  L: {player.losses || 0}
</div>

<div
  className={`text-xs font-semibold ${
    player.bracket === "winner"
      ? "text-green-600"
      : player.bracket === "loser"
      ? "text-red-600"
      : "text-gray-500"
  }`}
>
  {player.bracket
    ? player.bracket.toUpperCase()
    : "NORMAL"}
</div>
                  </div>


<div className="flex flex-col gap-1">
  <select
    value={
      selectedCourt[player.id] || ""
    }
    onChange={(e) =>
      setSelectedCourt((prev) => ({
        ...prev,
        [player.id]: e.target.value,
      }))
    }
    className="border rounded px-2 py-1 text-sm"
  >
    <option value="">
      Select Court
    </option>

    {courts.map((court) => (
      <option
        key={court.id}
        value={court.id}
      >
        Court {court.id} (
        {court.players.length}/4)
      </option>
    ))}
  </select>

  <div className="flex gap-1">
    <button
      onClick={() => {
        const courtId =
          selectedCourt[player.id];

        if (!courtId) {
          alert(
            "Please select a court first."
          );
          return;
        }

        addPlayerToCourt(
          player.id,
          courtId
        );
      }}
      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
    >
      ➕
    </button>

    <button
      onClick={() =>
        removePlayer(player.id)
      }
      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
    >
      ✕
    </button>
  </div>
</div>

                </div>
              ))
            )}
          </div>

          <div className="md:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="bg-white rounded-xl shadow p-5"
                >
                  <h2 className="text-2xl font-bold mb-4">
                    Court {court.id}
                  </h2>

                  {court.players.length === 0 ? (
                    <p className="text-gray-400">
                      Empty Court
                    </p>
                  ) : (
                <div className="space-y-4">
  <div>
    <h3 className="font-bold text-blue-600">
      Team A
    </h3>

    {court.players
      .slice(0, 2)
      .map((player) => (

       <div
  key={player.id}
  className="bg-blue-100 p-2 rounded mb-1 flex justify-between items-center"
>
  <span>{player.name}</span>

  <button
    onClick={() =>
      removeCourtPlayer(
        court.id,
        player.id
      )
    }
    className="text-red-600 font-bold"
  >
    ✕
  </button>
</div>

      ))}
  </div>

  <div>
    <h3 className="font-bold text-purple-600">
      Team B
    </h3>

    {court.players
      .slice(2, 4)
      .map((player) => (

       <div
  key={player.id}
  className="bg-purple-100 p-2 rounded mb-1 flex justify-between items-center"
>
  <span>{player.name}</span>

  <button
    onClick={() =>
      removeCourtPlayer(
        court.id,
        player.id
      )
    }
    className="text-red-600 font-bold"
  >
    ✕
  </button>
</div>

      ))}
  </div>
</div>
                  )}

<div className="grid grid-cols-2 gap-2 mt-4">
  <button
    onClick={() =>
      endGame(court.id, "A")
    }
    disabled={
      court.players.length === 0 ||
      players.length < 4
    }
    className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
  >
    Team A Wins
  </button>

  <button
    onClick={() =>
      endGame(court.id, "B")
    }
    disabled={
      court.players.length === 0 ||
      players.length < 4
    }
    className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded disabled:bg-gray-400"
  >
    Team B Wins
  </button>
</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 py-6">
  🏓 PickleStack v{APP_VERSION}
</div>
      </div>
    </div>
  );
}