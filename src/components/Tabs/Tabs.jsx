import { useState } from "react";
import "./Tabs.css";

export default function Tabs({ onSelectTab }) {
  const [active, setActive] = useState("dashboard");

  const handleSelect = (tab) => {
    setActive(tab);
    onSelectTab(tab);
  };

  return (
    <>
      {/* Contenedor del header */}
      <div className="tabs-header-container">
        <header className="tabs-header">
          <h1 className="tabs-title">Sistema de Control de Acceso NFC</h1>
          <p className="tabs-subtitle">Panel de monitoreo general</p>
        </header>
      </div>

      {/* Contenedor de navegación de pestañas */}
      <div className="tabs-nav-container">
        <nav className="tabs-nav">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "users", label: "Usuarios" },
            { id: "libros", label: "Libros" },
            { id: "uid", label: "Verificador de UID" },
            { id: "computadoras", label: "Computadoras" },
            { id: "operadores", label: "Operadores"},
            { id: "turnos", label: "Turnos"},
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tabs-btn ${active === tab.id ? "tabs-btn-active" : ""}`}
              onClick={() => handleSelect(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
