import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalTarjetas: 0,
    accesosHoy: 0,
    personasDentro: 0,
    ultimaActividad: "-",
    librosPrestados: 0,
    computadorasPrestadas: 0,
  });

  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================
  // FUNCIONES DE DATOS
  // ==========================
  const calcularPersonasDentro = (turnos) => {
    const movimientosPorUsuario = {};

    // Ordenar por fecha + hora
    const ordenados = [...turnos].sort((a, b) => {
      const fechaA = `${a.fecha} ${a.hora}`;
      const fechaB = `${b.fecha} ${b.hora}`;
      return fechaA.localeCompare(fechaB);
    });

    // Guardar último movimiento de cada usuario
    for (const mov of ordenados) {
      movimientosPorUsuario[mov.id_usuario] = mov.movimiento;
    }

    return Object.values(movimientosPorUsuario).filter(
      (m) => m === "entrada"
    ).length;
  };

  const formatDateTime = (fecha, hora) => {
    if (!fecha || !hora) return "-";
    const date = new Date(`${fecha}T${hora}`);
    return date.toLocaleString("es-AR");
  };

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // === Traer datos ===
      const [usuariosRes, turnosRes, librosRes, prestamosCompuRes] =
        await Promise.all([
          api.getUsers(),
          api.getTurnos(),
          api.getLibros(),
          api.getPrestamosComputadora(),
        ]);

      const usuarios = usuariosRes.data || [];
      const turnos = turnosRes.data || [];
      const libros = librosRes.data || [];
      const prestamosCompu = prestamosCompuRes.data || [];

      const totalUsuarios = usuarios.length;
      const totalTarjetas = usuarios.filter((u) => u.uid_tarjeta).length;

      const hoy = new Date().toISOString().split("T")[0];
      const accesosHoy = turnos.filter((t) => t.fecha?.startsWith(hoy));

      const personasDentro = calcularPersonasDentro(turnos);
      const ultimaActividad =
        accesosHoy.length > 0
          ? accesosHoy[accesosHoy.length - 1].hora
          : "-";

      const librosPrestados = libros.filter(
        (l) => l.estado === "en_prestamo"
      ).length;

      const computadorasPrestadas = prestamosCompu.filter(
        (p) => !p.hora_fin
      ).length;

      setStats({
        totalUsuarios,
        totalTarjetas,
        accesosHoy: accesosHoy.length,
        personasDentro,
        ultimaActividad: formatDateTime(hoy, ultimaActividad),
        librosPrestados,
        computadorasPrestadas,
      });

      setAccesos([...accesosHoy].reverse());
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError("Error al cargar datos del panel");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // ==========================
  // CARGA INICIAL + POLLING
  // ==========================
  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 3000);
    return () => clearInterval(interval);
  }, []);

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="dashboard">
      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* === TARJETAS DE ESTADÍSTICAS === */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Usuarios</h3>
              <p>{stats.totalUsuarios}</p>
            </div>
            <div className="stat-card">
              <h3>Tarjetas</h3>
              <p>{stats.totalTarjetas}</p>
            </div>
            <div className="stat-card">
              <h3>Accesos Hoy</h3>
              <p>{stats.accesosHoy}</p>
            </div>
            <div className="stat-card">
              <h3>Personas Dentro</h3>
              <p>{stats.personasDentro}</p>
            </div>
            <div className="stat-card">
              <h3>Libros en Préstamo</h3>
              <p>{stats.librosPrestados}</p>
            </div>
            <div className="stat-card">
              <h3>Computadoras Prestadas</h3>
              <p>{stats.computadorasPrestadas}</p>
            </div>
            <div className="stat-card wide">
              <h3>Última Actividad</h3>
              <p>{stats.ultimaActividad}</p>
            </div>
          </div>

          {/* === TABLA DE ACCESOS === */}
          <div className="table-header">
            <h2 className="table-title">
              <i className="fa-solid fa-list"></i> Registro de Accesos
            </h2>
            <span className="record-count">{accesos.length} registros</span>
          </div>

          <div className="table-card">
            {accesos.length === 0 ? (
              <p className="no-records">No hay registros de acceso hoy.</p>
            ) : (
              <div className="table-wrapper">
                <table className="access-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>UID</th>
                      <th>Movimiento</th>
                      <th>Día</th>
                      <th>Hora</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accesos.map((a, i) => (
                      <tr key={i}>
                        <td>{a.id_usuario}</td>
                        <td>{a.nombre_completo || "-"}</td>
                        <td>{a.uid_tarjeta || "-"}</td>
                        <td className={`mov-${a.movimiento}`}>
                          {a.movimiento === "entrada" ? "Entrada" : "Salida"}
                        </td>
                        <td>{a.fecha}</td>
                        <td>{a.hora}</td>
                        <td>{`${a.fecha} ${a.hora}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <div className="actions">
        <button onClick={() => fetchDashboardData(false)}>Actualizar</button>
      </div>
    </div>
  );
}
