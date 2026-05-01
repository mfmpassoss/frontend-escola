import { Routes, Route } from "react-router-dom";
import CadastroAluno from "./pages/CadastroAluno";
import Relatorios from "./pages/Relatorios";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Logs from "./pages/Logs";

function App() {
  return (
    <Routes>

      {/* 🔓 Login (única rota aberta) */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 Rotas protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <CadastroAluno />
          </PrivateRoute>
        }
      />

      <Route
        path="/relatorios"
        element={
          <PrivateRoute>
            <Relatorios />
          </PrivateRoute>
        }
      />
      <Route
  path="/logs"
  element={
    <PrivateRoute>
      <Logs />
    </PrivateRoute>
  }
/>   

    </Routes>
  );
}

export default App; 