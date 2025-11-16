import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem("token", token);
    }
    navigate("/calendar");
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-lg text-amber-600">Conectando con Google...</p>
    </div>
  );
}
