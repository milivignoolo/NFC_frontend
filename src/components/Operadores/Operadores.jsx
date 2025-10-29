import React, { useEffect, useState } from "react";
import { api } from "../../services/api"; // Ajustá la ruta según tu proyecto
import "./Operadores.css";

export default function Operadores() {
  const [operadores, setOperadores] = useState([]);
  const [formData, setFormData] = useState({
    id_operador: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    domicilio: "",
    codigo_postal: "",
    ciudad: "",
    provincia: "",
    sexo: "Femenino",
  });

  const [mensaje, setMensaje] = useState("");

  // Obtener operadores
  const fetchOperadores = async () => {
    try {
      const res = await api.getOperadores();
      setOperadores(res.data);
    } catch (error) {
      console.error("Error al obtener operadores:", error);
    }
  };

  useEffect(() => {
    fetchOperadores();
  }, []);

  // Manejar cambios en formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Registrar operador
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_operador || !formData.nombre_completo || !formData.email) {
      setMensaje("ID, nombre y email son obligatorios");
      return;
    }
    try {
      await api.createOperador(formData);
      setFormData({
        id_operador: "",
        nombre_completo: "",
        email: "",
        telefono: "",
        domicilio: "",
        codigo_postal: "",
        ciudad: "",
        provincia: "",
        sexo: "Femenino",
      });
      setMensaje("Operador registrado correctamente");
      fetchOperadores();
    } catch (error) {
      console.error("Error al registrar operador:", error);
      setMensaje("Error al registrar operador");
    }
  };

  // Eliminar operador
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este operador?")) return;
    try {
      await api.deleteOperador(id);
      setMensaje("Operador eliminado");
      fetchOperadores();
    } catch (error) {
      console.error("Error al eliminar operador:", error);
      setMensaje("Error al eliminar operador");
    }
  };

  return (
    <div className="operadores-container">
      <h2 className="operadores-title">Gestión de Operadores</h2>

      {mensaje && <p className="operadores-mensaje">{mensaje}</p>}

      {/* FORMULARIO */}
      <section className="operadores-form-section">
        <h3 className="operadores-form-title">Registrar nuevo operador</h3>
        <form onSubmit={handleSubmit} className="operadores-form">
          <div className="operadores-form-group">
            <label>ID Operador (DNI)</label>
            <input
              name="id_operador"
              placeholder="Ej: 40321654"
              value={formData.id_operador}
              onChange={handleChange}
              required
            />
          </div>
          <div className="operadores-form-group">
            <label>Nombre completo</label>
            <input
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              placeholder="Ej: Ana García"
              required
            />
          </div>
          <div className="operadores-form-group">
            <label>Email</label>
            <input
              name="email"
              placeholder="Ej: ana.garcia@empresa.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="operadores-form-group">
            <label>Teléfono</label>
            <input
              name="telefono"
              placeholder="Ej: 11-4567-8910"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
          <div className="operadores-form-group">
            <label>Domicilio</label>
            <input
              name="domicilio"
              placeholder="Ej: Av. Rivadavia 1234"
              value={formData.domicilio}
              onChange={handleChange}
            />
          </div>
          <div className="operadores-form-group">
            <label>Código Postal</label>
            <input
              name="codigo_postal"
              value={formData.codigo_postal}
              onChange={handleChange}
              placeholder="Ej: 5000"
            />
          </div>
          <div className="operadores-form-group">
            <label>Ciudad</label>
            <input
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej: Córdoba"
            />
          </div>
          <div className="operadores-form-group">
            <label>Provincia</label>
            <input
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              placeholder="Ej: Buenos Aires" 
            />
          </div>
          <div className="operadores-form-group">
            <label>Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange}>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="No binario">No binario</option>
            </select>
          </div>

          <div className="operadores-form-actions">
            <button type="submit" className="operadores-btn operadores-btn-submit">
              Registrar Operador
            </button>
          </div>
        </form>
      </section>

      {/* TABLA DE OPERADORES */}
      <section className="operadores-table-section">
        <h3 className="operadores-form-title">Lista de operadores</h3>
        <table className="operadores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {operadores.map((op) => (
              <tr key={op.id_operador}>
                <td>{op.id_operador}</td>
                <td>{op.nombre_completo}</td>
                <td>{op.email}</td>
                <td>{op.telefono || "-"}</td>
                <td>
                  <button
                    onClick={() => handleDelete(op.id_operador)}
                    className="operadores-btn operadores-btn-delete"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
