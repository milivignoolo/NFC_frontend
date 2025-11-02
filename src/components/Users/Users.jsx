import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Users.css";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeUsersError, setActiveUsersError] = useState(null);
  const [operadores, setOperadores] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const [editandoUID, setEditandoUID] = useState(null); // nuevo
  const [nuevoUID, setNuevoUID] = useState(""); // nuevo

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
    uid_tarjeta: "",
  });

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

  // 🔹 NUEVA FUNCIÓN reemplazando el prompt()
  const guardarNuevoUID = async (id_usuario) => {
    if (!nuevoUID.trim()) {
      mostrarMensaje("El UID no puede estar vacío.", "error");
      return;
    }

    try {
      await api.updateUser(id_usuario, { uid_tarjeta: nuevoUID });
      mostrarMensaje("UID actualizado correctamente.", "ok");
      setEditandoUID(null);
      setNuevoUID("");
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error desconocido";
      mostrarMensaje("Error al actualizar UID: " + msg, "error");
    }
  };

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
      uid_tarjeta: "",
    });
  };

  return (
    <div className="users-container">
      <h1 className="users-title">Gestión de Usuarios</h1>

      {mensaje && (
        <div
          className={`users-message ${
            tipoMensaje === "ok" ? "users-message-ok" : "users-message-error"
          }`}
        >
          {mensaje}
        </div>
      )}

      {/* ---------- FORMULARIO ---------- */}
            {/* ---------- FORMULARIO ---------- */}
            <section className="users-form-section">
        <h2 className="users-form-title">Registrar Usuario</h2>

        <form onSubmit={handleSubmit} className="users-form">
          <div className="users-form-group">
            <label>UID de Tarjeta</label>
            <input
              name="uid_tarjeta"
              value={form.uid_tarjeta}
              onChange={handleChange}
              placeholder="Ej: 0011223344"
            />
          </div>

          <div className="users-form-group">
            <label>DNI</label>
            <input
              name="id_usuario"
              value={form.id_usuario}
              onChange={handleChange}
              required
              placeholder="Sin puntos ni guiones (Ej: 40900800)"
            />
          </div>

          <div className="users-form-group">
            <label>Nombre completo</label>
            <input
              name="nombre_completo"
              value={form.nombre_completo}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="users-form-group">
            <label>Tipo de usuario</label>
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

          {form.tipo_usuario === "Cursante" && (
            <div className="users-form-group users-form-full">
              <label>Carreras</label>
              <div className="users-checkbox-group">
                {[
                  "UTN - Ingeniería en Sistemas de Información",
                  "UTN - Ingeniería Química",
                  "UTN - Ingeniería Electrónica",
                  "UTN - Ingeniería Electromecánica",
                  "UTN - Licenciatura en Administración Rural",
                  "UTN - Ingeniería Industrial",
                  "UTN - Otras",
                  "UCES - Abogacía",
                  "UCES - Licenciatura en Psicología",
                  "UCES - Licenciatura en Recursos Humanos",
                  "UCES - Contador Público",
                  "UCES - Otras",
                ].map((carrera) => (
                  <div key={carrera} className="users-checkbox-item">
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

          <div className="users-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ej: Juanjo@gmail.com"
            />
          </div>

          <div className="users-form-group">
            <label>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: +54 9 351 234 5678"
            />
          </div>

          <div className="users-form-group">
            <label>Domicilio</label>
            <input
              name="domicilio"
              value={form.domicilio}
              onChange={handleChange}
              placeholder="Ej: Av. Rivadavia 1234"
            />
          </div>

          <div className="users-form-group">
            <label>Código postal</label>
            <input
              name="codigo_postal"
              value={form.codigo_postal}
              onChange={handleChange}
              placeholder="Ej: 1000"
            />
          </div>

          <div className="users-form-group">
            <label>Ciudad</label>
            <input
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              placeholder="Ej: Córdoba"
            />
          </div>

          <div className="users-form-group">
            <label>Provincia</label>
            <input
              name="provincia"
              value={form.provincia}
              onChange={handleChange}
              placeholder="Ej: Buenos Aires"
            />
          </div>

          <div className="users-form-group">
            <label>Sexo</label>
            <select name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Seleccione una opción</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="users-form-group">
            <label>Operador</label>
            <select name="operador" value={form.operador} onChange={handleChange}>
              <option value="">Seleccione un operador</option>
              {operadores.map((op) => (
                <option key={op.id_operador} value={op.id_operador}>
                  {op.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          <div className="users-form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              required
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {(form.tipo_usuario === "Cursante" || form.tipo_usuario === "Docente") && (
            <div className="users-form-group">
              <label>Legajo</label>
              <input
                name="legajo"
                value={form.legajo}
                onChange={handleChange}
                placeholder="Ej: 12567"
              />
            </div>
          )}

          {form.tipo_usuario === "Docente" && (
            <div className="users-form-group users-form-full">
              <label>Materias</label>
              <div className="users-checkbox-group">
                {[
                  "Programación I",
                  "Base de Datos",
                  "Matemática",
                  "Física I",
                  "Química General",
                  "Electrónica Básica",
                  "Termodinámica",
                  "Mecánica de Fluidos",
                  "Circuitos Eléctricos",
                  "Ingeniería de Materiales",
                  "Estadística",
                  "Estructuras",
                  "Control Automático",
                  "Sistemas Operativos",
                  "Diseño de Procesos",
                ].map((materia) => (
                  <div key={materia} className="users-checkbox-item">
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

          <div className="users-form-actions">
            <button type="submit" className="users-btn-submit">
              Registrar Usuario
            </button>
            <button type="button" className="users-btn-clear" onClick={resetForm}>
              Limpiar
            </button>
          </div>
        </form>
      </section>

      {/* ---------- TABLA ---------- */}
      <section className="users-table-section">
        <h2>Usuarios Registrados</h2>

        <input
          type="text"
          placeholder="Buscar por Nombre, Apellido, DNI, o Legajo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="users-search-input"
        />

        <table className="users-table">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Legajo</th>
              <th>UID Tarjeta</th>
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

                {/* 🔹 Campo editable de UID */}
                <td>
                  {editandoUID === user.id_usuario ? (
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <input
                        type="text"
                        value={nuevoUID}
                        onChange={(e) => setNuevoUID(e.target.value)}
                        placeholder="Nuevo UID..."
                        style={{
                          padding: "5px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          width: "120px",
                          textAlign: "center",
                        }}
                      />
                      <button
                        className="users-btn-save"
                        onClick={() => guardarNuevoUID(user.id_usuario)}
                      >
                        ✔
                      </button>
                      <button
                        className="users-btn-cancel"
                        onClick={() => {
                          setEditandoUID(null);
                          setNuevoUID("");
                        }}
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    user.uid_tarjeta || "-"
                  )}
                </td>

                <td>
                  {editandoUID === user.id_usuario ? null : (
                    <>
                      <button
                        className="users-btn-update"
                        onClick={() => {
                          setEditandoUID(user.id_usuario);
                          setNuevoUID(user.uid_tarjeta || "");
                        }}
                        style={{ marginRight: "5px" }}
                      >
                        Editar UID
                      </button>
                      <button
                        className="users-btn-delete"
                        onClick={() => eliminarUsuario(user.id_usuario)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
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
