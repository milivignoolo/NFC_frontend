import { useState } from "react";

export default function Tabs({ onSelectTab }) {
  const [active, setActive] = useState("dashboard");

  const handleSelect = (tab) => {
    setActive(tab);
    onSelectTab(tab);
  };

  return (
    <div className="tabs-container">
      {/* Header del panel */}
      <header className="header">
        <h1>Sistema de Control de Acceso NFC</h1>
        <p className="subtitle">Panel de monitoreo general</p>
      </header>

      {/* Navegación de pestañas */}
      <nav className="tabs">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "users", label: "Usuarios" },
          { id: "libros", label: "Libros" },
          { id: "uid", label: "UID Checker" },
          { id: "computadoras", label: "Computadoras" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={active === tab.id ? "active" : ""}
            onClick={() => handleSelect(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
