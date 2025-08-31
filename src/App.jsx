// src/App.jsx
import React from "react";
import MainLoader from "./components/MainLoader";
import FloatingPlayer from "./components/FloatingPlayer";

export default function App() {
  return (
    <div className="relative min-h-screen">
      <MainLoader />       {/* optional for now */}
      <FloatingPlayer />   {/* always visible */}
    </div>
  );
}
