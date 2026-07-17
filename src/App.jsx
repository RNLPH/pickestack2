import { useEffect, useRef, useState } from "react";
import { getDirectory, saveDirectoryPlayer, deleteDirectoryPlayer, } from "./db/directoryService";
import { getPlayers, savePlayers } from "./db/playerService";
import { saveMatch, getMatches, updateMatch, deleteMatchesBySession, clearAllMatches, } from "./db/matchService";
import { getAttendance, saveAttendance, clearAttendance, deleteAttendanceBySession, } from "./db/attendanceService";
import { getStandingsHistory, saveStandingsHistory, clearStandingsHistory } from "./db/standingsHistoryService";
import { DndContext, useDraggable, useDroppable, } from "@dnd-kit/core";

const DEFAULT_COURTS = [
  { id: 1, players: [] },
  { id: 2, players: [] },
];

const STORAGE_KEYS = {
  COURTS: "picklestack_courts",
  SESSION: "picklestack_session",
};



//FOR DRAG AND DROP PLAYERS function
function DraggablePlayer({ player }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `queue-player-${player.id}`,
    data: {
      player,
      source: "queue",
    },
  });

  const style = {
    transform: transform
      ? `translate3d(
          ${transform.x}px,
          ${transform.y}px,
          0
        )`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab"
    >
      {player.name}
    </div>
  );
}

//Dropable court function

function DroppableCourt({
  courtId,
  children,
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `court-${courtId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={
        isOver
          ? "ring-4 ring-green-400 rounded-xl"
          : ""
      }
    >
      {children}
    </div>
  );
}


//DroppableQueue
function DroppableQueue({
  children,
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: "waiting-queue",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        transition-all
        ${
          isOver
            ? "ring-4 ring-blue-400 rounded-xl bg-blue-50"
            : ""
        }
      `}
    >
      {isOver && (
        <div className="text-center text-blue-600 font-bold mb-2">
          Drop player here
        </div>
      )}

      {children}
    </div>
  );
}

//DroppableCourtPlayer
function DroppableCourtPlayer({
  player,
  children,
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `court-player-${player.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={
        isOver
          ? "ring-2 ring-yellow-400 rounded"
          : ""
      }
    >
      {children}
    </div>
  );
}

//DraggableCourtPlayer

function DraggableCourtPlayer({
  player,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
  id: `court-player-${player.id}`,
  data: {
    player,
    source: "court",
  },
});

  const style = {
    transform: transform
      ? `translate3d(
          ${transform.x}px,
          ${transform.y}px,
          0
        )`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="
  cursor-grab
  p-2
  rounded
"
    >
      {player.name}
    </div>
  );
}

//app function
export default function App() {

  // ===== REFS =====
  const inputRef = useRef(null);

  // ===== UI STATE =====
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);
  const [standingsHistory,setStandingsHistory] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, forceUpdate] = useState(0);
   const [directory, setDirectory] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [expandedAttendance, setExpandedAttendance] =
  useState(null);
  const [expandedStandings, setExpandedStandings] =
  useState(null);
  const [expandedMatchSession,
  setExpandedMatchSession] =
  useState(null);

const [sessionId, setSessionId] = useState(() => {
  return Number(
    localStorage.getItem(
      STORAGE_KEYS.SESSION
    ) || 1
  );
});

// == SAVE SESSIONS ==

useEffect(() => {
  localStorage.setItem(
    STORAGE_KEYS.SESSION,
    sessionId
  );
}, [sessionId]);

useEffect(() => {
  const timer = setInterval(() => {
    forceUpdate((prev) => prev + 1);
  }, 60000);

  return () => clearInterval(timer);
}, []);

  // ===== LOAD MATCHES =====
  useEffect(() => {
  async function loadMatches() {
    const savedMatches =
      await getMatches();

    setMatches(savedMatches);
  }

  loadMatches();
}, []);

//LOAD HISTORY
useEffect(() => {

  async function loadHistory() {

    const history =
      await getStandingsHistory();

    setStandingsHistory(
      history
    );

  }

  loadHistory();

}, []);

//LOAD ATTENDANCE
  useEffect(() => {
  async function loadAttendance() {
    const records =
      await getAttendance();

    setAttendance(records);
  }

  loadAttendance();
}, []);

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

    // PRIORITY FIRST
    if (a.priority && !b.priority) {
      return -1;
    }

    if (!a.priority && b.priority) {
      return 1;
    }

    // Lowest games played
    if (a.gamesPlayed !== b.gamesPlayed) {
      return a.gamesPlayed - b.gamesPlayed;
    }

    // Winners before losers
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

const formatSessionDate = (
  timestamp
) => {
  return new Date(timestamp)
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
};

const formatMatchDuration = (
  start,
  end
) => {
  if (!start || !end) {
    return "Unknown";
  }

 const durationMinutes = Math.max(
  1,
  Math.round(
    (end - start) / 60000
  )
);

  const startTime =
    new Date(start).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  const endTime =
    new Date(end).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  return `${startTime} - ${endTime} (${durationMinutes} min)`;
};

const getCourtDuration = (startedAt) => {
  if (!startedAt) return 0;

  const elapsed =
  Math.floor(
    (Date.now() - startedAt) / 1000
  );

const minutes =
  Math.floor(elapsed / 60);

const seconds =
  elapsed % 60;

return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getCourtMinutes = (startedAt) => {
  if (!startedAt) return 0;

  return Math.floor(
    (Date.now() - startedAt) / 60000
  );
};

const getAttendanceCount = (
  playerId
) => {
  return attendance.filter(
    (record) =>
      record.playerId === playerId
  ).length;
};

//clear attendance records

const clearAttendanceRecords = async () => {

  const confirmed = window.confirm(
    "Reset all attendance records?"
  );

  if (!confirmed) return;

  await clearAttendance();

  setAttendance([]);

  alert(
    "Attendance records cleared."
  );
};

//PREVENT NEW SESSION WHILE GAMES ARE ACTIVE
const hasActiveGames = () =>
  courts.some(
    (court) => court.players.length > 0
  );

//EXPORT CSV
const downloadCSV = (
  filename,
  rows
) => {
  const csvContent = rows
    .map((row) =>
      row
        .map((value) => `"${value}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

//EXPORT STANDINGS
const exportStandings = () => {

  const rows = [
    [
      "Rank",
      "Player",
      "Games",
      "Wins",
      "Losses"
    ]
  ];

  standings.forEach(
    (player, index) => {

      rows.push([
        index + 1,
        player.name,
        player.gamesPlayed,
        player.wins,
        player.losses,
      ]);

    }
  );

  downloadCSV(
    `standings-session-${sessionId}.csv`,
    rows
  );
};

const exportAttendance = () => {

  const rows = [
    [
      "Player",
      "Sessions Attended"
    ]
  ];

  attendanceLeaders.forEach(
    (player) => {

      rows.push([
        player.playerName,
        player.count
      ]);

    }
  );

  downloadCSV(
    "attendance.csv",
    rows
  );
};

const exportMatches = () => {

  const rows = [
    [
      "Session",
      "Court",
      "Team A",
      "Team B",
      "Winner"
    ]
  ];

  matches.forEach((match) => {

    rows.push([
      match.sessionId,
      match.courtId,
      match.teamA.join(" & "),
      match.teamB.join(" & "),
      match.winner,
    ]);

  });

  downloadCSV(
    "matches.csv",
    rows
  );
};




//handleDragEnd FUNCTION
const handleDragEnd = (
  event
) => {

  const {
    active,
    over,
  } = event;

  if (!over) return;

  const dragData =
    active.data.current;

  if (!dragData) return;

 // Court → Queue
if (
  over.id === "waiting-queue" &&
  dragData.source === "court"
) {

  const playerId =
    active.id.replace(
      "court-player-",
      ""
    );

  moveCourtPlayerToQueue(
    playerId
  );

  return;
}

  const targetCourtId =
    Number(
      over.id.replace(
        "court-",
        ""
      )
    );

  // Queue -> Court
  if (
    dragData.source ===
    "queue"
  ) {

    const playerId =
      active.id.replace(
        "queue-player-",
        ""
      );

      if (
  over.id.startsWith(
    "court-player-"
  )
) {

  const queuePlayerId =
    active.id.replace(
      "queue-player-",
      ""
    );

  const courtPlayerId =
    over.id.replace(
      "court-player-",
      ""
    );

  swapQueueAndCourtPlayer(
    queuePlayerId,
    courtPlayerId
  );

  return;
}
    addPlayerToCourt(
      playerId,
      targetCourtId
    );

    return;
  }

  // Court -> Court
  if (
    dragData.source ===
    "court"
  ) {

    const playerId =
      active.id.replace(
        "court-player-",
        ""
      );
      if (
  over.id.startsWith(
    "court-player-"
  )
) {

  const sourcePlayerId =
    active.id.replace(
      "court-player-",
      ""
    );

  const targetPlayerId =
    over.id.replace(
      "court-player-",
      ""
    );

  if (
    sourcePlayerId !==
    targetPlayerId
  ) {

    swapCourtPlayers(
      sourcePlayerId,
      targetPlayerId
    );

  }

  return;
}

    moveCourtPlayer(
      playerId,
      targetCourtId
    );
  }

};



  
//END OF HELPER

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

  priority:
  existingDirectoryPlayer.priority ??
  false,

    currentStreak:
      existingDirectoryPlayer.currentStreak ?? 0,

    bestStreak:
      existingDirectoryPlayer.bestStreak ?? 0,

    waitingSince: Date.now(),
  };
} else {
 newPlayer = {
  id: crypto.randomUUID(),
  name: trimmedName,
  priority: false,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  bracket: "normal",
  waitingSince: Date.now(),
};

// SET DIRECTORY PLAYER
await saveDirectoryPlayer(newPlayer);
  setDirectory((prev) => [
    ...prev,
    newPlayer,
  ]);
}

// SET PLAYERS
await saveDirectoryPlayer(newPlayer);

const alreadyAttended =
  attendance.some(
    (record) =>
      record.sessionId === sessionId &&
      record.playerId === newPlayer.id
  );

if (!alreadyAttended) {

  const attendanceRecord = {
    id: crypto.randomUUID(),
    playerId: newPlayer.id,
    playerName: newPlayer.name,
    sessionId,
    timestamp: Date.now(),
  };

  await saveAttendance(
  attendanceRecord
);

setAttendance((prev) => [
  ...prev,
  attendanceRecord,
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
        ? (() => {
    const updatedPlayers =
      court.players.filter(
        (p) => p.id !== playerId
      );

    return {
      ...court,
      players: updatedPlayers,
      startedAt:
        updatedPlayers.length < 4
          ? null
          : court.startedAt,
    };
  })()
        : court
    )
  );
};

//swapQueueAndCourtPlayer 
const swapQueueAndCourtPlayer = (
  queuePlayerId,
  courtPlayerId
) => {

  const queuePlayer =
    players.find(
      (p) => p.id === queuePlayerId
    );

  if (!queuePlayer) return;

  const courtPlayer =
    courts
      .flatMap(
        (court) => court.players
      )
      .find(
        (player) =>
          player.id === courtPlayerId
      );

  if (!courtPlayer) return;

  setCourts((prevCourts) =>
    prevCourts.map((court) => ({
      ...court,
      players: court.players.map(
        (player) =>
          player.id === courtPlayerId
            ? queuePlayer
            : player
      ),
    }))
  );

  setPlayers((prev) =>
    sortPlayers([
      ...prev.filter(
        (p) =>
          p.id !== queuePlayerId
      ),

      {
        ...courtPlayer,
        waitingSince: Date.now(),
      },
    ])
  );

};

//SWAP COURT PLAYERS
const swapCourtPlayers = (
  sourcePlayerId,
  targetPlayerId
) => {

  setCourts((prevCourts) => {

    const updatedCourts =
      JSON.parse(
        JSON.stringify(prevCourts)
      );

    let sourceLocation = null;
    let targetLocation = null;

    updatedCourts.forEach(
      (court, courtIndex) => {

        court.players.forEach(
          (player, playerIndex) => {

            if (
              player.id === sourcePlayerId
            ) {
              sourceLocation = {
                courtIndex,
                playerIndex,
              };
            }

            if (
              player.id === targetPlayerId
            ) {
              targetLocation = {
                courtIndex,
                playerIndex,
              };
            }

          }
        );
      }
    );

    if (
      !sourceLocation ||
      !targetLocation
    ) {
      return prevCourts;
    }

    const sourcePlayer =
      updatedCourts[
        sourceLocation.courtIndex
      ].players[
        sourceLocation.playerIndex
      ];

    const targetPlayer =
      updatedCourts[
        targetLocation.courtIndex
      ].players[
        targetLocation.playerIndex
      ];

    updatedCourts[
      sourceLocation.courtIndex
    ].players[
      sourceLocation.playerIndex
    ] = targetPlayer;

    updatedCourts[
      targetLocation.courtIndex
    ].players[
      targetLocation.playerIndex
    ] = sourcePlayer;

    return updatedCourts;
  });
};

const moveCourtPlayerToQueue = (
  playerId
) => {
  let playerToMove = null;

  setCourts((prev) =>
    prev.map((court) => {

      const found =
        court.players.find(
          (p) => p.id === playerId
        );

      if (found) {
        playerToMove = found;
      }

      const updatedPlayers =
  court.players.filter(
    (p) => p.id !== playerId
  );

return {
  ...court,
  players: updatedPlayers,
  startedAt:
    updatedPlayers.length < 4
      ? null
      : court.startedAt,
};
    })
  );

  if (playerToMove) {
    setPlayers((prev) =>
      sortPlayers([
        ...prev,
        {
          ...playerToMove,
          waitingSince: Date.now(),
        },
      ])
    );
  }
};


//add player to court
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
  ? (() => {
      const updatedPlayers = [
        ...court.players,
        player,
      ];

      return {
        ...court,
        players: updatedPlayers,
        startedAt:
          updatedPlayers.length === 4 &&
          !court.startedAt
            ? Date.now()
            : court.startedAt,
      };
    })()
        : court
    )
  );

  setPlayers((prev) =>
    prev.filter(
      (p) => p.id !== playerId
    )
  );
};


//move court player
const moveCourtPlayer = (
  playerId,
  targetCourtId
) => {

  //SOURCE COURT
const sourceCourt = courts.find(
  (court) =>
    court.players.some(
      (p) => p.id === playerId
    )
);

if (
  sourceCourt &&
  sourceCourt.id === targetCourtId
) {
  return;
}

  let playerToMove = null;

  setCourts((prev) => {

    const updated = prev.map((court) => {

      const found =
        court.players.find(
          (p) => p.id === playerId
        );

      if (found) {
        playerToMove = found;
      }

      return {
        ...court,
        players: court.players.filter(
          (p) => p.id !== playerId
        ),
      };
    });

    return updated.map((court) => {

      if (
        court.id === targetCourtId
      ) {

        if (
          court.players.length >= 4
        ) {
          alert("Court is full.");
          return court;
        }


     const updatedPlayers = [
  ...court.players,
  playerToMove,
];

return {
  ...court,
  players: updatedPlayers,
  startedAt:
    updatedPlayers.length === 4 &&
    !court.startedAt
      ? Date.now()
      : court.startedAt,
};
      }

      return court;
    });

  });

};

//remove court

  const removeCourt = () => {
    if (courts.length <= 1) return;

    const lastCourt = courts[courts.length - 1];

  if (lastCourt.players.length > 0) {

  setPlayers((prev) =>
    sortPlayers([
      ...prev,
      ...lastCourt.players.map(
        (player) => ({
          ...player,
          waitingSince: Date.now(),
        })
      ),
    ])
  );
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
            startedAt: Date.now(),
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

  //Match record
const matchRecord = {

  sessionId,

  startedAt: court.startedAt,

  endedAt: Date.now(),

  sessionTimestamp:
    new Date().toISOString(),

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

const matchId =
  await saveMatch(matchRecord);

const savedMatch = {
  ...matchRecord,
  id: matchId,
};

setMatches((prev) => [
  savedMatch,
  ...prev,
]);

  const returningPlayers = court.players.map(
    (player, index) => {
      const isTeamA = index < 2;

      const won =
        (winningTeam === "A" && isTeamA) ||
        (winningTeam === "B" && !isTeamA);

    const currentStreak = won
  ? (player.currentStreak || 0) + 1
  : 0;

return {
  ...player,

  gamesPlayed:
    player.gamesPlayed + 1,

  wins:
    (player.wins || 0) +
    (won ? 1 : 0),

  losses:
    (player.losses || 0) +
    (won ? 0 : 1),

  currentStreak,

  bestStreak: Math.max(
    player.bestStreak || 0,
    currentStreak
  ),

  bracket:
    won ? "winner" : "loser",

  waitingSince: Date.now(),
};

    }
  );
const updatedDirectory = directory.map(
  (directoryPlayer) => {

    const updatedPlayer =
      returningPlayers.find(
        (player) =>
          player.id === directoryPlayer.id
      );

    return updatedPlayer
      ? updatedPlayer
      : directoryPlayer;
  }
);

setDirectory(updatedDirectory);

await Promise.all(
  updatedDirectory.map(
    (player) =>
      saveDirectoryPlayer(player)
  )
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
            startedAt: null,
          }
        : court
    )
  );
};

// ===== SESSION ACTIONS =====

//Start new session

const startNewSession = async () => {

  if (hasActiveGames()) {
    alert(
      "Finish or clear all active games before starting a new session."
    );
    return;
  }

 

  const confirmed = window.confirm(
    `End Session ${sessionId} and start Session ${sessionId + 1}?`
  );

  if (!confirmed) return;

  setPlayers([]);
  setCourts(DEFAULT_COURTS);

  setName("");
  setError("");


const latestMatches =
  await getMatches();

const sessionMatches =
  latestMatches.filter(
    (match) =>
      match.sessionId === sessionId
  );

const historyRecord = {
  id: crypto.randomUUID(),
  sessionId,
  timestamp: Date.now(),

  matchCount:
    sessionMatches.length,

  standings: standings.map(
    (player) => ({
      playerId: player.id,
      playerName: player.name,
      gamesPlayed: player.gamesPlayed,
      wins: player.wins,
      losses: player.losses,
      currentStreak:
        player.currentStreak || 0,
      bestStreak:
        player.bestStreak || 0,
    })
  ),
};

await saveStandingsHistory(
  historyRecord
);

setStandingsHistory(
  (prev) => [
    ...prev,
    historyRecord,
  ]
);

const resetDirectory =
  directory.map((player) => ({
    ...player,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    bracket: "normal",
  }));

await Promise.all(
  resetDirectory.map((player) =>
    saveDirectoryPlayer(player)
  )
);

setDirectory(resetDirectory);
  setSessionId((prev) => prev + 1);

  alert(
    `Session ${sessionId + 1} started.`
  );
};

//session reset

const resetSession = () => {

  if (hasActiveGames()) {
    alert(
      "Finish or clear all active games before resetting the session."
    );
    return;
  }

  const confirmed = window.confirm(
    `Reset Session ${sessionId}?`
  );

  if (!confirmed) return;

  setPlayers([]);
  setCourts(DEFAULT_COURTS);
  setName("");
  setError("");

  alert(
    `Session ${sessionId} has been reset.`
  );
};

//delete session

const deleteSession = async (
  sessionToDelete
) => {

  const confirmed = window.confirm(
    `Delete Session ${sessionToDelete}?`
  );

  if (!confirmed) return;

  await deleteMatchesBySession(
    sessionToDelete
  );

  await deleteAttendanceBySession(
    sessionToDelete
  );

  setMatches((prev) =>
    prev.filter(
      (match) =>
        match.sessionId !==
        sessionToDelete
    )
  );

  setAttendance((prev) =>
    prev.filter(
      (record) =>
        record.sessionId !==
        sessionToDelete
    )
  );
};

//EDIT WINNER
const editMatchWinner = async (
  matchId,
  newWinner
) => {

  const confirmed = window.confirm(
    `Change winner to Team ${newWinner}?`
  );

  if (!confirmed) return;

  const updatedMatches =
    matches.map((match) =>

      match.id === matchId

        ? {
            ...match,
            winner: newWinner,
          }

        : match
    );

const targetMatch =
  updatedMatches.find(
    (match) =>
      match.id === matchId
  );

if (!targetMatch) {
  alert("Match not found.");
  return;
}

await updateMatch(targetMatch);

  setMatches(updatedMatches);

  await recalculateStandings(
    updatedMatches
  );

  alert(
    "Match updated and standings recalculated."
  );
};

// CLEAR HISTORY

const clearHistory = async () => {

  const confirmed = window.confirm(
    "Delete ALL match history?"
  );

  if (!confirmed) return;

  await clearAllMatches();

  setMatches([]);

  alert(
    "All match history cleared."
  );
};

// Factory Reset = clears all data including player directory
const factoryReset = async () => {

  const confirmed = window.confirm(
    "WARNING: This will permanently delete ALL data including saved players. Continue?"
  );

  if (!confirmed) return;

await clearAllMatches();
await clearAttendance();
await clearStandingsHistory();

  // Delete every saved player
  for (const player of directory) {
    await deleteDirectoryPlayer(player.id);
  }

  setMatches([]);
  setAttendance([]);
  setDirectory([]);
  setStandingsHistory([]);

  setPlayers([]);
  setExpandedAttendance(null);
setExpandedStandings(null);


localStorage.removeItem(
  STORAGE_KEYS.COURTS
);

setCourts(DEFAULT_COURTS);

setSessionId(1);

localStorage.setItem(
  STORAGE_KEYS.SESSION,
  "1"
);

  alert(
    "Factory Reset completed."
  );
};

// END OF CLEAR HISTORY

// START OF CLEAR STANDING

const clearStandings = async () => {
  const confirmed = window.confirm(
    "Reset ALL player statistics?"
  );

  if (!confirmed) return;

  await clearStandingsHistory();
  setStandingsHistory([]);

  const resetPlayers =
    directory.map((player) => ({
      ...player,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      bracket: "normal",
    }));

    await Promise.all(
  resetPlayers.map(
    (player) =>
      saveDirectoryPlayer(player)
  )
);

  setDirectory(resetPlayers);

  setPlayers((prev) =>
  prev.map((player) => ({
    ...player,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    bracket: "normal",
  }))
);
setCourts((prev) =>
  prev.map((court) => ({
    ...court,
    players: court.players.map(
      (player) => ({
        ...player,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        currentStreak: 0,
        bestStreak: 0,
        bracket: "normal",
      })
    ),
  }))
);

  alert(
    "All standings have been reset."
  );
};

// END OF CLEAR STANDINGS



// ===== DERIVED DATA =====

//RECALCULATE STANDINGS
const recalculateStandings = async (
  updatedMatches
) => {

  const playerStats = {};

  // Initialize every player
  directory.forEach((player) => {

    playerStats[player.id] = {
      ...player,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      bracket: "normal",
    };

  });

  updatedMatches.forEach((match) => {

    const winningPlayers =
      match.winner === "A"
        ? match.teamA
        : match.teamB;

    const losingPlayers =
      match.winner === "A"
        ? match.teamB
        : match.teamA;

    directory.forEach((player) => {

      if (
        winningPlayers.includes(player.name)
      ) {

        playerStats[player.id].gamesPlayed++;
        playerStats[player.id].wins++;

      }

      else if (
        losingPlayers.includes(player.name)
      ) {

        playerStats[player.id].gamesPlayed++;
        playerStats[player.id].losses++;

      }

    });

  });

  const updatedDirectory =
    Object.values(playerStats);

  await Promise.all(
    updatedDirectory.map((player) =>
      saveDirectoryPlayer(player)
    )
  );

  setDirectory(updatedDirectory);

  setPlayers((prev) =>
  prev.map((player) => {

    const updated =
      updatedDirectory.find(
        (p) => p.id === player.id
      );

    return updated
      ? {
          ...player,
          gamesPlayed:
            updated.gamesPlayed,
          wins: updated.wins,
          losses: updated.losses,
        }
      : player;
  })
);

};

//SORT PLAYERS
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

//total players
const totalPlayers =
  players.length + activePlayers;

//total games played
const totalGamesPlayed =
  matches.length;

    // == STANDINGS 

    // == ATTENDANCE LEADERS 

    const currentAttendance =
  attendance.filter(
    (record) =>
      record.sessionId === sessionId
  );
  
const attendanceMap = {};

  currentAttendance.forEach((record) => {
  if (!attendanceMap[record.playerId]) {
    attendanceMap[record.playerId] = {
      playerId: record.playerId,
      playerName: record.playerName,
      count: 0,
    };
  }

  attendanceMap[record.playerId].count++;
});

//attendance leaders
const attendanceLeaders =
  Object.values(attendanceMap)
    .sort((a, b) => b.count - a.count);

//attendance total sessions

const totalSessions =
  Math.max(
    new Set(
      attendance.map(
        (record) => record.sessionId
      )
    ).size,
    1
  );

    //END OF ATTENDANCE LEADERS

const standings = directory
  .filter(
    (player) =>
      (player.gamesPlayed || 0) > 0
  )
  .sort((a, b) => {

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


const getSessionStats = (
  playerName
) => {
  const sessionMatches = matches.filter(
    (match) =>
      match.sessionId === sessionId &&
      (
        match.teamA.includes(playerName) ||
        match.teamB.includes(playerName)
      )
  );

  const wins = sessionMatches.filter(
    (match) =>
      (
        match.winner === "A" &&
        match.teamA.includes(playerName)
      ) ||
      (
        match.winner === "B" &&
        match.teamB.includes(playerName)
      )
  ).length;

  const losses =
    sessionMatches.length - wins;

  return {
    gamesPlayed:
      sessionMatches.length,
    wins,
    losses,
    winRate:
      sessionMatches.length > 0
        ? Math.round(
            (wins /
              sessionMatches.length) *
              100
          )
        : 0,
  };
};

const getSessionSummary = (
  sessionMatches
) => {
  const playerStats = {};

  sessionMatches.forEach((match) => {

    [...match.teamA, ...match.teamB]
      .forEach((player) => {

        if (!playerStats[player]) {
          playerStats[player] = {
            wins: 0,
            losses: 0,
          };
        }

        const won =
          (match.winner === "A" &&
            match.teamA.includes(player))
          ||
          (match.winner === "B" &&
            match.teamB.includes(player));

        if (won) {
          playerStats[player].wins++;
        } else {
          playerStats[player].losses++;
        }
      });
  });

  const players =
    Object.keys(playerStats).length;

  const matches =
    sessionMatches.length;

 const durations =
  sessionMatches
    .filter(
      (m) =>
        m.startedAt &&
        m.endedAt
    )
    .map(
      (m) =>
        (m.endedAt -
          m.startedAt) /
        60000
    )
    .filter(
      (duration) =>
        duration <= 120
    );

 const avgDuration =
  durations.length > 0
    ? Math.max(
        1,
        Math.round(
          durations.reduce(
            (a, b) => a + b,
            0
          ) / durations.length
        )
      )
    : 0;

const longestMatch =
  durations.length > 0
    ? Math.max(
        1,
        Math.round(
          Math.max(...durations)
        )
      )
    : 0;

const leaderboard =
  Object.entries(playerStats)
    .map(([name, stats]) => ({
      name,
      ...stats,
      winRate:
        stats.wins + stats.losses > 0
          ? stats.wins /
            (stats.wins + stats.losses)
          : 0,
    }))
    .sort((a, b) => {

      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.losses - b.losses;
    });

const bestRecord =
  leaderboard[0];

const topRecordPlayers =
  leaderboard.filter(
    (player) =>
      player.winRate ===
        bestRecord?.winRate &&
      player.wins ===
        bestRecord?.wins &&
      player.losses ===
        bestRecord?.losses
  );

return {
  players,
  matches,
  avgDuration,
  longestMatch,
  bestRecord,
  topRecordPlayers,
};

};

//GROUPED ATTENDANCE
const groupedAttendance =
  attendance.reduce((groups, record) => {

    const key = record.sessionId;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(record);

    return groups;

  }, {});

//CURRENT MATCHES

  const currentMatches =
  matches.filter(
    (match) =>
      match.sessionId === sessionId
  );

  //GROUP MATCHES
const groupedMatches =
  matches.reduce(
  (groups, match) => {
    const key =
      match.sessionId || 1;
    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(match);

    return groups;
  },
  {}
);

  return (

    /* ===== APP CONTAINER START ===== */
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">

     {/* ===== PAGE CONTAINER START ===== */}
      <div className="max-w-7xl mx-auto w-full">

        {/* ===== HEADER START ===== */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
          🏓 PickleStack
        </h1>
        <div className="text-center mb-6">
  <div className="text-lg font-semibold text-blue-600">
    🏷️ Session {sessionId}
  </div>
</div>
         {/* ===== HEADER END ===== */}

{/* TAB NAVIGATION START */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">

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

  {/*==ATTENDANCE==*/}
  <button
  onClick={() =>
    setActiveTab("attendance")
  }
  className={`px-4 py-2 rounded ${
    activeTab === "attendance"
      ? "bg-blue-600 text-white"
      : "bg-white"
  }`}
>
  👥 Attendance
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
    📜Match History
  </button>

</div>

        {activeTab === "dashboard" && (
          
          <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

         
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
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Player
            </button>

            <button
  onClick={assignPlayers}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
>
  Start Game
</button>

            <button
              onClick={addCourt}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              + Court
            </button>

            <button
              onClick={removeCourt}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              - Court
            </button>


<button
  onClick={startNewSession}
  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
>
  ➡️ New Session
</button>

<button
  onClick={resetSession}
  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
>
  🔄 Restart Current Session
</button>

<button
  onClick={factoryReset}
  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
>
  ☢️ Factory Reset
</button>

  </div>

          {error && (
            <div className="mt-3 p-3 rounded bg-red-100 text-red-700">
              {error}
            </div>
          )}

        <div className="mt-4 space-y-1 text-sm md:text-base">
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
        )}
{/* STANDINGS VIEW START */}
  
  {activeTab === "standings" && (
    <div className="bg-white rounded-xl shadow p-4 mb-6">

<div className="flex justify-between items-center mb-4">

  <h2 className="text-2xl font-bold">
    🏆 Standings
  </h2>
<button
  onClick={exportStandings}
  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
>
  📤 Export CSV
</button>
  <button
    onClick={clearStandings}
    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm"
  >
    🧹 Clear Standings
  </button>

</div>

  {standings.length === 0 ? (
    <p>No players available</p>
  ) : (

standings.map((player, index) => {

  const sessionStats =
    getSessionStats(player.name);

  return (
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

      <div className="text-sm text-right">

        <div className="font-semibold text-blue-600">
          Today
        </div>

        <div>
          GP: {sessionStats.gamesPlayed}
          {" | "}
          W: {sessionStats.wins}
          {" | "}
          L: {sessionStats.losses}
          {" | "}
          WR: {sessionStats.winRate}%
        </div>

        <div className="text-xs text-gray-500 mt-1">
          All-Time
        </div>

        <div className="text-xs text-gray-500">
          GP: {player.gamesPlayed || 0}
          {" | "}
          W: {player.wins || 0}
          {" | "}
          L: {player.losses || 0}
        </div>

        <div className="text-xs text-indigo-500">
  👥 Sessions:
  {" "}
  {getAttendanceCount(player.id)}
</div>
  {(player.currentStreak || 0) > 0 && (
  <div className="text-xs text-orange-500 font-semibold">
    🔥 Streak: {player.currentStreak}
  </div>
)}

      </div>

    </div>
  );
})

  )}
  <h3 className="font-semibold text-gray-700 mt-8 mb-3">
  📚 Standings History
</h3>

{standingsHistory.length === 0 ? (

  <p>No standings history.</p>

) : (

  standingsHistory
    .sort(
      (a, b) =>
        b.sessionId - a.sessionId
    )
    .map((history) => (

      <div
        key={history.id}
        className="
          border
          rounded-xl
          p-5
          mb-4
          bg-white
          shadow-sm
        "
      >

        <div className="flex justify-between items-center">

          <div>

            <h4 className="font-bold text-blue-600">
              Session {history.sessionId}
            </h4>


            <div className="text-xs text-gray-500">
              <div className="text-xs text-gray-400">
  {history.standings.length}
  {" "}Players •{" "}
  {history.matchCount || 0}
  {" "}Matches
</div>
              {new Date(
                history.timestamp
              ).toLocaleDateString()}
            </div>

          </div>

          <button
            onClick={() =>
              setExpandedStandings(
                expandedStandings === history.id
                  ? null
                  : history.id
              )
            }
            className="
              bg-blue-500
              hover:bg-blue-600
              text-white
              px-3
              py-1
              rounded
              text-sm
            "
          >
            {expandedStandings === history.id
              ? "Hide Standings"
              : "View Standings"}
          </button>

        </div>

{expandedStandings === history.id && (

  <div className="mt-4 border-t pt-4">

    <div className="grid grid-cols-4 gap-2 mb-4">

  <div className="bg-blue-50 rounded-lg p-2 text-center">
    <div className="text-xs text-gray-500">
      Players
    </div>

    <div className="font-bold text-blue-600">
      {history.standings.length}
    </div>
  </div>

  <div className="bg-green-50 rounded-lg p-2 text-center">
    <div className="text-xs text-gray-500">
      Leader
    </div>

    <div className="font-bold text-green-600">
      {history.standings[0]?.playerName}
    </div>
  </div>

  <div className="bg-purple-50 rounded-lg p-2 text-center">

  <div className="text-xs text-gray-500">
    Matches
  </div>

  <div className="font-bold text-purple-600">
    {history.matchCount || 0}
  </div>

</div>

  <div className="bg-orange-50 rounded-lg p-2 text-center">
    <div className="text-xs text-gray-500">
      Total Games
    </div>

    <div className="font-bold text-orange-600">
      {
        history.standings.reduce(
          (sum, player) =>
            sum + player.gamesPlayed,
          0
        )
      }
    </div>
  </div>

</div>

      {[...history.standings]
  .sort((a, b) => {

    const winRateA =
      a.gamesPlayed > 0
        ? a.wins / a.gamesPlayed
        : 0;

    const winRateB =
      b.gamesPlayed > 0
        ? b.wins / b.gamesPlayed
        : 0;

    if (winRateB !== winRateA) {
      return winRateB - winRateA;
    }

    return b.wins - a.wins;
  })
  .map(
      (player, index) => (

        <div
          key={player.playerId}
          className="
            flex
            justify-between
            border-b
            py-2
          "
        >

          <div>

            {index === 0 && "🥇 "}
            {index === 1 && "🥈 "}
            {index === 2 && "🥉 "}

            #{index + 1}

            {" "}

            {player.playerName}

          </div>

          <div className="text-sm">

          GP: {player.gamesPlayed}
|
W: {player.wins}
|
L: {player.losses}
|
WR: {
  player.gamesPlayed > 0
    ? Math.round(
        (player.wins /
          player.gamesPlayed) *
          100
      )
    : 0
}%

          </div>

        </div>

      )
    )}

  </div>

)}


      </div>
    ))
)}

    </div>
  )
}

{/* STANDINGS VIEW END */}

{/* STANDINGS VIEW END */}

{/* ATTENDANCE VIEW START */}

{activeTab === "attendance" && (
  <div className="bg-white rounded-xl shadow p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">
        👥 Attendance
      </h2>
<button
  onClick={exportAttendance}
  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
>
  📤 Export CSV
</button>

      <button
        onClick={clearAttendanceRecords}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm">
        🧹 Reset Attendance
      </button>

    </div>

{attendanceLeaders.length > 0 && (
  //attendance champion
  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">

    <div className="text-lg font-bold text-yellow-700">
      👑 Attendance Champion
    </div>

    <div className="mt-1">
      {attendanceLeaders[0].playerName}
    </div>

    <div className="text-sm text-gray-600">
      {attendanceLeaders[0].count}
{" "}
{attendanceLeaders[0].count === 1
  ? "session"
  : "sessions"}
{" "}
attended
    </div>

  </div>

)}
<div className="grid md:grid-cols-3 gap-4 mb-6">

  <div className="bg-blue-50 rounded-lg p-4">

    <div className="text-sm text-gray-600">
      Total Records
    </div>

    <div className="text-2xl font-bold text-blue-600">
      {currentAttendance.length}
    </div>

  </div>

  <div className="bg-green-50 rounded-lg p-4">

    <div className="text-sm text-gray-600">
      Unique Players
    </div>

    <div className="text-2xl font-bold text-green-600">
      {attendanceLeaders.length}
    </div>

  </div>

  <div className="bg-purple-50 rounded-lg p-4">

    <div className="text-sm text-gray-600">
      Current Session
    </div>

    <div className="text-2xl font-bold text-purple-600">
      {sessionId}
    </div>

  </div>

</div>

    
{attendanceLeaders.length === 0 ? (

  <p>No attendance data yet</p>

) : (

  <>

    <h3 className="font-semibold text-gray-700 mb-3">
      🏅 Attendance Leaderboard
    </h3>

    {attendanceLeaders.map((player, index) => (

        <div
  key={player.playerId}
  className="flex justify-between border-b py-2"
>

          <div>

  {index === 0 && "🥇 "}
  {index === 1 && "🥈 "}
  {index === 2 && "🥉 "}

  <span
    className={
      index === 0
        ? "text-yellow-500 font-bold"
        : index === 1
        ? "text-gray-500 font-bold"
        : index === 2
        ? "text-orange-500 font-bold"
        : "font-bold"
    }
  >
    #{index + 1}
  </span>

  {" "}
  {player.playerName}

</div>


        <div className="text-right">

  <div className="font-semibold text-blue-600">
    {player.count} {player.count === 1 ? "session" : "sessions"}
  </div>

  <div className="text-xs text-gray-500">
    {Math.round(
      (player.count / totalSessions) * 100
    )}
    % attendance
  </div>

</div>

        </div>



      ))}

  </>

)}

<h3 className="font-semibold text-gray-700 mt-8 mb-3">
  📚 Attendance History
</h3>

{Object.keys(groupedAttendance).length === 0 ? (
  <p>No attendance history.</p>
) : (
  Object.entries(groupedAttendance)
    .sort(
      ([a], [b]) => Number(b) - Number(a)
    )
    .map(
  ([session, records]) => {

const sessionMatchCount =
  groupedMatches[session]?.length || 0;

const sessionSummary =
  getSessionSummary(
    groupedMatches[session] || []
  );

return (
        <div
          key={session}
          className="border rounded-xl p-5 mb-4 bg-white shadow-sm"
        >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">

           <div>

  <h4 className="font-bold text-blue-600">
    Session {session}
  </h4>


<div className="text-xs text-gray-500">
  {new Date(
    records[0].timestamp
  ).toLocaleDateString()}
</div>


</div>

<div className="grid grid-cols-3 gap-2 w-72">

  <div className="bg-blue-50 rounded-lg p-2 text-center">

    <div className="text-xs text-gray-500">
      Players
    </div>

    <div className="font-bold text-blue-600">
      {
        new Set(
          records.map(
            r => r.playerId
          )
        ).size
      }
    </div>

  </div>

  <div className="bg-green-50 rounded-lg p-2 text-center">
    <div className="text-xs text-gray-500">
      Matches
    </div>

    <div className="font-bold text-green-600">
      {sessionMatchCount}
    </div>
  </div>

  <div className="bg-orange-50 rounded-lg p-2 text-center">
    <div className="text-xs text-gray-500">
      Avg Match
    </div>

    <div className="font-bold text-orange-600">
      {sessionSummary.avgDuration}m
    </div>
  </div>
</div>

          </div>
          {sessionSummary.bestRecord && (

  <div className="mt-4 text-center">

    <div className="text-sm text-gray-500">
      🏆 Best Session Record
    </div>

    <div className="font-semibold text-yellow-600">

      {sessionSummary.topRecordPlayers
        .map(p => p.name)
        .join(", ")}

    </div>

    <div className="text-xs text-gray-500">

      {sessionSummary.bestRecord.wins}W -
      {sessionSummary.bestRecord.losses}L

      {" • "}

      {Math.round(
        sessionSummary.bestRecord.winRate * 100
      )}%

    </div>

  </div>

)}
<div className="mt-4 flex justify-center">
  
  <button
    onClick={() =>
      setExpandedAttendance(
        expandedAttendance === session
          ? null
          : session
      )
    }
    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
  >

    {expandedAttendance === session
      ? "Hide Attendance"
      : "View Attendance"}
  </button>

</div>


{expandedAttendance === session && (

  <div className="mt-4 border-t pt-4">

    <div className="font-semibold text-gray-700 mb-3">
      👥 Attendance List
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    
    {[
      ...new Map(
        records.map((r) => [
          r.playerId,
          r,
        ])
      ).values(),
    ]
      .sort((a, b) =>
        a.playerName.localeCompare(
          b.playerName
        )
      )
      .map((record) => (

       <div
  key={record.id}
  className="
  bg-slate-50
  border
  rounded-lg
  px-3
  py-2
  text-center
  text-sm
  hover:bg-slate-100
"
>
  {record.playerName}
</div>

      ))}

  </div>
  </div>

)}

</div>

    );
  })
)}

</div>

)}


{/* ATTENDANCE VIEW END */}

{/* MATCH HISTORY VIEW START */}
{activeTab === "history" && (
  <div className="bg-white rounded-xl shadow p-4 mb-6">
    <div className="flex justify-between items-center mb-6">

  <h2 className="text-2xl font-bold">
    📜 Match History ({matches.length} Total)
  </h2>

<button
  onClick={exportMatches}
  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
>
  📤 Export CSV
</button>

  <button
    onClick={clearHistory}
    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
  >
    🗑️ Clear All History
  </button>

</div>
    {matches.length === 0 ? (
      <p>No matches recorded yet.</p>
    ) : (

    Object.entries(groupedMatches)
  .sort(
    ([a], [b]) => Number(b) - Number(a)
  )
  .map(
  ([session, sessionMatches]) => {

    const summary =
      getSessionSummary(
        sessionMatches
      );

    return (
        <div
  key={session}
  className="mb-8 border rounded-lg p-4 bg-white shadow-sm"
>

<div className="flex justify-between items-center mb-3">

  <div>
    <h3 className="text-xl font-bold text-blue-600">
      📂 Session {session}
    </h3>
  </div>

  <div className="flex gap-2">

    <button
      onClick={() =>
        setExpandedMatchSession(
          expandedMatchSession === session
            ? null
            : session
        )
      }
      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
    >
      {expandedMatchSession === session
        ? "Hide Matches"
        : "View Matches"}
    </button>

    <button
      onClick={() =>
        deleteSession(Number(session))
      }
      className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded text-xs"
    >
      Delete
    </button>

  </div>

</div>

<p className="text-sm text-gray-500 mb-4">
  🗓️{" "}
  {formatSessionDate(
    sessionMatches[0]?.sessionTimestamp ||
    sessionMatches[0]?.date
  )}
</p>
<div className="bg-slate-100 rounded-lg p-3 mb-4">

  <div className="grid grid-cols-2 gap-2 text-sm">

    <div>
      👥 Players:
      {" "}
      {summary.players}
    </div>

    <div>
      🏓 Matches:
      {" "}
      {summary.matches}
    </div>

    <div>
      ⏱ Avg Match:
      {" "}
      {summary.avgDuration} min
    </div>

    <div>
      🔥 Longest:
      {" "}
      {summary.longestMatch} min
    </div>

  </div>

{summary.bestRecord && (
  <div className="mt-4 text-center">

    <div className="text-lg font-bold text-yellow-600">
      🏆 Best Session Record
    </div>

    <div className="mt-2 text-sm">
      Record:
      {" "}
      <span className="font-semibold">
        {summary.bestRecord.wins}W-
        {summary.bestRecord.losses}L
      </span>
    </div>

    <div className="text-sm">
      Win Rate:
      {" "}
      <span className="font-semibold">
        {Math.round(
          summary.bestRecord.winRate * 100
        )}
        %
      </span>
    </div>

    <div className="mt-3 text-sm font-semibold text-gray-700">
      Players
    </div>

    <div className="space-y-1 mt-1">

      {summary.topRecordPlayers.map(
        (player) => (
          <div
            key={player.name}
            className="text-sm"
          >
            • {player.name}
          </div>
        )
      )}

    </div>

  </div>
)}

</div>

{expandedMatchSession === session && (
  <>
    
            {sessionMatches.map(
              (match, index) => (

              <div
  key={index}
  className="border-b py-4"
>
  <div className="text-sm text-gray-400 mb-2">
    Match #{index + 1}
  </div>

  <div className="mb-2">
    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
      Court {match.courtId}
    </span>
  </div>

<div className="space-y-2">

  <div>
    🔵 {match.teamA.join(" & ")}
  </div>

  <div>
    🟣 {match.teamB.join(" & ")}
  </div>

  <div className="flex items-center gap-2">

  <div className="text-green-600 font-semibold">
    🏆 Winner: Team {match.winner}
  </div>

<select
  value={match.winner}
  onChange={(e) =>
    editMatchWinner(
      match.id,
      e.target.value
    )
  }
  className="border rounded px-2 py-1 text-xs"
>
  <option value="A">
    Team A
  </option>

  <option value="B">
    Team B
  </option>
</select>

</div>


</div>

<div className="text-xs text-gray-400 mt-2">
  🕒 {formatMatchDuration(
    match.startedAt,
    match.endedAt
  )}
</div>
<div className="text-xs text-gray-400">
  ⌛ {getRelativeTime(match.endedAt)}
  </div>
</div>


              )
            )}
              </>
              )}
          </div>
        );
      })
    )}
  </div>
)}

{/* MATCH HISTORY VIEW END */}



{/* DASHBOARD VIEW START */}

{activeTab === "dashboard" && (

<DndContext
  onDragEnd={handleDragEnd}
>

<div className="grid md:grid-cols-3 gap-6">
  <DroppableQueue>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-2xl font-bold mb-4">
              Waiting Queue
            </h2>

            {sortedPlayers.length === 0 ? (
              <p>No players waiting</p>
            ) : (
              sortedPlayers.map((player, index) => (
                <div
  key={player.id}
  className="
    flex
    flex-col
    md:flex-row
    md:justify-between
    md:items-center
    border-b
    py-2
    gap-2
  "
>
                  <div>
<div className="flex items-center gap-2">
  <span>
    {index + 1}.
  </span>

  <DraggablePlayer
    player={player}
  />
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
{player.priority && (
  <div className="text-yellow-600 font-bold text-xs">
    ⭐ PRIORITY
  </div>

)}
                  </div>


<div className="flex flex-col gap-1 w-full md:w-auto">
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
  onClick={async () => {

    const updatedPlayers =
      players.map((p) =>
        p.id === player.id
          ? {
              ...p,
              priority: !p.priority,
            }
          : p
      );

    setPlayers(updatedPlayers);

    await saveDirectoryPlayer({
      ...player,
      priority: !player.priority,
    });
  }}
  className={`px-2 py-1 rounded text-sm ${
    player.priority
      ? "bg-yellow-500 text-white"
      : "bg-gray-200"
  }`}
>
  ⭐
</button>

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
</DroppableQueue>
          <div className="md:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              
              {courts.map((court) => (

<DroppableCourt
  key={court.id}
  courtId={court.id}
>

  <div
    className="bg-white rounded-xl shadow p-5"
  >
                  <h2 className="text-2xl font-bold mb-4">
                    Court {court.id}
                  </h2>

                {court.startedAt && (
  <div
    className={`mb-3 font-semibold ${
      getCourtMinutes(court.startedAt) >= 20
        ? "text-red-600"
        : getCourtMinutes(court.startedAt) >= 15
        ? "text-yellow-600"
        : "text-green-600"
    }`}
  >
    ⏱ {getCourtDuration(court.startedAt)}
  </div>
)}    

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
<DroppableCourtPlayer
  player={player}
>
  <DraggableCourtPlayer
    player={player}
  />
</DroppableCourtPlayer>
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
  <DroppableCourtPlayer
  player={player}
>
  <DraggableCourtPlayer
    player={player}
  />
</DroppableCourtPlayer>

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

</DroppableCourt>

))
}

            </div>
          </div>
        </div>
        </DndContext>
        )}

      </div> 
    </div>
  );
}