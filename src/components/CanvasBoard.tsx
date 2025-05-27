import React, { useRef, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Player } from '../pages/GameRoom';
import type RoomState from '../lib/interfaces/room-state';
import type { Point, Stroke } from '../lib/interfaces/room-state';

interface CanvasBoardProps {
    roomId: string
    playerId: string
    players: Player[]
    state: RoomState
}

export default function CanvasBoard({
    roomId,
    playerId,
    players,
    state
}: CanvasBoardProps) {
    const { currentTurnIndex, strokes } = state
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentStroke, setCurrentStroke] = useState<Point[]>([])

    const myTurn = players[currentTurnIndex].id === playerId

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return

        context.clearRect(0, 0, canvas.width, canvas.height)

        // Draw Saved Strokes
        strokes.forEach((stroke) => {
            context.strokeStyle = stroke.color
            context.lineWidth = 2
            context.beginPath()
            stroke.points.forEach((point, index) => {
                if (index === 0) {
                    context.moveTo(point.x, point.y)
                } else {
                    context.lineTo(point.x, point.y)
                }
            })
            context.stroke()
        })

        // Draw Current Strokes
        if (currentStroke.length > 0) {
            context.strokeStyle = players[currentTurnIndex].color
            context.lineWidth = 2
            context.beginPath()
            currentStroke.forEach((point, index) => {
                if (index === 0) {
                    context.moveTo(point.x, point.y)
                } else {
                    context.lineTo(point.x, point.y)
                }
            })
            context.stroke()
        }
        

    }, [strokes, currentStroke, players, currentTurnIndex])


    const handleMouseDown = (e: React.MouseEvent) => {
        if (!myTurn) return

        setIsDrawing(true)
        setCurrentStroke([{
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY
        }])
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!myTurn || !isDrawing) return

        setCurrentStroke((prevStroke) => [
            ...prevStroke,
            {
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY
            }
        ])
    }

    const handleMouseUp = async () => {
        if (!isDrawing) return
        setIsDrawing(false)

        const newStroke: Stroke = { playerId, points: currentStroke, color: players[currentTurnIndex].color }
        const payload: RoomState = { 
            name: state.name,
            strokes: [...strokes, newStroke],
            currentTurnIndex: (currentTurnIndex + 1) % players.length
        }

        await supabase
            .from('rooms')
            .update({ state: payload })
            .eq('id', roomId)

        setCurrentStroke([])
    }

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            />
    )

}