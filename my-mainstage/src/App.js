import React from "react";
import FloatingPlayer from "./components/FloatingPlayer";
<--import MainLoader from "./components/MainLoader"; // optional for now-->

export default function App() {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <MainLoader />          {/* optional, placeholder */}
      <FloatingPlayer />      {/* floating player always visible */}
    </div>
  );
}
