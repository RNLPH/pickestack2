import Dexie from "dexie";

export const db = new Dexie(
  "PickleStackDB"
);

db.version(2).stores({
  players: "id,name",
  directory: "id,name",
});