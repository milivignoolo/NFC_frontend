// UIDChecker.jsx
import { useEffect, useState } from "react";
import { api } from "../../services/api"; // Ajusta la ruta según tu proyecto

export default function UIDChecker() {
  const [ultimoUID, setUltimoUID] = useState("");
  const [estadoUID, setEstadoUID] = useState(null); // { tipo: "usuario"/"libro"/"computadora"/"libre", info: {...} }
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Función para copiar al portapapeles
  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(ultimoUID)
      .then(() => setCopiado(true))
      .catch(() => setCopiado(false));
  };

  // Función para obtener y verificar UID
  const obtenerYVerificarUID = async () => {
    try {
      setCargando(true);
      setCopiado(false);

      // 1️⃣ Obtener el último UID
      const resUltimo = await api.getUltimoUID();
      const uid = resUltimo.data?.uid_tarjeta || "";
      setUltimoUID(uid);

      if (!uid) {
        setEstadoUID(null);
        setCargando(false);
        return;
      }

      // 2️⃣ Verificar si está asociado
      const resVerificacion = await api.verificarUID(uid);
      setEstadoUID(resVerificacion.data);

      setCargando(false);
    } catch (err) {
      console.error("Error verificando UID:", err);
      setEstadoUID(null);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerYVerificarUID();
  }, []);

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px" }}>
      <h2>UID Checker</h2>
      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          {ultimoUID ? (
            <>
              <p><strong>Último UID registrado:</strong> {ultimoUID}</p>
              <p><strong>Estado:</strong> {estadoUID?.tipo || "Desconocido"}</p>

                <button onClick={copiarAlPortapapeles}>
                  {copiado ? "Copiado ✅" : "Copiar UID"}
                </button>
            </>
          ) : (
            <p>No hay registros de UID.</p>
          )}

          <button style={{ marginTop: "1rem" }} onClick={obtenerYVerificarUID}>
            Refrescar
          </button>
        </>
      )}
    </div>
  );
}
