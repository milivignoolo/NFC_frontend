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

  const renderInfo = (info) => (
    <ul className="uid-info-list">
      {Object.entries(info).map(([key, value]) => (
        <li key={key}>
          <strong>{key}:</strong>{" "}
          {Array.isArray(value)
            ? value.join(", ")
            : typeof value === "object" && value !== null
            ? renderInfo(value)
            : value || "-"}
        </li>
      ))}
    </ul>
  );

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
      <h2 className="uid-title">UID Checker</h2>

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
