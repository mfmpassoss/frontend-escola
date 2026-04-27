import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Relatorios.css";
import API_URL from "../api";

export default function Relatorios() {
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  }
}, []);
  

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
    fez_aula: aluno.fez_aula === true || aluno.fez_aula === "true",
    pagou: aluno.pagou === true || aluno.pagou === "true"
  }));

  setAlunos(corrigido);
})
    .catch(err => console.error(err));
}, []);

  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const mesAtualNumero = hoje.getMonth();

  const mesAtual = `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, "0")}`;

  const [view, setView] = useState(null);
  const [inputs, setInputs] = useState({});
  const [historicoAluno, setHistoricoAluno] = useState(null);

  const totalAlunos = alunos.length;

  const fizeramAula = alunos.filter(a => a.fez_aula === true).length;
  const naoFizeram = alunos.filter(a => a.fez_aula === false).length;

  const faturamento = alunos
    .filter(a => a.mes_pagamento === mesAtualNumero)
    .reduce((t, a) => t + Number(a.valor || 0), 0);

  const aReceber = alunos
    .filter(a => {
      const dia = Number(a.vencimento || 0);
      return a.mes_pagamento !== mesAtualNumero && diaHoje <= dia;
    })
    .reduce((t, a) => t + Number(a.valor || 0), 0);

  const atrasados = alunos
    .filter(a => {
      const dia = Number(a.vencimento || 0);
      return a.mes_pagamento !== mesAtualNumero && diaHoje > dia;
    })
    .reduce((t, a) => t + Number(a.valor || 0), 0);

  const totalReceber = aReceber + atrasados;

  const listaNaoFizeram = alunos.filter(a => a.fez_aula === false);

  const listaAtrasados = alunos.filter(a => {
    const dia = Number(a.vencimento || 0);
    return a.mes_pagamento !== mesAtualNumero && diaHoje > dia;
  });

  // 🔥 SALVAR MOTIVO NO BANCO
  async function salvarMotivo(aluno, tipo) {
    try {
      await fetch(`${API_URL}/motivos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          ,Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          aluno_id: aluno.id,
          mes: mesAtualNumero,
          tipo: tipo,
          motivo: inputs[aluno.nome] || ""
        })
      });

      alert("Motivo salvo no banco! 🚀");

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar motivo");
    }
  }

  // 🔥 BUSCAR HISTÓRICO DO BANCO
  async function verMotivo(aluno) {
  try {
    const res = await fetch(`${API_URL}/motivos/${aluno.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    setHistoricoAluno({
      nome: aluno.nome,
      dados: data
    });

  } catch (err) {
    console.error(err);
  }
}

  return (
    <div className="relatorio-container">

      <h1>📊 Relatórios</h1>

      {/* RESUMO */}
      <div className="secao">
        <h2>Resumo</h2>
        <div className="grid">
          <div className="card azul">
            <h3>Total de alunos</h3>
            <p>{totalAlunos}</p>
          </div>
        </div>
      </div>

      {/* AULAS */}
      <div className="secao">
        <h2>Aulas</h2>
        <div className="grid">
          <div className="card verde">
            <h3>Fizeram aula</h3>
            <p>{fizeramAula}</p>
          </div>

          <div
            className="card vermelho"
            onClick={() => setView("naoFizeram")}
          >
            <h3>Não fizeram</h3>
            <p>{naoFizeram}</p>
          </div>
        </div>
      </div>

      {/* FINANCEIRO */}
      <div className="secao">
        <h2>Financeiro</h2>
        <div className="grid">

          <div className="card verde">
            <h3>Faturado</h3>
            <p>R$ {faturamento}</p>
          </div>

          <div className="card azul">
            <h3>A receber</h3>
            <p>R$ {aReceber}</p>
          </div>

          <div
            className="card vermelho"
            onClick={() => setView("atrasados")}
          >
            <h3>Atrasados</h3>
            <p>R$ {atrasados}</p>
          </div>

          <div className="card roxo">
            <h3>Total a receber</h3>
            <p>R$ {totalReceber}</p>
          </div>

        </div>
      </div>

      {/* LISTA */}
      {view && (
        <div className="lista-detalhes">

          <h2>
            {view === "naoFizeram"
              ? "Alunos que não fizeram aula"
              : "Alunos atrasados"}
          </h2>

          {(view === "naoFizeram" ? listaNaoFizeram : listaAtrasados)
            .map((aluno) => (
              <div key={aluno.nome} className="item-lista">

                <strong>{aluno.nome}</strong>

                <input
                  type="text"
                  placeholder="Motivo..."
                  value={inputs[aluno.nome] || ""}
                  onChange={(e) =>
                    setInputs({
                      ...inputs,
                      [aluno.nome]: e.target.value
                    })
                  }
                />

                <button onClick={() => salvarMotivo(aluno, view)}>
                  Salvar
                </button>

                <button onClick={() => verMotivo(aluno)}>
                  Ver
                </button>

              </div>
          ))}

        </div>
      )}

      {/* HISTÓRICO */}
      {historicoAluno && (
        <div className="lista-detalhes">

          <h2>Histórico - {historicoAluno.nome}</h2>

          {historicoAluno.dados.map((item, i) => (
            <p key={i}>
              Mês {item.mes} | {item.tipo} → {item.motivo}
            </p>
          ))}

          <button onClick={() => setHistoricoAluno(null)}>
            Fechar
          </button>

        </div>
      )}

      <button className="btn-voltar" onClick={() => navigate("/")}>
        Voltar
      </button>

    </div>
  );
}