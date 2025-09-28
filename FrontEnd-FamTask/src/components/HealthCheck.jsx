import React, { useState } from "react";

const HealthCheck = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testConnection = async () => {
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("http://localhost:8080/health");

      if (response.ok) {
        const result = await response.text(); // Como tu backend devuelve un String
        setStatus(`✅ Conexión exitosa! Backend respondió: "${result}"`);
      } else {
        setError(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
      }
    } catch (err) {
      setError(`❌ Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>
        🔗 Test de Conexión Frontend ↔ Backend
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <p>
          <strong>Frontend:</strong> React + Vite (puerto 5173)
        </p>
        <p>
          <strong>Backend:</strong> Spring Boot (puerto 8080)
        </p>
        <p>
          <strong>Endpoint:</strong> GET /health
        </p>
      </div>

      <button
        onClick={testConnection}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {loading ? "🔄 Probando conexión..." : "🚀 Probar Conexión"}
      </button>

      {/* Resultado */}
      {status && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            color: "#155724",
          }}
        >
          {status}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      {/* Instrucciones */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <h3>📋 Checklist:</h3>
        <ul>
          <li>✅ Backend Spring Boot corriendo en puerto 8080</li>
          <li>✅ Endpoint /health disponible</li>
          <li>⚠️ CORS configurado (si hay error de CORS)</li>
          <li>✅ Frontend corriendo en puerto 5173</li>
        </ul>

        <h3>🚨 Posibles errores:</h3>
        <ul>
          <li>
            <strong>CORS error:</strong> Agrega @CrossOrigin en tu controller
          </li>
          <li>
            <strong>Connection refused:</strong> Backend no está corriendo
          </li>
          <li>
            <strong>404:</strong> Verifica que el endpoint /health existe
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HealthCheck;
