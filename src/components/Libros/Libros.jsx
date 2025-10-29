import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Libros.css";

export default function Libros() {
  const [libros, setLibros] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [operadores, setOperadores] = useState([]);

  const [formLibro, setFormLibro] = useState({
    titulo: "", sub_titulo: "", asignatura: "", autor: "", segundo_autor: "",
    tercer_autor: "", isbn: "", editorial: "", anio: "", uid_tarjeta: "",
    dias_de_prestamo: 7, ubicacion: "", observaciones: ""
  });

  const [nuevoPrestamo, setNuevoPrestamo] = useState({
    id_libro: "", id_usuario: "", fecha_inicial: new Date().toISOString().split("T")[0],
    dias_prestamo: 7, operador: ""
  });

  useEffect(() => {
    fetchPrestamos();
    fetchUsuarios();
    fetchOperadores();
  }, []);

  const fetchPrestamos = async () => {
    try {
      setLoading(true);
      const res = await api.getPrestamosLibros();
      setPrestamos(res.data);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const fetchUsuarios = async () => {
    try { const res = await api.getUsers(); setUsuarios(res.data || []); }
    catch (error) { console.error(error); }
  };

  const fetchOperadores = async () => {
    try { const res = await api.getOperadores(); setOperadores(res.data || []); }
    catch (error) { console.error(error); }
  };

  const handleBuscar = async () => {
    if (!search.trim()) { alert("Por favor ingresa un término de búsqueda"); return; }
    try { setLoading(true); const res = await api.buscarLibros(search); setLibros(res.data); }
    catch (error) { console.error(error); alert("Error al buscar libros"); }
    finally { setLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleBuscar(); };

  const handleRegistrarLibro = async (e) => {
    e.preventDefault();
    if (!formLibro.titulo || !formLibro.asignatura || !formLibro.autor) return alert("Completar título, asignatura y autor.");
    try {
      await api.createLibro({
        ...formLibro,
        anio: formLibro.anio ? parseInt(formLibro.anio, 10) : null,
        dias_de_prestamo: parseInt(formLibro.dias_de_prestamo, 10) || 7
      });
      alert("Libro registrado correctamente.");
      setFormLibro({ titulo: "", sub_titulo: "", asignatura: "", autor: "", segundo_autor: "", tercer_autor: "", isbn: "", editorial: "", anio: "", uid_tarjeta: "", dias_de_prestamo: 7, ubicacion: "", observaciones: "" });
    } catch (error) { console.error(error); alert("Error al registrar libro"); }
  };

  const handleRegistrarPrestamo = async (e) => {
    e.preventDefault();
    if (!nuevoPrestamo.id_libro || !nuevoPrestamo.id_usuario) return alert("Debe ingresar ID de libro y ID de usuario (DNI).");
    try {
      await api.createPrestamoLibro({
        id_libro: parseInt(nuevoPrestamo.id_libro, 10),
        id_usuario: parseInt(nuevoPrestamo.id_usuario, 10),
        fecha_inicial: nuevoPrestamo.fecha_inicial,
        dias_prestamo: parseInt(nuevoPrestamo.dias_prestamo, 10),
        operador: nuevoPrestamo.operador || null
      });
      alert("Préstamo registrado correctamente.");
      setNuevoPrestamo({ id_libro: "", id_usuario: "", fecha_inicial: new Date().toISOString().split("T")[0], dias_prestamo: 7, operador: "" });
      fetchPrestamos(); setLibros([]);
    } catch (error) { console.error(error); alert("Error al registrar préstamo"); }
  };

  const handleFinalizarPrestamo = async (id_prestamo) => {
    if (!window.confirm("¿Confirmar devolución del libro?")) return;
    try { await api.finalizarPrestamoLibro(id_prestamo); alert("✅ Libro devuelto correctamente."); fetchPrestamos(); }
    catch (error) { console.error(error); alert("Error al devolver libro."); }
  };

  return (
    <div className="libros-container">
      <h1 className="libros-title"> Gestión de Libros</h1>

      {/* Registrar libro */}
      <section className="libros-section">
  <h2 className="libros-section-title">Registrar nuevo libro</h2>
  <form onSubmit={handleRegistrarLibro} className="libros-form">

    <div className="libros-form-group">
      <label>Título</label>
      <input 
        type="text" 
        value={formLibro.titulo} 
        onChange={e => setFormLibro({ ...formLibro, titulo: e.target.value })} 
        required
        placeholder="Ej: Introducción a la Programación"
      />
    </div>

    <div className="libros-form-group">
      <label>Subtítulo</label>
      <input 
        type="text" 
        value={formLibro.sub_titulo} 
        onChange={e => setFormLibro({ ...formLibro, sub_titulo: e.target.value })} 
      placeholder="Ej: Fundamentos y prácticas con Python"
      />
    </div>

    <div className="libros-form-group">
      <label>Asignatura</label>
      <input 
        type="text" 
        value={formLibro.asignatura} 
        onChange={e => setFormLibro({ ...formLibro, asignatura: e.target.value })} 
        required
        placeholder="Ej: Algoritmos y Estructuras de Datos"
      />
    </div>

    <div className="libros-form-group">
      <label>Autor</label>
      <input 
        type="text" 
        value={formLibro.autor} 
        onChange={e => setFormLibro({ ...formLibro, autor: e.target.value })} 
        placeholder="Ej: Juan Pérez"
        required
      />
    </div>

    <div className="libros-form-group">
      <label>Segundo autor</label>
      <input 
        type="text" 
        value={formLibro.segundo_autor} 
        onChange={e => setFormLibro({ ...formLibro, segundo_autor: e.target.value })} 
      placeholder="Ej: Ana López"
      />
    </div>

    <div className="libros-form-group">
      <label>Tercer autor</label>
      <input 
        type="text" 
        value={formLibro.tercer_autor} 
        onChange={e => setFormLibro({ ...formLibro, tercer_autor: e.target.value })} 
      placeholder="Ej: Carlos Gómez"
      />
    </div>

    <div className="libros-form-group">
      <label>ISBN</label>
      <input 
        type="text" 
        value={formLibro.isbn} 
        onChange={e => setFormLibro({ ...formLibro, isbn: e.target.value })} 
        placeholder="Ej: 978-3-16-148410-0"
      />
    </div>

    <div className="libros-form-group">
      <label>Serie</label>
      <input 
        type="text" 
        value={formLibro.serie} 
        onChange={e => setFormLibro({ ...formLibro, serie: e.target.value })} 
      placeholder="Ej: Serie Informática UTN"
      />
    </div>

    <div className="libros-form-group">
      <label>Editorial</label>
      <input 
        type="text" 
        value={formLibro.editorial} 
        onChange={e => setFormLibro({ ...formLibro, editorial: e.target.value })} 
      placeholder="Ej: Alfaomega"
      />
    </div>

    <div className="libros-form-group">
      <label>Edición</label>
      <input 
        type="text" 
        value={formLibro.edicion} 
        onChange={e => setFormLibro({ ...formLibro, edicion: e.target.value })} 
      placeholder="Ej: 2ª edición revisada"
      />
    </div>

    <div className="libros-form-group">
      <label>Lugar</label>
      <input 
        type="text" 
        value={formLibro.lugar} 
        onChange={e => setFormLibro({ ...formLibro, lugar: e.target.value })} 
      placeholder="Ej: Buenos Aires. Argentina"
      />
    </div>

    <div className="libros-form-group">
      <label>Año</label>
      <input 
        type="number" 
        min="1"
        value={formLibro.anio} 
        onChange={e => setFormLibro({ ...formLibro, anio: e.target.value })} 
      placeholder="Ej: 2020"
      />
    </div>

    <div className="libros-form-group">
      <label>Cantidad de páginas</label>
      <input 
        type="number" 
        min="1"
        value={formLibro.cant_paginas} 
        onChange={e => setFormLibro({ ...formLibro, cant_paginas: e.target.value })} 
      placeholder="Ej: 350"
      />
    </div>

    <div className="libros-form-group">
      <label>Tamaño</label>
      <input 
        type="text" 
        value={formLibro.tamano} 
        onChange={e => setFormLibro({ ...formLibro, tamano: e.target.value })} 
      placeholder="Ej: 21x29 cm"
      />
    </div>

    <div className="libros-form-group">
      <label>Idioma</label>
      <input 
        type="text" 
        value={formLibro.idioma} 
        onChange={e => setFormLibro({ ...formLibro, idioma: e.target.value })} 
       placeholder="Ej: Español"
      />
    </div>

    <div className="libros-form-group">
      <label>Origen</label>
      <input 
        type="text" 
        value={formLibro.origen} 
        onChange={e => setFormLibro({ ...formLibro, origen: e.target.value })} 
      placeholder="Ej: Donación / Compra"
      />
    </div>

    <div className="libros-form-group">
      <label>Carrera</label>
      <input 
        type="text" 
        value={formLibro.ubicacion} 
        onChange={e => setFormLibro({ ...formLibro, ubicacion: e.target.value })} 
      placeholder="Ej: Ingeniería en Sistemas de Información"
      />
    </div>

    <div className="libros-form-group">
      <label>Nivel</label>
      <input 
        type="text" 
        value={formLibro.nivel} 
        onChange={e => setFormLibro({ ...formLibro, nivel: e.target.value })} 
       placeholder="Ej: 3 (año o nivel académico)"
      />
    </div>

    <div className="libros-form-group">
      <label>Días de préstamo</label>
      <input 
        type="number" 
        min="1"
        value={formLibro.dias_de_prestamo} 
        onChange={e => setFormLibro({ ...formLibro, dias_de_prestamo: e.target.value })} 
      />
    </div>

    <div className="libros-form-group">
      <label>Palabra clave</label>
      <input 
        type="text" 
        value={formLibro.palabra_clave} 
        onChange={e => setFormLibro({ ...formLibro, palabra_clave: e.target.value })} 
      placeholder="Ej: programación, estructuras, algoritmos"
      />
    </div>

    <div className="libros-form-group full-width">
      <label>Observaciones</label>
      <textarea 
        value={formLibro.observaciones} 
        onChange={e => setFormLibro({ ...formLibro, observaciones: e.target.value })} 
        rows="3"
      />
    </div>

    <div className="libros-form-group">
      <label>Estado</label>
      <select 
        value={formLibro.estado} 
        onChange={e => setFormLibro({ ...formLibro, estado: e.target.value })}
        required
      >
        <option value="libre">LIBRE</option>
        <option value="reservado">RESERVADO</option>
        <option value="en_prestamo">EN PRÉSTAMO</option>
      </select>
    </div>

    <div className="libros-form-group">
      <label>UID etiqueta</label>
      <input 
        type="text" 
        value={formLibro.uid_tarjeta} 
        onChange={e => setFormLibro({ ...formLibro, uid_tarjeta: e.target.value })} 
      placeholder="Ej: 0011223344"
      />
    </div>

    <div className="libros-form-actions">
      <button type="submit" className="libros-btn-submit"> Registrar Libro</button>
    </div>
  </form>
</section>


      {/* Buscador */}
      <section className="libros-section">
        <h2 className="libros-section-title"><i className="fa-solid fa-search"></i> Buscar Libros</h2>
        <div className="libros-buscador">
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} onKeyPress={handleKeyPress} placeholder="Buscar libro por título, autor, asignatura o ISBN..." />
          <button onClick={handleBuscar} className="libros-btn"><i className="fa-solid fa-search"></i> Buscar</button>
        </div>
        {libros.length>0 && (
          <div className="libros-resultados">
            <h3><i className="fa-solid fa-list"></i> Resultados ({libros.length})</h3>
            <table className="libros-table">
              <thead>
                <tr><th>ID</th><th>Título</th><th>Asignatura</th><th>Autor</th><th>Estado</th><th>UID</th></tr>
              </thead>
              <tbody>
                {libros.map(l=>
                  <tr key={l.id_libro}>
                    <td>{l.id_libro}</td>
                    <td><strong>{l.titulo}</strong>{l.sub_titulo && <><br/><small>{l.sub_titulo}</small></>}</td>
                    <td>{l.asignatura||"-"}</td>
                    <td>{l.autor||"-"}</td>
                    <td><span className={`libros-status libros-status-${l.estado}`}>{l.estado==='libre'?'Disponible':l.estado==='en_prestamo'?'En préstamo':'Reservado'}</span></td>
                    <td>{l.uid_tarjeta||"-"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Registrar préstamo */}
      <section className="libros-section">
        <h2 className="libros-section-title"> Registrar nuevo préstamo</h2>
        <form onSubmit={handleRegistrarPrestamo} className="libros-form">
          <div className="libros-form-group"><label>ID Libro *</label>
            <input type="number" value={nuevoPrestamo.id_libro} onChange={e=>setNuevoPrestamo({...nuevoPrestamo,id_libro:e.target.value})} required placeholder="Ej: 12"/>
          </div>
          <div className="libros-form-group"><label>ID Usuario</label>
            <select value={nuevoPrestamo.id_usuario} onChange={e=>setNuevoPrestamo({...nuevoPrestamo,id_usuario:e.target.value})} required>
              <option value="">Seleccionar usuario</option>
              {usuarios.map(u=><option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} - DNI: {u.id_usuario}</option>)}
            </select>
          </div>
          <div className="libros-form-group"><label>Fecha inicial</label>
            <input type="date" value={nuevoPrestamo.fecha_inicial} onChange={e=>setNuevoPrestamo({...nuevoPrestamo,fecha_inicial:e.target.value})} required />
          </div>
          <div className="libros-form-group"><label>Días de préstamo</label>
            <input type="number" min="1" max="30" value={nuevoPrestamo.dias_prestamo} onChange={e=>setNuevoPrestamo({...nuevoPrestamo,dias_prestamo:e.target.value})} />
          </div>
          <div className="libros-form-group"><label>Operador (opcional)</label>
            <select value={nuevoPrestamo.operador} onChange={e=>setNuevoPrestamo({...nuevoPrestamo,operador:e.target.value})}>
              <option value="">Sin operador</option>
              {operadores.map(op=><option key={op.id_operador} value={op.id_operador}>{op.nombre_completo}</option>)}
            </select>
          </div>
          <div className="libros-form-actions">
            <button type="submit" className="libros-btn-submit"><i className="fa-solid fa-check"></i> Registrar préstamo</button>
          </div>
        </form>
      </section>

      {/* Préstamos activos */}
      <section className="libros-section">
        <h2 className="libros-section-title"><i className="fa-solid fa-clock"></i> Préstamos activos ({prestamos.length})</h2>
        {loading ? <p>Cargando...</p> : prestamos.length===0 ? <p>No hay préstamos activos.</p> :
          <div className="libros-table-wrapper">
            <table className="libros-table">
              <thead>
                <tr><th>ID</th><th>Libro</th><th>Usuario</th><th>Tipo</th><th>Inicio</th><th>Vencimiento</th><th>Días restantes</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {prestamos.map(p=>
                  <tr key={p.id_prestamo}>
                    <td>{p.id_prestamo}</td>
                    <td><strong>{p.titulo}</strong></td>
                    <td>{p.usuario}</td>
                    <td><span className="libros-badge">{p.tipo_usuario}</span></td>
                    <td>{new Date(p.fecha_inicial).toLocaleDateString('es-AR')}</td>
                    <td>{new Date(p.fecha_final).toLocaleDateString('es-AR')}</td>
                    <td><span className={`libros-dias ${p.dias_restantes<0?'vencido':p.dias_restantes<=2?'proximo':''}`}>{p.dias_restantes} días</span></td>
                    <td><button className="libros-btn-devolver" onClick={()=>handleFinalizarPrestamo(p.id_prestamo)}>Devolver</button></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  );
}
