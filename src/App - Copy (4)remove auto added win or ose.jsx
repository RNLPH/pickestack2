import { useEffect, useRef, useState } from "react";

const STORAGE_KEYS = {
  PLAYERS: "picklestack_players",
  COURTS: "picklestack_courts",
};

const DEFAULT_COURTS = [
  { id: 1, players: [] },
  { id: 2, players: [] },
];

export default function App() {
  const inputRef = useRef(null);

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [courts, setCourts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURTS);
    return saved ? JSON.parse(saved) : DEFAULT_COURTS;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.PLAYERS,
      JSON.stringify(players)
    );
  }, [players]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.COURTS,
      JSON.stringify(courts)
    );
  }, [courts]);

  const sortPlayers = (playerList) => {
  const grouped = {};

  playerList.forEach((player) => {
    if (!grouped[player.gamesPlayed]) {
      grouped[player.gamesPlayed] = [];
    }

    grouped[player.gamesPlayed].push(player);
  });

  return Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((gamesPlayed) =>
      shufflePlayers(grouped[gamesPlayed])
    );
};


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


  const addPlayer = () => {
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

    setPlayers((prev) => [
      ...prev,
      {
  id: crypto.randomUUID(),
  name: trimmedName,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  waitingSince: Date.now(),
},
    ]);

    setName("");
    setError("");

    inputRef.current?.focus();
  };

  const removePlayer = (id) => {
    setPlayers((prev) =>
      prev.filter((player) => player.id !== id)
    );
  };

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

  const selectedPlayers = shufflePlayers(
    sorted.slice(0, 4)
  );

  setCourts((prev) =>
    prev.map((court) =>
      court.id === emptyCourt.id
        ? {
            ...court,
            players: selectedPlayers,
          }
        : court
    )
  );

  setPlayers(sorted.slice(4));
};

const endGame = (courtId, winningTeam) => {
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

  const resetAll = () => {
    const confirmed = window.confirm(
      "Reset all courts and players?"
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEYS.PLAYERS);
    localStorage.removeItem(STORAGE_KEYS.COURTS);

    setPlayers([]);
    setError("");
    setName("");
    setCourts(DEFAULT_COURTS);
  };

const sortedPlayers = sortPlayers(players);

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

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8">
          🏓 PickleStack
        </h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              placeholder="Player Name"
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addPlayer();
                }
              }}
              className="border rounded p-2 flex-1"
            />

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
              onClick={resetAll}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
            >
              Reset
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

        <div className="grid md:grid-cols-3 gap-6">
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
                  </div>

                  <button
                    onClick={() =>
                      removePlayer(player.id)
                    }
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
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
          className="bg-blue-100 p-2 rounded mb-1"
        >
          {player.name}
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
          className="bg-purple-100 p-2 rounded mb-1"
        >
          {player.name}
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
      </div>
    </div>
  );
}