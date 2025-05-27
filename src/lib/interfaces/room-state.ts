export type Point = { x: number; y: number }
export type Stroke = { playerId: string; points: Point[]; color: string }

export default interface RoomState {
    name?: string;
    currentTurnIndex: number
    strokes: Stroke[]
}