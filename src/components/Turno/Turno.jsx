import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Turnos.css";

export default function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTurnos = async () => {
    try {
      const res = await api.getTurnos();
      setTurnos(res.data);
    } catch (error) {
      console.error("Error al obtener los turnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id_turno) => {
    try {
      await api.updateTurnoEstado(id_turno, "ingreso");
      fetchTurnos();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  useEffect(() => {
    fetchTurnos();
    const interval = setInterval(fetchTurnos, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Cargando turnos...</p>;

  return (
    <div className="turnos-container">
      <h2>Listado de Turnos</h2>

      <button className="refrescar-btn" onClick={fetchTurnos}>
        🔄 Refrescar
      </button>

      {turnos.length === 0 ? (
        <p>No hay turnos registrados.</p>
      ) : (
        <table className="turnos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Tipo de Uso</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id_turno}>
                <td>{turno.id_turno}</td>
                <td>{turno.fecha}</td>
                <td>{turno.hora}</td>
                <td>{turno.tipo_uso || "-"}</td>
                <td>{turno.nombre_completo || "Desconocido"}</td>
                <td>
                  <span className={`estado ${turno.estado}`}>
                    {turno.estado}
                  </span>
                </td>
                <td>
                  {turno.estado === "pendiente" && (
                    <button
                      className="accion-btn"
                      onClick={() => cambiarEstado(turno.id_turno)}
                    >
                      Marcar ingreso
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
