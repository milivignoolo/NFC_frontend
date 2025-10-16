import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Users.css";

export default function Usuarios() {
  // ================= ESTADOS =================
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeUsersError, setActiveUsersError] = useState(null);
  const [operadores, setOperadores] = useState([]);

  // Mensajes visuales
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // "ok" o "error"

  const [form, setForm] = useState({
    id_usuario: "",
    tipo_usuario: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    domicilio: "",
    codigo_postal: "",
    ciudad: "",
    provincia: "",
    sexo: "",
    operador: "",
    contrasena: "",
    legajo: "",
    carreras: [],
    materias: [],
  });

  // ================= EFECTOS =================
  useEffect(() => {
    fetchAll();
    fetchOperadores();
    fetchActiveUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter((user) => {
        const nombre = (user.nombre_completo || "").toLowerCase();
        const dni = String(user.id_usuario || "").toLowerCase();
        return nombre.includes(term) || dni.includes(term);
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // ================= FETCHS =================
  const fetchAll = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  const fetchOperadores = async () => {
    try {
      const res = await api.getOperadores();
      setOperadores(res.data || []);
    } catch (err) {
      console.error("Error cargando operadores:", err);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const res = await api.getUsuariosActivos();
      setActiveUsers(res.data || []);
      setActiveUsersError(null);
    } catch (err) {
      setActiveUsers([]);
      setActiveUsersError("El endpoint de usuarios activos no está disponible.");
    }
  };

  // ================= FORMULARIO =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCarreraChange = (e) => {
    const { checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      carreras: checked
        ? [...prev.carreras, value]
        : prev.carreras.filter((c) => c !== value),
    }));
  };

  const handleMateriaChange = (e) => {
    const { checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      materias: checked
        ? [...prev.materias, value]
        : prev.materias.filter((m) => m !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_usuario || !form.tipo_usuario || !form.nombre_completo) {
      return mostrarMensaje("Completar DNI, tipo de usuario y nombre completo.", "error");
    }

    try {
      const payload = {
        ...form,
        id_usuario: parseInt(String(form.id_usuario).trim(), 10),
        legajo: form.legajo ? parseInt(form.legajo, 10) : null,
        carreras: form.carreras.length ? JSON.stringify(form.carreras) : null,
        materias: form.materias.length ? JSON.stringify(form.materias) : null,
      };

      await api.createUser(payload);
      mostrarMensaje("Usuario registrado correctamente.", "ok");
      resetForm();
      fetchAll();
      fetchActiveUsers();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error desconocido";
      mostrarMensaje("Error al registrar usuario: " + msg, "error");
    }
  };

  const eliminarUsuario = async (id_usuario) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await api.deleteUser(id_usuario);
      mostrarMensaje("Usuario eliminado correctamente.", "ok");
      fetchAll();
      fetchActiveUsers();
    } catch (err) {
      mostrarMensaje("Error al eliminar usuario.", "error");
    }
  };

  // ================= FUNCIONES AUX =================
  const mostrarMensaje = (texto, tipo = "ok") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 4000);
  };

  const resetForm = () => {
    setForm({
      id_usuario: "",
      tipo_usuario: "",
      nombre_completo: "",
      email: "",
      telefono: "",
      domicilio: "",
      codigo_postal: "",
      ciudad: "",
      provincia: "",
      sexo: "",
      operador: "",
      contrasena: "",
      legajo: "",
      carreras: [],
      materias: [],
    });
  };

  // ================= RENDER =================
  return (

    <div className="users-container">
      <h1>
        <i className="user-titulo"></i>
        Gestión de Usuarios
      </h1>
      {/* Mensaje visual */}
      {mensaje && (
        <div className={`mensaje ${tipoMensaje === "ok" ? "mensaje-exito" : "mensaje-error"}`}>
          {mensaje}
        </div>
      )}

      {/* ---------- FORMULARIO ---------- */}
      <section className="form-section">
        <h2>
          <i className="fa-solid fa-user-plus"></i> Registrar Usuario
        </h2>

        <form onSubmit={handleSubmit} className="user-form">
          {/* UID */} 
          <div className="form-group"> 
            <label>UID de Tarjeta</label> 
            <input name="uid_tarjeta" 
            value={form.uid_tarjeta} 
            onChange={handleChange} placeholder="(opcional)" /> 
            </div>

          {/* DNI */}
          <div className="form-group">
            <label>DNI *</label>
            <input
              name="id_usuario"
              value={form.id_usuario}
              onChange={handleChange}
              placeholder="Número de documento"
              required
            />
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label>Nombre completo *</label>
            <input
              name="nombre_completo"
              value={form.nombre_completo}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo de usuario */}
          <div className="form-group">
            <label>Tipo de usuario *</label>
            <select
              name="tipo_usuario"
              value={form.tipo_usuario}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="Aspirante">Aspirante</option>
              <option value="Cursante">Cursante</option>
              <option value="Docente">Docente</option>
              <option value="No docente">No docente</option>
              <option value="Egresado">Egresado</option>
              <option value="Externo">Externo</option>
            </select>
          </div>

          {/* Carreras */}
          {form.tipo_usuario === "Cursante" && (
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Carreras</label>
              <div className="checkbox-group">
                {["ISI", "IQ", "IE"].map((carrera) => (
                  <div key={carrera} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`carrera-${carrera}`}
                      value={carrera}
                      checked={form.carreras.includes(carrera)}
                      onChange={handleCarreraChange}
                    />
                    <label htmlFor={`carrera-${carrera}`}>{carrera}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label>Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} />
          </div>

          {/* Domicilio */}
          <div className="form-group">
            <label>Domicilio</label>
            <input name="domicilio" value={form.domicilio} onChange={handleChange} />
          </div>

          {/* Código postal */}
          <div className="form-group">
            <label>Código postal</label>
            <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
          </div>

          {/* Ciudad */}
          <div className="form-group">
            <label>Ciudad</label>
            <input name="ciudad" value={form.ciudad} onChange={handleChange} />
          </div>

          {/* Provincia */}
          <div className="form-group">
            <label>Provincia</label>
            <input name="provincia" value={form.provincia} onChange={handleChange} />
          </div>

          {/* Sexo */}
          <div className="form-group">
            <label>Sexo</label>
            <select name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Seleccione</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Operador */}
          <div className="form-group">
            <label>Operador</label>
            <select name="operador" value={form.operador} onChange={handleChange}>
              <option value="">Seleccione operador</option>
              {operadores.map((op) => (
                <option key={op.id_operador} value={op.nombre}>
                  {op.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label>Contraseña *</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          {/* Legajo */}
          {(form.tipo_usuario === "Cursante" || form.tipo_usuario === "Docente") && (
            <div className="form-group">
              <label>Legajo</label>
              <input name="legajo" value={form.legajo} onChange={handleChange} />
            </div>
          )}

          {/* Materias */}
          {form.tipo_usuario === "Docente" && (
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Materias</label>
              <div className="checkbox-group">
                {["Programación I", "Base de Datos", "Matemática"].map((materia) => (
                  <div key={materia} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`materia-${materia}`}
                      value={materia}
                      checked={form.materias.includes(materia)}
                      onChange={handleMateriaChange}
                    />
                    <label htmlFor={`materia-${materia}`}>{materia}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Registrar Usuario
            </button>
            <button type="button" className="btn-clear" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {/* TABLA */}
      <section className="table-section">
        <h2>Usuarios Registrados</h2>

        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="users-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Legajo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id_usuario}>
                <td>{user.id_usuario}</td>
                <td>{user.nombre_completo}</td>
                <td>{user.tipo_usuario}</td>
                <td>{user.legajo || "-"}</td>
                <td>
                  <button onClick={() => eliminarUsuario(user.id_usuario)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
