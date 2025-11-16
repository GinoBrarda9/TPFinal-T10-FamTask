import React from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl font-bold mb-4 text-green-600">
        Google Calendar conectado ✔️
      </h1>
      <button
        className="bg-amber-500 px-4 py-2 rounded-lg text-white"
        onClick={() => navigate("/calendar")}
      >
        Volver al calendario
      </button>
    </div>
  );
}
