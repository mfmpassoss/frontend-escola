import { useState, useEffect } from "react";
import "./CadastroAluno.css";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

export default function CadastroAluno() {
  const navigate = useNavigate();

  const [modalBolsa, setModalBolsa] = useState(false);
const [numerosBolsa, setNumerosBolsa] = useState("");
const [mensagemBolsa, setMensagemBolsa] = useState("");
const [arquivoBolsa, setArquivoBolsa] = useState(null);
  const [loadingBolsa, setLoadingBolsa] = useState(false);
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  }
}, []);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    curso: "",
    valor: "",
    vencimento: ""
  });

  const [alunos, setAlunos] = useState([]);

  

 useEffect(() => {
  fetch(`${API_URL}/alunos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
  const corrigido = data.map(aluno => ({
    ...aluno,
    fez_aula: aluno.fez_aula === true || aluno.fez_aula === "true"
  }));

  setAlunos(corrigido);
})
    .catch(err => console.error(err));
}, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
  e.preventDefault();

  try {
    const dataToSend = {
      ...form,
      valor: Number(form.valor || 0),
      vencimento: Number(form.vencimento || 1)
    };

    const response = await fetch(`${API_URL}/alunos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const novoAluno = await response.json();
    setAlunos([...alunos, novoAluno]);

  } catch (err) {
    console.error(err);
  }
}

 async function atualizarStatus(index, fezAulaBool) {
  const aluno = alunos[index];
  const semanaAtual = getSemanaAtual();

  try {
    await fetch(`${API_URL}/alunos/${aluno.id}/aula`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        fezAula: fezAulaBool,
        semana_aula: fezAulaBool ? semanaAtual : null
      })
    });

    const lista = [...alunos];
    lista[index].fez_aula = fezAulaBool;
    setAlunos(lista);

  } catch (err) {
    console.error(err);
  }
}

  async function atualizarPagamento(index, pagouBool) {
  const aluno = alunos[index];
  const mesAtual = new Date().getMonth();

  try {
    await fetch(`${API_URL}/alunos/${aluno.id}/pagamento`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        pagou: pagouBool,
        mes_pagamento: pagouBool ? mesAtual : null
      })
    });

    const lista = [...alunos];
    lista[index].pagou = pagouBool;
    lista[index].mes_pagamento = pagouBool ? mesAtual : null;

    setAlunos(lista);

  } catch (err) {
    console.error(err);
  }
}

  function verificarVencimentos(lista) {
    const hoje = new Date().getDate();

    return lista.map(aluno => {
      if (!aluno.vencimento) return aluno;

      if (aluno.pagou === false && hoje > Number(aluno.vencimento)) {
        return { ...aluno, pagou: false };
      }

      return aluno;
    });
  }

  async function deletarAluno(id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;

  try {
    await fetch(`${API_URL}/alunos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    // remove da tela
    setAlunos(alunos.filter(a => a.id !== id));

  } catch (err) {
    console.error(err);
    alert("Erro ao deletar");
  }
}

  async function enviarBolsa() {
  setLoadingBolsa(true);

  try {
    const lista = [...new Set(
      numerosBolsa
        .split(/[\n,;\s]+/)
        .map(n => n.replace(/\D/g, ""))
        .filter(n => n.length >= 10 && n.length <= 13)
        .map(n => n.startsWith("55") ? n : "55" + n)
    )];

    // validações
    if (!mensagemBolsa.trim()) {
      alert("Digite uma mensagem");
      return;
    }

    if (lista.length === 0) {
      alert("Nenhum número válido encontrado");
      return;
    }

    alert(`Total de números: ${lista.length}`);

    const formData = new FormData();
    formData.append("numeros", JSON.stringify(lista));
    formData.append("mensagem", mensagemBolsa);

    if (arquivoBolsa) {
      formData.append("arquivo", arquivoBolsa);
    }

    const res = await fetch(`${API_URL}/whatsapp/disparo`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  },
  body: formData
});

// 🔥 verifica se deu erro
if (!res.ok) {
  throw new Error("Erro no envio");
}

    // 🔥 verifica erro real
    if (!res.ok) {
      throw new Error("Erro no envio");
    }

    alert("Disparo iniciado 🚀");

    // limpa tudo
    setModalBolsa(false);
    setNumerosBolsa("");
    setMensagemBolsa("");
    setArquivoBolsa(null);

  } catch (err) {
    console.error(err);
    alert("Erro ao disparar");
  } finally {
    setLoadingBolsa(false); // 🔥 SEMPRE executa
  }
}
  function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

  function getSemanaAtual() {
  const data = new Date();
  const inicioAno = new Date(data.getFullYear(), 0, 1);
  const dias = Math.floor((data - inicioAno) / (24 * 60 * 60 * 1000));
  return Math.ceil((dias + inicioAno.getDay() + 1) / 7);
}
const semanaAtual = getSemanaAtual();

  // 🔥 CONTROLE DE DATA
  const hoje = new Date().getDate();
  const mesAtual = new Date().getMonth();

  // 🔥 RESET AUTOMÁTICO MENSAL
const alunosAtualizados = verificarVencimentos(
  alunos.map(aluno => {

    let novoAluno = { ...aluno };

    // 💳 pagamento
    if (novoAluno.mes_pagamento !== mesAtual) {
      novoAluno.pagou = false;
    }

    // 📆 aula
   // if (novoAluno.semana_aula !== semanaAtual) {
    //  novoAluno.fez_aula = false;;
   // }

    return novoAluno;
  })
);

  const totalSim = alunosAtualizados.filter(a => a.fez_aula === true).length;
  const totalNao = alunosAtualizados.filter(a => a.fez_aula === false).length;

  const emDia = alunosAtualizados.filter(aluno => {
    const dia = Number(aluno.vencimento || 0);
    return aluno.pagou === true || hoje < dia;
  }).length;

  const atrasados = alunosAtualizados.filter(aluno => {
    const dia = Number(aluno.vencimento || 0);
    return aluno.pagou === false && hoje > dia;
  }).length;

  const vencemHoje = alunosAtualizados.filter(
    a => Number(a.vencimento || 0) === hoje
  );

  function gerarLinkWhatsApp(telefone, nome) {
    const mensagem = `Olá ${nome}, tudo bem?`;
    return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  }

  async function cobrarAlunos() {
    const lista = alunos.filter(a => a.fezAula === false);

    for (const aluno of lista) {
      const mensagem = `Olá ${aluno.nome}, você ainda não agendou sua aula!`;
      const url = `https://wa.me/55${aluno.telefone}?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  async function cobrarPagamentos() {
    const lista = alunosAtualizados.filter(aluno => {
      const dia = Number(aluno.vencimento || 0);
      return aluno.pagou === false && hoje > dia;
    });

    for (const aluno of lista) {
      const mensagem = `Olá ${aluno.nome}, seu pagamento está em atraso.`;
      const url = `https://wa.me/55${aluno.telefone}?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  async function lembrarVencimento() {
    const lista = alunos.filter(
      a => Number(a.vencimento || 0) === hoje
    );

    for (const aluno of lista) {
      const mensagem = `Olá ${aluno.nome}, seu vencimento é hoje.`;
      const url = `https://wa.me/55${aluno.telefone}?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return (
    <div className="container">

      <div className="card-principal">
        <h2 className="titulo">Cadastro de Aluno</h2>

        <form onSubmit={handleSubmit} className="form">
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
          <input name="curso" placeholder="Curso" value={form.curso} onChange={handleChange} />
          <input name="valor" placeholder="Valor" value={form.valor} onChange={handleChange} />
          <input type="number" name="vencimento" placeholder="Dia (1-31)" value={form.vencimento} onChange={handleChange} />

          <button type="submit">Cadastrar</button>
        </form>

        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Curso</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Aula</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {alunosAtualizados.map((aluno, index) => {
              const dia = Number(aluno.vencimento || 0);

              return (
                <tr key={index}>
                  <td>
                    <span className={`status ${aluno.fez_aula ? "verde" : "vermelho"}`} />
                    {aluno.nome}
                  </td>

                  <td>{aluno.curso}</td>
                  <td>R$ {aluno.valor}</td>

                  <td>
                    <span className={`status ${
                      aluno.pagou === false && dia < hoje
                        ? "vermelho"
                        : aluno.pagou === false && dia === hoje
                        ? "amarelo"
                        : ""
                    }`} />
                    Dia {aluno.vencimento}
                  </td>

                  <td>
                  <select
  value={aluno.fez_aula ? "true" : false}
  onChange={(e) => atualizarStatus(index, e.target.value === "true")}
>
  <option value="true">Sim</option>
  <option value="false">Não</option>
</select>
                  </td>

                  <td>
                    <select
  value={aluno.pagou ? "true" : false}
  onChange={(e) => atualizarPagamento(index, e.target.value === "true")}
>
  <option value="true">Sim</option>
  "<option value="false">Não</option>
</select>
                  </td>

                  <td>
                    <a className="whatsapp-btn" href={gerarLinkWhatsApp(aluno.telefone, aluno.nome)} target="_blank">
                      WhatsApp
                    </a>
                    <button className="btn-delete"
  style={{ background: "red", color: "#fff", border: "none", padding: "5px", cursor: "pointer" }}
  onClick={() => deletarAluno(aluno.id)}
>
  ❌
</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="relatorios-esquerda">
        <div className="card azul">
          <h3>Em dia</h3>
          <p>{emDia}</p>
        </div>

        <div className="card vermelho">
          <h3>Atrasados</h3>
          <p>{atrasados}</p>
        </div>

        <div className="card amarelo">
          <h3>Vencem hoje</h3>
          <p>{vencemHoje.length}</p>
        </div>

        <button
  className="btn-cobrar-pagamento"
  onClick={async () => {
    try {
      const lista = alunosAtualizados.filter(aluno => {
        const dia = Number(aluno.vencimento || 0);
        return aluno.pagou === false && hoje > dia;
      });

      for (const aluno of lista) {
        await fetch(`${API_URL}/whatsapp/cobranca/${aluno.id}`, {
          method: "POST",
           headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
        });
      }

      alert("Mensagens enviadas 🚀");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar");
    }
  }}
>
  Cobrar atrasados
</button>

       <button
  className="btn-lembrete"
  onClick={async () => {
    try {
      const lista = alunos.filter(
        a => Number(a.vencimento || 0) === hoje
      );

      for (const aluno of lista) {
      await fetch(`${API_URL}/whatsapp/vencimento/${aluno.id}`, {
          method: "POST",
          headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
        });
      }

      alert("Lembretes enviados 📅");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar lembrete");
    }
  }}
>
  Lembrar vencimento
</button>
      </div>

      <div className="relatorios-direita">
        <div className="card verde">
          <h3>Marcaram</h3>
          <p>{totalSim}</p>
        </div>

        <div className="card vermelho">
          <h3>Faltam</h3>
          <p>{totalNao}</p>
        </div>

        <button
  className="btn-cobrar"
  onClick={async () => {
    try {
      const lista = alunos.filter(a => a.fez_aula === false);

      for (const aluno of lista) {
        await fetch(`${API_URL}/whatsapp/agendamento/${aluno.id}`, {
          method: "POST",
          headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
        });
      }

      alert("Mensagens de agendamento enviadas 📚");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar mensagem");
    }
  }}
>
  Pedir para agendar
</button>

        <button className="btn-relatorios" onClick={() => navigate("/relatorios")}>
          Relatórios
        </button>
        <button
  className="btn-bolsa"
  onClick={() => setModalBolsa(true)}
>
Disparar Bolsa
    🚀
</button>

<button onClick={() => navigate("/logs")}>
  📊 Logs
</button>

        <button onClick={logout}>
  Sair
</button>
      </div>


      return (
  <div className="container">

    {/* tudo que você já tem */}

    <div className="relatorios-direita">
      ...
    </div>

    {/* 🔥 MODAL AQUI */}
    {modalBolsa && (
      <div className="modal-overlay">
        <div className="modal">

          <h2>Disparar Bolsa</h2>

          <label>Números (um por linha)</label>
          <textarea
            placeholder="Ex: 92981668304"
            value={numerosBolsa}
            onChange={(e) => setNumerosBolsa(e.target.value)}
          />

          <label>Mensagem</label>
          <textarea
            placeholder="Digite a mensagem..."
            value={mensagemBolsa}
            onChange={(e) => setMensagemBolsa(e.target.value)}
          />

          <label>Imagem ou Vídeo</label>
          <input
            type="file"
            onChange={(e) => setArquivoBolsa(e.target.files[0])}
          />

          <div className="modal-actions">
  <button onClick={enviarBolsa} disabled={loadingBolsa}>
    {loadingBolsa ? "Enviando..." : "Enviar"}
  </button>

  <button onClick={() => setModalBolsa(false)}>
    Cancelar
  </button>
</div>

        </div>
      </div>
    )}

  </div>
);



    </div>
  );
}