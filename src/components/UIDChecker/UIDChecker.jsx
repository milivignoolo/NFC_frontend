import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import "./UIDChecker.css";

export default function UIDChecker() {
  const [ultimoUID, setUltimoUID] = useState("");
  const [estadoUID, setEstadoUID] = useState(null);
  const [copiadoUID, setCopiadoUID] = useState(false);
  const [copiadoID, setCopiadoID] = useState(false);
  const [cargando, setCargando] = useState(true);

  const obtenerYVerificarUID = useCallback(async (uidForzado = null) => {
    try {
      setCargando(true);
      setCopiadoUID(false);
      setCopiadoID(false);

      const uid = uidForzado
        ? uidForzado
        : (await api.getUltimoUID()).data?.uid_tarjeta || "";

      setUltimoUID(uid);

      if (!uid) {
        setEstadoUID(null);
        setCargando(false);
        return;
      }

      const resVerificacion = await api.verificarUID(uid);
      setEstadoUID(resVerificacion.data);
      setCargando(false);
    } catch (err) {
      console.error("Error verificando UID:", err);
      setEstadoUID(null);
      setCargando(false);
    }
  }, []);

  const copiarUID = () => {
    navigator.clipboard.writeText(ultimoUID)
      .then(() => setCopiadoUID(true))
      .catch(() => setCopiadoUID(false));
  };

  const copiarID = () => {
    if (!estadoUID || !estadoUID.info) return;

    let id = "";
    if (estadoUID.tipo === "usuario") id = estadoUID.info.id_usuario;
    if (estadoUID.tipo === "libro") id = estadoUID.info.id_libro;
    if (estadoUID.tipo === "computadora") id = estadoUID.info.id_computadora;

    if (!id) return;

    navigator.clipboard.writeText(id)
      .then(() => setCopiadoID(true))
      .catch(() => setCopiadoID(false));
  };

  const renderInfo = (info) => {
    const entries = Object.entries(info).filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if ((Array.isArray(value) && value.length === 0) || value === "[]") return false;
      if (typeof value === "object" && Object.keys(value).length === 0) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    });

    if (entries.length === 0) return null;

    return (
      <div className="uid-info-grid">
        {entries.map(([key, value]) => {
          let formattedValue = value;

          // Intentar parsear JSON si es un string
          if (typeof value === "string") {
            try {
              const temp = JSON.parse(value);
              if (Array.isArray(temp)) formattedValue = temp;
            } catch { /* no es JSON, queda tal cual */ }
          }

          if (Array.isArray(formattedValue)) {
            formattedValue = formattedValue.join(", ");
          } else if (typeof formattedValue === "object" && formattedValue !== null) {
            formattedValue = renderInfo(formattedValue);
          }

          if (!formattedValue || formattedValue === "[]" || formattedValue === "{}") return null;

          return (
            <div key={key} className="uid-info-item">
              <span className="uid-info-key">
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </span>
              <span className="uid-info-value">{formattedValue}</span>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    obtenerYVerificarUID();

    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => console.log("Conectado al servidor WebSocket");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.tipo === "lectura_nfc" && data.data?.uid_tarjeta) {
          obtenerYVerificarUID(data.data.uid_tarjeta);
        }
      } catch (err) {
        console.error("Error procesando mensaje WS:", err);
      }
    };

    ws.onclose = () => console.log("Conexión WebSocket cerrada");

    return () => ws.close();
  }, [obtenerYVerificarUID]);

  return (
    <div className="uid-container">
      <h2 className="uid-title">Verificador de UID</h2>

      {cargando ? (
        <p className="uid-loading">Cargando...</p>
      ) : (
        <>
          {ultimoUID ? (
            <div className="uid-content">
              <p className="uid-last">
                <strong>Último UID registrado:</strong> {ultimoUID}{" "}
                <button className="uid-btn uid-btn-copy" onClick={copiarUID}>
                  {copiadoUID ? "Copiado" : "Copiar UID"}
                </button>
              </p>

              {estadoUID ? (
                <div className="uid-details">
                  <h3 className="uid-subtitle">Detalles del UID:</h3>
                  <p><strong>Tipo:</strong> {estadoUID.tipo}</p>
                  {estadoUID.info && renderInfo(estadoUID.info)}
                  <button className="uid-btn uid-btn-copy-id" onClick={copiarID}>
                    {copiadoID ? "ID Copiado" : "Copiar ID"}
                  </button>
                </div>
              ) : (
                <p className="uid-free">Estado: Libre</p>
              )}
            </div>
          ) : (
            <p className="uid-empty">No hay registros de UID.</p>
          )}

          <button className="uid-btn uid-btn-refresh" onClick={() => obtenerYVerificarUID()}>
            Refrescar manualmente
          </button>
        </>
      )}
    </div>
  );
}
