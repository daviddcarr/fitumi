/**
 * Database models for Supabase tables
 */

import type { Point } from "./room-state";
import type RoomState from "./room-state";

/**
 * Stroke record as stored in the database
 */
export interface DBStroke {
  id: string;
  room_id: string;
  player_id: string;
  points: Point[];
  color: string;
  stroke_order: number;
  created_at: string;
}

/**
 * Stroke insert payload (without auto-generated fields)
 */
export interface StrokeInsert {
  room_id: string;
  player_id: string;
  points: Point[];
  color: string;
  stroke_order: number;
}

/**
 * Room record from database
 */
export interface DBRoom {
  id: string;
  code: string;
  state: RoomState;
  created_at: string;
}

/**
 * Player record from database
 */
export interface DBPlayer {
  id: string;
  room_id: string;
  name: string;
  color: string;
  slug: string;
  leftHanded: boolean;
  isObserver: boolean;
  created_at: string;
}
