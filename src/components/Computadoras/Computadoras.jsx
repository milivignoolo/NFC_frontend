import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function Computadoras() {
  const [computadoras, setComputadoras] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [prestamos, setPrestamos] = useState([]);

  const [nuevaCompu, setNuevaCompu] = useState({
    marca: "",
    modelo: "",
    sistema_operativo: "",
    observacion: "",
    uid_tarjeta: "",
    estado:"disponible",
  });

  const [nuevoPrestamo, setNuevoPrestamo] = useState({
    id_usuario: "",
    uid_tarjeta: "",
    operador: "",
  });

  const [mensaje, setMensaje] = useState("");

  // =======================
  // CARGAR DATOS
  // =======================
  useEffect(() => {
    cargarComputadoras();
    cargarPrestamos();
    cargarUsuarios();
    cargarOperadores();
  }, []);

  const cargarComputadoras = async () => {
    const res = await api.getComputadoras();
    setComputadoras(res.data);
  };

  const cargarPrestamos = async () => {
    const res = await api.getPrestamosComputadora();
    setPrestamos(res.data);
  };

  const cargarUsuarios = async () => {
    const res = await api.getUsers();
    setUsuarios(res.data);
  };

  const cargarOperadores = async () => {
    const res = await api.getOperadores();
    setOperadores(res.data);
  };

  // =======================
  // COMPUTADORAS
  // =======================
  const handleCompuChange = (e) => {
    setNuevaCompu({ ...nuevaCompu, [e.target.name]: e.target.value });
  };

  const registrarComputadora = async (e) => {
    e.preventDefault();

    if (!nuevaCompu.marca || !nuevaCompu.modelo) {
      setMensaje("⚠️ Marca y modelo son obligatorios");
      return;
    }

    await api.createComputadora(nuevaCompu);
    setMensaje("✅ Computadora registrada correctamente");
    setNuevaCompu({
      marca: "",
      modelo: "",
      sistema_operativo: "",
      observacion: "",
      uid_tarjeta: "",
      estado:"disponible",
    });
    cargarComputadoras();
  };

  const eliminarComputadora = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta computadora?")) {
      await api.deleteComputadora(id);
      setMensaje("🗑️ Computadora eliminada");
      cargarComputadoras();
    }
  };

  // =======================
  // PRÉSTAMOS
  // =======================
  const handlePrestamoChange = (e) => {
    setNuevoPrestamo({ ...nuevoPrestamo, [e.target.name]: e.target.value });
  };

  const registrarPrestamo = async (e) => {
    e.preventDefault();

    if (!nuevoPrestamo.id_usuario || !nuevoPrestamo.uid_tarjeta) {
      setMensaje("⚠️ Seleccioná un usuario y una computadora");
      return;
    }

    // Buscar computadora por UID
    const compu = computadoras.find(
      (c) => c.uid_tarjeta === nuevoPrestamo.uid_tarjeta
    );

    if (!compu) {
      setMensaje("❌ No existe una computadora con ese UID");
      return;
    }

    if (compu.estado === "en_uso") {
      setMensaje("⚠️ Esta computadora ya está en uso");
      return;
    }

    const data = {
      id_usuario: nuevoPrestamo.id_usuario,
      operador: nuevoPrestamo.operador || null,
      id_computadora: compu.id_computadora,
      fecha: new Date().toISOString().split("T")[0],
      hora_inicio: new Date().toLocaleTimeString(),
    };

    await api.createPrestamoComputadora(data);
    setMensaje("💻 Préstamo registrado correctamente");
    setNuevoPrestamo({ id_usuario: "", uid_tarjeta: "", operador: "" });
    cargarPrestamos();
    cargarComputadoras();
  };

  const finalizarPrestamo = async (id) => {
    const hora_fin = new Date().toLocaleTimeString();
    await api.finalizarPrestamoComputadora(id, hora_fin);
    setMensaje("✅ Préstamo finalizado");
    cargarPrestamos();
    cargarComputadoras();
  };

  // =======================
  // RENDER
  // =======================
  return (
    <div className="computadoras-container">
      <h2>💻 Gestión de Computadoras</h2>
      {mensaje && <p className="mensaje">{mensaje}</p>}

      {/* FORM NUEVA COMPUTADORA */}
      <section className="form-section">
        <h3>Registrar nueva computadora</h3>
        <form onSubmit={registrarComputadora}>
         <div className="form-group"> 
        <label> Marca </label>
          <input
            type="text"
            name="marca"
            placeholder="Marca *"
            value={nuevaCompu.marca}
            onChange={handleCompuChange}
          />
          </div>
          <div className="form-group"> 
        <label> Marca </label>
          <input
            type="text"
            name="modelo"
            placeholder="Modelo *"
            value={nuevaCompu.modelo}
            onChange={handleCompuChange}
          />
          </div>
          <div className="form-group"> 
        <label> Marca </label>
          <input
            type="text"
            name="sistema_operativo"
            placeholder="Sistema Operativo"
            value={nuevaCompu.sistema_operativo}
            onChange={handleCompuChange}
          />
          </div>
          <div className="form-group"> 
        <label> Marca </label>
          <input
            type="text"
            name="observacion"
            placeholder="Observaciones"
            value={nuevaCompu.observacion}
            onChange={handleCompuChange}
          />
          </div>
          <div className="form-group"> 
        <label> Marca </label>
          <input
            type="text"
            name="uid_tarjeta"
            placeholder="UID Tarjeta (opcional)"
            value={nuevaCompu.uid_tarjeta}
            onChange={handleCompuChange}
          />
          </div>
          <button type="submit">Registrar</button>
        </form>
      </section>

      {/* TABLA COMPUTADORAS */}
      <section className="tabla-section">
        <h3>Computadoras registradas</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Sistema</th>
              <th>UID</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {computadoras.map((c) => (
              <tr key={c.id_computadora}>
                <td>{c.id_computadora}</td>
                <td>{c.marca}</td>
                <td>{c.modelo}</td>
                <td>{c.sistema_operativo}</td>
                <td>{c.uid_tarjeta || "-"}</td>
                <td>{c.estado}</td>
                <td>
                  <button onClick={() => eliminarComputadora(c.id_computadora)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FORM PRÉSTAMO */}
      <section className="form-section">
        <h3>Registrar préstamo de computadora</h3>
        <form onSubmit={registrarPrestamo}>
          {/* USUARIO */}
          <div className="form-group">
            <label>
              <i className="fa-solid fa-user"></i> Usuario (DNI) *
            </label>
            <select
              value={nuevoPrestamo.id_usuario}
              onChange={(e) =>
                setNuevoPrestamo({
                  ...nuevoPrestamo,
                  id_usuario: e.target.value,
                })
              }
              required
            >
              <option value="">Seleccionar usuario</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_completo} - DNI: {u.id_usuario}
                </option>
              ))}
            </select>
          </div>

          {/* COMPUTADORA */}
          <div className="form-group">
            <label>
              <i className="fa-solid fa-laptop"></i> Computadora (UID) *
            </label>
            <select
              value={nuevoPrestamo.uid_tarjeta}
              onChange={(e) =>
                setNuevoPrestamo({
                  ...nuevoPrestamo,
                  uid_tarjeta: e.target.value,
                })
              }
              required
            >
              <option value="">Seleccionar computadora</option>
              {computadoras
                .filter((c) => c.estado === "disponible")
                .map((c) => (
                  <option key={c.id_computadora} value={c.uid_tarjeta}>
                    {c.marca} {c.modelo} — UID: {c.uid_tarjeta || "sin UID"}
                  </option>
                ))}
            </select>
          </div>

          {/* OPERADOR */}
          <div className="form-group">
            <label>
              <i className="fa-solid fa-user-tie"></i> Operador (opcional)
            </label>
            <select
              value={nuevoPrestamo.operador}
              onChange={(e) =>
                setNuevoPrestamo({
                  ...nuevoPrestamo,
                  operador: e.target.value,
                })
              }
            >
              <option value="">Sin operador</option>
              {operadores.map((op) => (
                <option key={op.id_operador} value={op.id_operador}>
                  {op.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          <button type="submit">Registrar préstamo</button>
        </form>
      </section>

      {/* TABLA PRÉSTAMOS */}
      <section className="tabla-section">
        <h3>Préstamos activos</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Computadora</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((p) => (
              <tr key={p.id_prestamo_compu}>
                <td>{p.id_prestamo_compu}</td>
                <td>{p.usuario}</td>
                <td>{`${p.marca} ${p.modelo}`}</td>
                <td>{p.hora_inicio}</td>
                <td>{p.hora_fin || "-"}</td>
                <td>{p.estado}</td>
                <td>
                  {p.estado !== "finalizado" && (
                    <button onClick={() => finalizarPrestamo(p.id_prestamo_compu)}>
                      Finalizar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
