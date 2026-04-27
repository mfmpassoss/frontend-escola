import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    console.log("API_URL:", API_URL); // 🔥 COLOCA AQUI

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  email: email.trim(),
  senha: senha.trim()
})
      });

      const text = await res.text();

if (!res.ok) {
  console.log("ERRO REAL:", text);
  alert(text);
  return;
}

      const data = JSON.parse(text);

      // salva token
      localStorage.setItem("token", data.token);

      // redireciona
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com servidor");
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>🔐 Login</h2>

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Entrar
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a"
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    color: "#fff",
    minWidth: "300px"
  },
  title: {
    textAlign: "center"
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "none"
  },
  button: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    cursor: "pointer"
  }
};