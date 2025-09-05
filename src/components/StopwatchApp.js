import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock } from 'lucide-react';

const StopwatchApp = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    // Apple-style shows M:SS.CS (no leading zero on minutes typically)
    const minStr = String(minutes);
    const secStr = String(seconds).padStart(2, '0');
    const csStr = String(ms).padStart(2, '0');
    return `${minStr}:${secStr}.${csStr}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning && time > 0) {
      const lapTime = time;
      const lapNumber = laps.length + 1;
      const previousLapTime = laps.length > 0 ? laps[laps.length - 1].totalTime : 0;
      const splitTime = lapTime - previousLapTime;

      setLaps(prevLaps => [
        ...prevLaps,
        {
          number: lapNumber,
          totalTime: lapTime,
          splitTime: splitTime
        }
      ]);
    }
  };

  const getFastestLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((fastest, current) =>
      current.splitTime < fastest.splitTime ? current : fastest
    );
  };

  const getSlowestLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((slowest, current) =>
      current.splitTime > slowest.splitTime ? current : slowest
    );
  };

  const fastestLap = getFastestLap();
  const slowestLap = getSlowestLap();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-xl">
        {/* Header (small) */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Clock className="text-slate-300" />
          <h1 className="text-slate-100 text-lg font-medium tracking-wide">Stopwatch</h1>
        </div>

        {/* Main card like iOS: white/blur background with rounded edges */}
        <div className="bg-white/6 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
          {/* big circular dial */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* outer ring */}
              <div className="w-56 h-56 rounded-full bg-gradient-to-b from-white/6 to-white/3 border border-white/8 flex items-center justify-center shadow-inner"
                   style={{ boxShadow: 'inset 0 6px 18px rgba(255,255,255,0.02), 0 8px 30px rgba(2,6,23,0.6)' }}>
                {/* subtle inner ring */}
                <div className="w-48 h-48 rounded-full bg-gradient-to-b from-slate-900/60 to-slate-900/70 flex items-center justify-center">
                  {/* digital time */}
                  <div className="text-center">
                    <div className="font-mono text-5xl text-white font-extralight tracking-wider" style={{ letterSpacing: '0.02em' }}>
                      {formatTime(time)}
                    </div>
                    <div className="text-slate-400 text-sm mt-1">Lap & Timer</div>
                  </div>
                </div>
              </div>

              {/* tiny center glow (like Apple) */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <div className="w-20 h-2 rounded-full bg-gradient-to-r from-slate-600/30 to-slate-300/20"></div>
              </div>
            </div>

            {/* controls row: Reset | Start/Pause | Lap */}
            <div className="flex items-center justify-between w-full mt-6">
              {/* Left: Reset (small) */}
              <button
                onClick={handleReset}
                className="flex-1 mr-3 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-sm text-slate-200 hover:bg-white/8 transition"
                aria-label="Reset"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw size={16} />
                  Reset
                </div>
              </button>

              {/* Center: Start / Pause (primary pill) */}
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex-none px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-[0_8px_30px_rgba(16,185,129,0.18)] transition transform active:scale-95"
                  aria-label="Start"
                >
                  <div className="flex items-center gap-3">
                    <Play size={18} />
                    <span className="text-base">Start</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex-none px-8 py-3 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-[0_8px_30px_rgba(245,158,11,0.18)] transition transform active:scale-95"
                  aria-label="Pause"
                >
                  <div className="flex items-center gap-3">
                    <Pause size={18} />
                    <span className="text-base">Pause</span>
                  </div>
                </button>
              )}

              {/* Right: Lap (small) */}
              <button
                onClick={handleLap}
                disabled={!isRunning || time === 0}
                className="flex-1 ml-3 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-sm text-slate-200 disabled:opacity-50 hover:bg-white/8 transition flex items-center justify-center gap-2"
                aria-label="Lap"
              >
                <Square size={16} />
                Lap
              </button>
            </div>
          </div>
        </div>

        {/* Lap list card (iOS-style list) */}
        <div className="mt-6 bg-white/4 backdrop-blur-sm border border-white/8 rounded-2xl p-4 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-slate-200 font-medium">Laps</h2>
            <span className="text-slate-400 text-sm">{laps.length}</span>
          </div>

          {/* If no laps, show subtle hint */}
          {laps.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No laps yet — press Lap while timer is running</div>
          ) : (
            <ul className="divide-y divide-white/8">
              {laps.slice().reverse().map((lap) => (
                <li key={lap.number} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-slate-300 font-semibold">#{lap.number}</div>
                    <div className="flex flex-col">
                      <span className="text-white font-mono font-semibold">{formatTime(lap.splitTime)}</span>
                      <span className="text-slate-400 text-xs">Total {formatTime(lap.totalTime)}</span>
                    </div>
                  </div>

                  
                </li>
              ))}
            </ul>
          )}

          
        </div>

        {/* Footer small note */}
        <div className="mt-4 text-center text-slate-500 text-sm">
          Precision to centiseconds • Inspired by iOS Stopwatch
        </div>
      </div>
    </div>
  );
};

export default StopwatchApp;
