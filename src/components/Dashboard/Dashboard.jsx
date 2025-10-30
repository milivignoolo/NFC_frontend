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

  const formatDateTime = (fecha, hora) => {
    if (!fecha || !hora) return "-";
    try {
      const date = new Date(`${fecha}T${hora}`);
      return date.toLocaleString("es-AR");
    } catch (e) {
      return `${fecha} ${hora}`;
    }
  };

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      console.log("🔄 Cargando datos del dashboard...");

      // === Traer datos básicos que sabemos que funcionan ===
      const [usuariosRes, librosRes, prestamosCompuRes] = await Promise.all([
        api.getUsers().catch(err => {
          console.warn("Error cargando usuarios:", err);
          return { data: [] };
        }),
        api.getLibros().catch(err => {
          console.warn("Error cargando libros:", err);
          return { data: [] };
        }),
        api.getPrestamosComputadora().catch(err => {
          console.warn("Error cargando préstamos computadoras:", err);
          return { data: [] };
        })
      ]);

      const usuarios = usuariosRes.data || [];
      const libros = librosRes.data || [];
      const prestamosCompu = prestamosCompuRes.data || [];

      // === Intentar cargar datos del dashboard (pueden fallar si los endpoints no existen) ===
      let accesosHoy = 0;
      let personasDentro = 0;
      let ultimaActividadData = null;
      let accesosDetalle = [];

      try {
        const [accesosHoyRes, personasDentroRes, ultimaActividadRes, accesosDetalleRes] = await Promise.all([
          api.getAccesosHoy().catch(err => {
            console.warn("Endpoint accesos-hoy no disponible:", err);
            return { data: { accesosHoy: 0 } };
          }),
          api.getPersonasDentro().catch(err => {
            console.warn("Endpoint personas-dentro no disponible:", err);
            return { data: { personasDentro: 0 } };
          }),
          api.getUltimaActividad().catch(err => {
            console.warn("Endpoint ultima-actividad no disponible:", err);
            return { data: null };
          }),
          api.getAccesosHoyDetalle().catch(err => {
            console.warn("Endpoint accesos-hoy-detalle no disponible:", err);
            return { data: [] };
          })
        ]);

        accesosHoy = accesosHoyRes.data?.accesosHoy || 0;
        personasDentro = personasDentroRes.data?.personasDentro || 0;
        ultimaActividadData = ultimaActividadRes.data;
        accesosDetalle = accesosDetalleRes.data || [];
      } catch (dashboardError) {
        console.warn("Algunos endpoints del dashboard no están disponibles");
      }

      setStats({
        totalUsuarios: usuarios.length,
        totalTarjetas: usuarios.filter((u) => u.uid_tarjeta).length,
        accesosHoy,
        personasDentro,
        ultimaActividad: ultimaActividadData 
          ? formatDateTime(ultimaActividadData.fecha, ultimaActividadData.hora)
          : "-",
        librosPrestados: libros.filter(l => l.estado === "en_prestamo").length,
        computadorasPrestadas: prestamosCompu.filter(p => p.estado === 'en_proceso').length,
      });

      setAccesos(accesosDetalle);
      console.log("✅ Datos del dashboard cargados correctamente");

    } catch (err) {
      console.error("Error crítico al cargar estadísticas:", err);
      setError("Error al cargar datos del panel: " + (err.message || "Error desconocido"));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 10000); // Cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
          <br />
          <small>Algunos endpoints del dashboard pueden no estar disponibles todavía.</small>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando datos del dashboard...</div>
      ) : (
        <>
          {/* === TARJETAS DE ESTADÍSTICAS === */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Usuarios</h3>
              <p>{stats.totalUsuarios}</p>
            </div>
            <div className="stat-card">
              <h3>🎫 Tarjetas</h3>
              <p>{stats.totalTarjetas}</p>
            </div>
            <div className="stat-card">
              <h3>🚪 Accesos Hoy</h3>
              <p>{stats.accesosHoy}</p>
            </div>
            <div className="stat-card">
              <h3>🏠 Personas Dentro</h3>
              <p>{stats.personasDentro}</p>
            </div>
            <div className="stat-card">
              <h3>📚 Libros en Préstamo</h3>
              <p>{stats.librosPrestados}</p>
            </div>
            <div className="stat-card">
              <h3>💻 Computadoras Prestadas</h3>
              <p>{stats.computadorasPrestadas}</p>
            </div>
            <div className="stat-card wide">
              <h3>⏰ Última Actividad</h3>
              <p>{stats.ultimaActividad}</p>
            </div>
          </div>

          {/* === TABLA DE ACCESOS === */}
          <div className="table-header">
            <h2 className="table-title">
              <i className="fa-solid fa-list"></i> Registro de Accesos de Hoy
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
                      <th>Usuario</th>
                      <th>UID</th>
                      <th>Movimiento</th>
                      <th>Tipo</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accesos.map((acceso) => (
                      <tr key={acceso.id_entrada}>
                        <td>{acceso.nombre_completo || "Sin usuario"}</td>
                        <td className="uid-cell">{acceso.uid_tarjeta || "-"}</td>
                        <td className={`mov-${acceso.movimiento}`}>
                          {acceso.movimiento === "entrada" ? "🟢 Entrada" : "🔴 Salida"}
                        </td>
                        <td>{acceso.tipo_uso || "-"}</td>
                        <td>{acceso.hora || "-"}</td>
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
        <button onClick={() => fetchDashboardData(true)}>🔄 Actualizar</button>
      </div>
    </div>
  );
}