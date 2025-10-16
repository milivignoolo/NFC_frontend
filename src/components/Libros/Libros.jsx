import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Libros.css";

export default function Libros() {
  // ======================== ESTADOS ========================
  const [libros, setLibros] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [operadores, setOperadores] = useState([]);

  // Estado para registro de nuevo libro
  const [formLibro, setFormLibro] = useState({
    titulo: "",
    sub_titulo: "",
    asignatura: "",
    autor: "",
    segundo_autor: "",
    tercer_autor: "",
    isbn: "",
    editorial: "",
    anio: "",
    uid_tarjeta: "",
    dias_de_prestamo: 7,
    ubicacion: "",
    observaciones: "",
  });

  // Estado para nuevo préstamo
  const [nuevoPrestamo, setNuevoPrestamo] = useState({
    uid_libro: "",
    id_usuario: "",
    fecha_inicial: new Date().toISOString().split("T")[0],
    dias_prestamo: 7,
    operador: "",
  });

  // ======================== CARGA INICIAL ========================
  useEffect(() => {
    fetchPrestamos();
    fetchUsuarios();
    fetchOperadores();
  }, []);

  // ======================== CARGAR DATOS ========================
  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const res = await api.getPrestamosLibros();
      setPrestamos(res.data);
    } catch (error) {
      console.error("Error al obtener préstamos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.getUsers();
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const fetchOperadores = async () => {
    try {
      const res = await api.getOperadores();
      setOperadores(res.data || []);
    } catch (error) {
      console.error("Error al obtener operadores:", error);
    }
  };

  // ========================== BUSCAR LIBROS ==========================
  const handleBuscar = async () => {
    if (!search.trim()) {
      alert("Por favor ingresa un término de búsqueda");
      return;
    }
    try {
      setLoading(true);
      const res = await api.buscarLibros(search);
      setLibros(res.data);
    } catch (error) {
      console.error("Error al buscar libros:", error);
      alert("Error al buscar libros");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  // ========================== REGISTRAR NUEVO LIBRO ==========================
  const handleRegistrarLibro = async (e) => {
    e.preventDefault();

    if (!formLibro.titulo || !formLibro.asignatura || !formLibro.autor) {
      return alert("Completar título, asignatura y autor.");
    }

    try {
      const payload = {
        ...formLibro,
        anio: formLibro.anio ? parseInt(formLibro.anio, 10) : null,
        dias_de_prestamo: parseInt(formLibro.dias_de_prestamo, 10) || 7,
      };

      await api.createLibro(payload);
      alert("📚 Libro registrado correctamente.");

      setFormLibro({
        titulo: "",
        sub_titulo: "",
        asignatura: "",
        autor: "",
        segundo_autor: "",
        tercer_autor: "",
        isbn: "",
        editorial: "",
        anio: "",
        uid_tarjeta: "",
        dias_de_prestamo: 7,
        ubicacion: "",
        observaciones: "",
      });
    } catch (error) {
      console.error("Error al registrar libro:", error);
      const msg = error.response?.data?.error || error.message || "Error desconocido";
      alert("Error al registrar libro: " + msg);
    }
  };

  // ========================== REGISTRAR PRÉSTAMO ==========================
  const handleRegistrarPrestamo = async (e) => {
    e.preventDefault();

    if (!nuevoPrestamo.id_libro || !nuevoPrestamo.id_usuario) {
      return alert("Debe ingresar ID de libro y ID de usuario (DNI).");
    }

    try {
      const payload = {
        id_libro: parseInt(nuevoPrestamo.id_libro, 10),
        id_usuario: parseInt(nuevoPrestamo.id_usuario, 10),
        fecha_inicial: nuevoPrestamo.fecha_inicial,
        dias_prestamo: parseInt(nuevoPrestamo.dias_prestamo, 10),
        operador: nuevoPrestamo.operador || null,
      };

      await api.createPrestamoLibro(payload);
      alert("📚 Préstamo registrado correctamente.");

      setNuevoPrestamo({
        id_libro: "",
        id_usuario: "",
        fecha_inicial: new Date().toISOString().split("T")[0],
        dias_prestamo: 7,
        operador: "",
      });

      fetchPrestamos();
      setLibros([]);
    } catch (error) {
      console.error("Error al registrar préstamo:", error);
      const msg = error.response?.data?.error || error.message || "Error desconocido";
      alert("Error al registrar préstamo: " + msg);
    }
  };

  // ========================== FINALIZAR PRÉSTAMO ==========================
  const handleFinalizarPrestamo = async (id_prestamo) => {
    if (!window.confirm("¿Confirmar devolución del libro?")) return;

    try {
      await api.finalizarPrestamoLibro(id_prestamo);
      alert("✅ Libro devuelto correctamente.");
      fetchPrestamos();
    } catch (error) {
      console.error("Error al finalizar préstamo:", error);
      alert("Error al devolver libro.");
    }
  };

  // ========================== RENDER ==========================
  return (
    <div className="libros-container">
      <h1>
        <i className="fa-solid fa-book"></i>
        Gestión de Libros
      </h1>

      {/* ========== REGISTRAR NUEVO LIBRO ========== */}
      <section className="form-section">
        <h2>
          <i className="fa-solid fa-plus-circle"></i>
          Registrar nuevo libro
        </h2>
        <form onSubmit={handleRegistrarLibro} className="libro-form">
          
          <div className="form-group"> 
            <label>UID de Tarjeta</label> 
            <input name="uid_tarjeta" 
            value={formLibro.uid_tarjeta} 
            onChange={(e) => setFormLibro({...formLibro, uid_tarjeta: e.target.value})} 
            placeholder="(opcional)" /> 
            </div> 

          <div className="form-group"> 
            <label>Título *</label> 
            <input name="titulo" 
            value={formLibro.titulo} onChange={(e) => setFormLibro({...formLibro, titulo: e.target.value})} 
            placeholder="Título del libro" required /> 
            </div> 
          
          <div className="form-group"> 
              <label>Subtítulo</label> 
              <input name="sub_titulo" 
              value={formLibro.sub_titulo} onChange={(e) => setFormLibro({...formLibro, sub_titulo: e.target.value})} 
              placeholder="Subtítulo" /> 
              </div> 
            
            <div className="form-group"> 
              <label>Asignatura *</label> 
              <input name="asignatura" 
              value={formLibro.asignatura} onChange={(e) => setFormLibro({...formLibro, asignatura: e.target.value})} 
              placeholder="Materia o asignatura" required /> 
              </div> 
            
            <div className="form-group"> 
              <label>Autor *</label> 
              <input name="autor" 
              value={formLibro.autor} onChange={(e) => setFormLibro({...formLibro, autor: e.target.value})} 
              placeholder="Autor principal" required /> 
              </div> 
            
            <div className="form-group"> 
              <label>Segundo autor</label> 
              <input name="segundo_autor" 
              value={formLibro.segundo_autor} onChange={(e) => setFormLibro({...formLibro, segundo_autor: e.target.value})} 
              placeholder="Segundo autor" /> 
              </div> 
            
            <div className="form-group"> 
              <label>ISBN</label> 
              <input name="isbn" 
              value={formLibro.isbn} onChange={(e) => setFormLibro({...formLibro, isbn: e.target.value})} 
              placeholder="ISBN" /> 
              </div> 
            <div className="form-group"> 
              <label>Editorial</label> 
              <input name="editorial" 
              value={formLibro.editorial} onChange={(e) => setFormLibro({...formLibro, editorial: e.target.value})} 
              placeholder="Editorial" /> 
              </div> 
            
            <div className="form-group"> 
              <label>Año</label> 
              <input type="number" 
              name="anio" 
              value={formLibro.anio} onChange={(e) => setFormLibro({...formLibro, anio: e.target.value})} 
              placeholder="Año de publicación" min="1900" max={new Date().getFullYear()} /> 
              </div> 
              
            <div className="form-group"> 
              <label>Días de préstamo</label> 
              <input type="number" 
              name="dias_de_prestamo" 
              value={formLibro.dias_de_prestamo} onChange={(e) => setFormLibro({...formLibro, dias_de_prestamo: e.target.value})} min="1" max="30" /> 
              </div> 
              
            <div className="form-group"> 
              <label>Ubicación</label> 
              <input name="ubicacion" 
              value={formLibro.ubicacion} onChange={(e) => setFormLibro({...formLibro, ubicacion: e.target.value})} 
              placeholder="Ej: Estante A, Nivel 2" /> 
              </div> 
            
            <div className="form-group" style={{ gridColumn: "1 / -1" }}> 
            <label>Observaciones</label> 
            <textarea name="observaciones" 
            value={formLibro.observaciones} onChange={(e) => setFormLibro({...formLibro, observaciones: e.target.value})} 
            placeholder="Observaciones adicionales" rows="3" />
            </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <i className="fa-solid fa-save"></i> Registrar Libro
            </button>
          </div>
        </form>
      </section>

      {/* ========== BUSCADOR ========== */}
      <section className="buscador-section">
        <h2>
          <i className="fa-solid fa-search"></i> Buscar Libros
        </h2>
        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar libro por título, autor, asignatura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleBuscar}>
            <i className="fa-solid fa-search"></i> Buscar
          </button>
        </div>
        {/* Resultados de búsqueda */}
        {libros.length > 0 && (
          <div className="resultados">
            <h3>
              <i className="fa-solid fa-list"></i> Resultados ({libros.length})
            </h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Asignatura</th>
                  <th>Autor</th>
                  <th>Estado</th>
                  <th>UID</th>
                </tr>
              </thead>
              <tbody>
                {libros.map((libro) => (
                  <tr key={libro.id_libro}>
                    <td>{libro.id_libro}</td>
                    <td>
                      <strong>{libro.titulo}</strong>
                      {libro.sub_titulo && <><br/><small>{libro.sub_titulo}</small></>}
                    </td>
                    <td>{libro.asignatura || "-"}</td>
                    <td>{libro.autor || "-"}</td>
                    <td>
                      <span className={`status-badge status-${libro.estado}`}>
                        {libro.estado === 'libre' ? 'Disponible' : 
                         libro.estado === 'en_prestamo' ? 'En préstamo' : 
                         'Reservado'}
                      </span>
                    </td>
                    <td>{libro.uid_tarjeta || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========== FORMULARIO DE PRÉSTAMO ========== */}
      <section className="form-prestamo-section">
        <h2>
          <i className="fa-solid fa-hand-holding-heart"></i>
          Registrar nuevo préstamo
        </h2>
        <form onSubmit={handleRegistrarPrestamo} className="prestamo-form">
        
        <div className="form-group"> 
          <label> <i className="fa-solid fa-book"> </i> ID Libro * </label> 
            <input type="number" 
            value={nuevoPrestamo.id_libro} onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, id_libro: e.target.value }) } 
            placeholder="ID del libro" required /> 
            </div> 
            
          <div className="form-group"> 
            <label> <i className="fa-solid fa-user"></i> 
            ID Usuario (DNI) * </label> 
            <select value={nuevoPrestamo.id_usuario} 
            onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, id_usuario: e.target.value, }) } required > 
            <option value="">
              Seleccionar usuario</option> {usuarios.map((u) => ( <option key={u.id_usuario} value={u.id_usuario}> {u.nombre_completo}
                 - DNI: {u.id_usuario} </option> ))} </select> 
                 </div> 
            <div className="form-group"> 
                  <label> <i className="fa-regular fa-calendar"></i> 
                  Fecha inicial * </label> 
                  <input type="date" 
                  value={nuevoPrestamo.fecha_inicial} 
                  onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, fecha_inicial: e.target.value, }) } required /> 
                  </div> 
                <div className="form-group"> 
                  <label> <i className="fa-regular fa-clock"></i> 
                  Días de préstamo </label> 
                  <input type="number" min="1" max="30" 
                  value={nuevoPrestamo.dias_prestamo} 
                  onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, dias_prestamo: e.target.value, }) } /> 
                  </div> 
                <div className="form-group"> 
                  <label> <i className="fa-solid fa-user-tie"></i> 
                  Operador (opcional) </label> 
                  <select value={nuevoPrestamo.operador} 
                  onChange={(e) => setNuevoPrestamo({ ...nuevoPrestamo, operador: e.target.value, }) } > 
                  <option value="">
                    Sin operador</option> {operadores.map((op) => ( <option key={op.id_operador} 
                    value={op.id_operador}> {op.nombre_completo} </option> ))} </select> 
                  </div> 
                  <div className="form-actions"> 
                    <button type="submit" 
                    className="btn-submit"> 
                    <i className="fa-solid fa-check"></i> 
                    Registrar préstamo </button> 
                  </div>
        </form>
      </section>

      {/* ========== PRÉSTAMOS ACTIVOS ========== */}
      <section className="prestamos-activos-section">
        <h2>
          <i className="fa-solid fa-clock"></i> Préstamos activos ({prestamos.length})
        </h2>
        {loading ? (
          <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</p>
        ) : prestamos.length === 0 ? (
          <p><i className="fa-solid fa-info-circle"></i> No hay préstamos activos.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Libro</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Inicio</th>
                  <th>Vencimiento</th>
                  <th>Días restantes</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((p) => (
                  <tr key={p.id_prestamo}>
                    <td>{p.id_prestamo}</td>
                    <td><strong>{p.titulo}</strong></td>
                    <td>{p.usuario}</td>
                    <td><span className="badge-tipo">{p.tipo_usuario}</span></td>
                    <td>{new Date(p.fecha_inicial).toLocaleDateString('es-AR')}</td>
                    <td>{new Date(p.fecha_final).toLocaleDateString('es-AR')}</td>
                    <td>
                      <span className={`dias-restantes ${p.dias_restantes < 0 ? "vencido" : p.dias_restantes <= 2 ? "proximo" : ""}`}>
                        {p.dias_restantes} días
                      </span>
                    </td>
                    <td>
                      <button className="btn-devolver" onClick={() => handleFinalizarPrestamo(p.id_prestamo)}>
                        <i className="fa-solid fa-check-circle"></i> Devolver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
