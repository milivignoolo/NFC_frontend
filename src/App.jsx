import { useState } from "react";
import Tabs from "./components/Tabs/Tabs";
import Dashboard from "./components/Dashboard/Dashboard";
import Users from "./components/Users/Users";
import Libros from "./components/Libros/Libros";
import UIDChecker from "./components/UIDChecker/UIDChecker";
import Computadora from "./components/Computadoras/Computadoras";
import Operadores from "./components/Operadores/Operadores";


export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="app">
      <Tabs onSelectTab={setTab} />

      <main>
        {tab === "dashboard" && <Dashboard />}
        {tab === "users" && <Users />}
        {tab === "libros" && <Libros />}
        {tab === "uid" && <UIDChecker />}
        {tab === "computadoras" && <Computadora />}
        {tab === "operadores" && <Operadores />}
      </main>
    </div>
  );
}
