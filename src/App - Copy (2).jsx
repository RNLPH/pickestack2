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
    return [...playerList].sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed;
      }

      return a.waitingSince - b.waitingSince;
    });
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
    let availablePlayers = sortPlayers(players);

    let changed = false;

    const updatedCourts = courts.map((court) => {
      if (
        court.players.length === 0 &&
        availablePlayers.length >= 4
      ) {
        changed = true;

        const selectedPlayers =
          availablePlayers.slice(0, 4);

        availablePlayers =
          availablePlayers.slice(4);

        return {
          ...court,
          players: selectedPlayers,
        };
      }

      return court;
    });

    if (changed) {
      setCourts(updatedCourts);
      setPlayers(availablePlayers);
    }
  };

  const endGame = (courtId) => {
    const court = courts.find(
      (c) => c.id === courtId
    );

    if (!court) return;

    const returningPlayers = court.players.map(
      (player) => ({
        ...player,
        gamesPlayed: player.gamesPlayed + 1,
        waitingSince: Date.now(),
      })
    );

    setPlayers((prev) =>
      sortPlayers([...prev, ...returningPlayers])
    );

    setCourts((prev) =>
      prev.map((court) =>
        court.id === courtId
          ? { ...court, players: [] }
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

  useEffect(() => {
    const emptyCourtExists = courts.some(
      (court) => court.players.length === 0
    );

    if (
      emptyCourtExists &&
      players.length >= 4
    ) {
      assignPlayers();
    }
  }, [players, courts]);

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
              Assign
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

          <div className="mt-4">
            <p>
              <strong>Courts:</strong> {courts.length}
            </p>

            <p>
              <strong>Players Waiting:</strong>{" "}
              {players.length}
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
                      Games Played: {player.gamesPlayed}
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
                    <div className="space-y-2">
                      {court.players.map((player) => (
                        <div
                          key={player.id}
                          className="bg-green-100 p-2 rounded"
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      endGame(court.id)
                    }
                    disabled={
                      court.players.length === 0
                    }
                    className="mt-4 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 rounded"
                  >
                    End Game
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}