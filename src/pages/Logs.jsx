import { useEffect, useState } from "react";
import "./Logs.css";
import API_URL from "../api";
function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function buscarLogs() {
      const res = await fetch(`${API_URL}/logs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setLogs(data);
    }

    buscarLogs();
  }, []);

  return (
    <div className="container">
      <h2>📊 Logs de Envio</h2>

      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Mensagem</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.numero}</td>
              <td>{log.mensagem}</td>
              <td>
                {log.status === "enviado" ? (
                  <span style={{ color: "green" }}>✔ Enviado</span>
                ) : (
                  <span style={{ color: "red" }}>❌ Erro</span>
                )}
              </td>
              <td>
                {new Date(log.data).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Logs;