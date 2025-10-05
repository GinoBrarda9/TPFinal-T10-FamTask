import React, { useEffect, useState } from "react";

export default function TokenPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    // Traemos el token desde localStorage
    const savedToken = localStorage.getItem("token");
    setToken(savedToken || "No hay token guardado");
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Token JWT guardado</h1>
      <p style={{ wordBreak: "break-all" }}>{token}</p>
    </div>
  );
}
