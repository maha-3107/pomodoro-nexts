import { useState, useEffect } from "react";

export default function Timer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [quote, setQuote] = useState("");
  const [dailyCount, setDailyCount] = useState(0);

  // Save a completed pomodoro to localStorage
  const savePomodoroToLocalStorage = () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = JSON.parse(localStorage.getItem("pomodoroData") || "{}");
    stored[today] = (stored[today] || 0) + 1;
    localStorage.setItem("pomodoroData", JSON.stringify(stored));
    setDailyCount(stored[today]); // update the UI
  };

  const startTimer = () => {
    if (time > 0) setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(25 * 60);
    setQuote("");
  };

  useEffect(() => {
    let timer;

    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && time === 0) {
      savePomodoroToLocalStorage(); // ✅ save on complete
      setIsRunning(false);
      fetchQuote();
    }

    return () => clearInterval(timer);
  }, [isRunning, time]);

  // Load today's pomodoro count on page load
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = JSON.parse(localStorage.getItem("pomodoroData") || "{}");
    setDailyCount(stored[today] || 0);
  }, []);

  const fetchQuote = async () => {
    try {
      const res = await fetch("/api/quote");
      const data = await res.json();
      setQuote(data.quote || "Stay motivated!");
    } catch (err) {
      setQuote("Keep going! You're doing great!");
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Pomodoro Timer</h1>
      <div className="text-6xl mb-4">{formatTime(time)}</div>
      <div className="flex justify-center gap-4 mb-6">
        <button onClick={startTimer} className="bg-green-500 px-6 py-2 text-white rounded">
          Start
        </button>
        <button onClick={resetTimer} className="bg-red-500 px-6 py-2 text-white rounded">
          Reset
        </button>
      </div>
      {quote && (
        <div className="bg-yellow-100 p-4 rounded shadow-md text-gray-800">
          <p className="italic">"{quote}"</p>
        </div>
      )}
      <p className="mt-4 text-gray-600">Pomodoros today: {dailyCount}</p>
    </div>
  );
}
