import { db } from "./database";

export async function saveMatch(match) {
  return await db.matches.add(match);
}

export async function getMatches() {
  return await db.matches.toArray();
}