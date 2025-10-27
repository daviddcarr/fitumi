-- Create strokes table for efficient real-time stroke synchronization
CREATE TABLE IF NOT EXISTS public.strokes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    points JSONB NOT NULL, -- Array of {x, y} points (normalized 0-1)
    color TEXT NOT NULL,
    stroke_order INTEGER NOT NULL, -- Order of strokes within the room
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_strokes_room_id ON public.strokes(room_id);
CREATE INDEX idx_strokes_room_order ON public.strokes(room_id, stroke_order);
CREATE INDEX idx_strokes_created_at ON public.strokes(created_at);

-- Enable Row Level Security
ALTER TABLE public.strokes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read strokes in a room
CREATE POLICY "Anyone can view strokes in a room"
    ON public.strokes
    FOR SELECT
    USING (true);

-- Create policy to allow players to insert strokes
CREATE POLICY "Players can insert strokes"
    ON public.strokes
    FOR INSERT
    WITH CHECK (true);

-- Enable real-time for the strokes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.strokes;

-- Add comment
COMMENT ON TABLE public.strokes IS 'Individual drawing strokes for each room, optimized for real-time synchronization';
