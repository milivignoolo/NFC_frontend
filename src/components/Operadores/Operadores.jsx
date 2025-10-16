import React, { useEffect, useState } from "react";
import { api } from "../../services/api"; // Ajustá la ruta según tu proyecto

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
      fetchOperadores();
    } catch (error) {
      console.error("Error al registrar operador:", error);
    }
  };

  // Eliminar operador
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este operador?")) return;
    try {
      await api.deleteOperador(id);
      fetchOperadores();
    } catch (error) {
      console.error("Error al eliminar operador:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Operadores</h1>

      {/* Formulario con labels */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label>ID Operador:</label>
          <input
            name="id_operador"
            placeholder="ID Operador"
            value={formData.id_operador}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nombre completo:</label>
          <input
            name="nombre_completo"
            placeholder="Nombre completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Domicilio:</label>
          <input
            name="domicilio"
            placeholder="Domicilio"
            value={formData.domicilio}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Código Postal:</label>
          <input
            name="codigo_postal"
            placeholder="Código postal"
            value={formData.codigo_postal}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Ciudad:</label>
          <input
            name="ciudad"
            placeholder="Ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Provincia:</label>
          <input
            name="provincia"
            placeholder="Provincia"
            value={formData.provincia}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Sexo:</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange}>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="No binario">No binario</option>
          </select>
        </div>
        <button type="submit">Registrar Operador</button>
      </form>

      {/* Lista de operadores */}
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Domicilio</th>
            <th>Código Postal</th>
            <th>Ciudad</th>
            <th>Provincia</th>
            <th>Sexo</th>
            <th>Fecha Alta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operadores.map((op) => (
            <tr key={op.id_operador}>
              <td>{op.id_operador}</td>
              <td>{op.nombre_completo}</td>
              <td>{op.email}</td>
              <td>{op.telefono}</td>
              <td>{op.domicilio}</td>
              <td>{op.codigo_postal}</td>
              <td>{op.ciudad}</td>
              <td>{op.provincia}</td>
              <td>{op.sexo}</td>
              <td>{op.fecha_alta}</td>
              <td>
                <button onClick={() => handleDelete(op.id_operador)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
