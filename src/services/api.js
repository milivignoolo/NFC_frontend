import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const api = {
  // ==========================
  // === USUARIOS ============
  // ==========================
  getUsers: () => axios.get(`${API_URL}/usuarios`),
  createUser: (data) => axios.post(`${API_URL}/usuarios`, data),
  getUserByUID: async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/usuarios/uid/${uid}`);
      return res;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return { data: null };
      }
      throw err;
    }
  },
  updateUser: (id_usuario, data) => axios.put(`${API_URL}/usuarios/${id_usuario}`, data),
  deleteUser: (id_usuario) => axios.delete(`${API_URL}/usuarios/${id_usuario}`),

  // ==========================
  // === OPERADORES ===========
  // ==========================
  getOperadores: () => axios.get(`${API_URL}/operadores`),
  createOperador: (data) => axios.post(`${API_URL}/operadores`, data),
  deleteOperador: (id_operador) => axios.delete(`${API_URL}/operadores/${id_operador}`),

  // ==========================
  // === TURNOS ===============
  // ==========================
  getTurnos: () => axios.get(`${API_URL}/turnos`),
  createTurno: (data) => axios.post(`${API_URL}/turnos`, data),
  updateTurnoEstado: (id, estado) => axios.put(`${API_URL}/turnos/${id}/estado`, { estado }),

  // ==========================
  // === DASHBOARD ===========
  // ==========================
  getAccesosHoy: () => axios.get(`${API_URL}/dashboard/accesos-hoy`),
  getPersonasDentro: () => axios.get(`${API_URL}/dashboard/personas-dentro`),
  getUltimaActividad: () => axios.get(`${API_URL}/dashboard/ultima-actividad`),
  getAccesosHoyDetalle: () => axios.get(`${API_URL}/dashboard/accesos-hoy-detalle`),

  // ==========================
  // === COMPUTADORAS =========
  // ==========================
  getComputadoras: () => axios.get(`${API_URL}/computadoras`),
  createComputadora: (data) => axios.post(`${API_URL}/computadoras`, data),
  updateEstadoComputadora: (id, estado) => axios.put(`${API_URL}/computadoras/${id}/estado`, { estado }),
  deleteComputadora: (id) => axios.delete(`${API_URL}/computadoras/${id}`),

  // ==========================
  // === PRÉSTAMOS COMPUTADORA =
  // ==========================
  getPrestamosComputadora: () => axios.get(`${API_URL}/prestamos-computadora`),
  createPrestamoComputadora: (data) => axios.post(`${API_URL}/prestamos-computadora`, data),
  finalizarPrestamoComputadora: (id, hora_fin) =>
    axios.put(`${API_URL}/prestamos-computadora/${id}/estado`, { hora_fin }),
  deletePrestamoComputadora: (id) => axios.delete(`${API_URL}/prestamos-computadora/${id}`),

  // ==========================
  // === LIBROS ===============
  // ==========================
  getLibros: () => axios.get(`${API_URL}/libros`),
  createLibro: (data) => axios.post(`${API_URL}/libros`, data),
  deleteLibro: (id_libro) => axios.delete(`${API_URL}/libros/${id_libro}`),
  buscarLibros: (query) => axios.get(`${API_URL}/libros/buscar`, { params: { query } }),
  getLibroByUID: (uid) => axios.get(`${API_URL}/libros/uid/${uid}`),

  // ==========================
  // === PRÉSTAMOS LIBROS =====
  // ==========================
  getPrestamosLibros: () => axios.get(`${API_URL}/prestamos-libros`),
  createPrestamoLibro: (data) => axios.post(`${API_URL}/prestamos-libros`, data),
  finalizarPrestamoLibro: (id) => axios.put(`${API_URL}/prestamos-libros/${id}/finalizar`, {}),

  // ==========================
  // === ENTRADAS (NFC) =======
  // ==========================
  registrarLecturaNFC: (uid_tarjeta) => axios.post(`${API_URL}/nfc`, { uid_tarjeta }),
  getEntradas: () => axios.get(`${API_URL}/entradas`),
  getUsuariosActivos: () => axios.get(`${API_URL}/entradas/activos`),
  getUltimoUID: () => axios.get(`${API_URL}/uid/ultimo`),

  // ==========================
  // === UID ==================
  // ==========================
  verificarUID: (uid) => axios.get(`${API_URL}/uid/verificar/${uid}`),
};