import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import WordGenerator from "./WordGenerator";
import "../index.css";

const socket = io("http://localhost:4000");

function DrawingPage() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [currentWord, setCurrentWord] = useState("");

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 800;
        canvas.height = 500;
        ctxRef.current = canvas.getContext("2d");

        socket.on("draw", ({ x, y }) => {
            ctxRef.current.lineTo(x, y);
            ctxRef.current.stroke();
        });

        return () => socket.off("draw");
    }, []);

    const startDrawing = (e) => {
        setDrawing(true);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    };

    const draw = (e) => {
        if (!drawing) return;
        ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctxRef.current.stroke();
        socket.emit("draw", { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    };

    const stopDrawing = () => setDrawing(false);

    return (
        <div className="drawing-page">
            <WordGenerator onNewWord={setCurrentWord} />
            <h3>✏️ You are drawing: {currentWord}</h3>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                className="canvas"
            />
        </div>
    );
}

export default DrawingPage;
