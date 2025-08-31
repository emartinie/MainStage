import React, { useState, useRef, useEffect } from "react";

export default function FloatingPlayer() {
  const playlist = [
    { title: "Torah", eng: "/audio/torah_eng.mp3", heb: "/audio/torah_heb.mp3", grk: "/audio/torah_grk.mp3" },
    { title: "Prophets", eng: "/audio/prophets_eng.mp3", heb: "/audio/prophets_heb.mp3", grk: "/audio/prophets_grk.mp3" },
    { title: "Gospels", eng: "/audio/gospels_eng.mp3", heb: "/audio/gospels_heb.mp3", grk: "/audio/gospels_grk.mp3" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lang, setLang] = useState("eng");
  const audioRef = useRef(null);
  const playerRef = useRef(null);

  const playNext = () => setCurrentIndex((prev) => (prev + 1) % playlist.length);
  const cycleLanguage = () => setLang((prev) => (prev === "eng" ? "heb" : prev === "heb" ? "grk" : "eng"));

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    let isDragging = false, startX, startY, origX, origY;

    const onMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = player.getBoundingClientRect();
      origX = rect.left; origY = rect.top;
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      player.style.left = `${origX + e.clientX - startX}px`;
      player.style.top = `${origY + e.clientY - startY}px`;
    };

    const onMouseUp = () => { isDragging = false; document.body.style.userSelect = ""; };

    player.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      player.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const currentTrack = playlist[currentIndex][lang];

  return (
    <div
      ref={playerRef}
      className="fixed bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 w-72 cursor-move z-50"
      style={{ bottom: "1rem", right: "1rem" }}
    >
      <p className="font-semibold mb-2 text-gray-900 dark:text-gray-200">
        {playlist[currentIndex].title} ({lang.toUpperCase()})
      </p>
      <audio
        ref={audioRef}
        controls
        autoPlay
        src={currentTrack}
        className="w-full mb-2"
        onEnded={playNext}
      />
      <div className="flex justify-between">
        <button onClick={playNext} className="px-3 py-1 bg-blue-600 text-white rounded">
          Next
        </button>
        <button onClick={cycleLanguage} className="px-3 py-1 bg-green-600 text-white rounded">
          Lang
        </button>
      </div>
    </div>
  );
}
