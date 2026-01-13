import React, { useEffect, useMemo, useState } from "react";
import supabase from "../supabase/supabaseCliente";
function siglaTime(jogo, lado) {
  const key = lado === "casa" ? "sigla_casa" : "sigla_fora";
  const nomeKey = lado === "casa" ? "time_casa" : "time_fora";
  return (
    jogo?.[key] ||
    (jogo?.[nomeKey] ? jogo[nomeKey].slice(0, 3).toUpperCase() : "???")
  );
}

function calcularPontos(palpiteCasa, palpiteFora, golsCasa, golsFora) {
  if (golsCasa == null || golsFora == null) return 0; // ainda sem placar final

  // 3 pontos: cravou
  if (palpiteCasa === golsCasa && palpiteFora === golsFora) return 3;

  // 1 ponto: acertou vencedor/empate
  const palpiteDiff = palpiteCasa - palpiteFora;
  const finalDiff = golsCasa - golsFora;

  const palpiteRes = palpiteDiff === 0 ? "E" : palpiteDiff > 0 ? "C" : "F";
  const finalRes = finalDiff === 0 ? "E" : finalDiff > 0 ? "C" : "F";

  return palpiteRes === finalRes ? 1 : 0;
}

function classePorPontos(pontos) {
  if (pontos === 3) return "bg-green-400 text-white";
  if (pontos === 1) return "bg-blue-500 text-white";
  return "bg-white text-gray-700";
}

export const BolaoEquipe = () => {
  const [loading, setLoading] = useState(true);

  // controles
  const [rodada, setRodada] = useState(20);
  const [temporada, setTemporada] = useState(2026);

  // dados
  const [jogos, setJogos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [palpites, setPalpites] = useState([]);

  // edição de célula
  const [edit, setEdit] = useState(null); 
  // edit = { participante_id, jogo_id, casa, fora }

  async function carregar() {
    try {
      setLoading(true);

      // jogos da rodada
      const { data: jogosData, error: e1 } = await supabase
        .from("jogos")
        .select("*")
        .eq("competicao", "PL")
        .eq("temporada", temporada)
        .eq("rodada", rodada)
        .order("data_hora", { ascending: true });

      if (e1) throw e1;

      // participantes
      const { data: partData, error: e2 } = await supabase
        .from("participantes")
        .select("id, nickname")
        .order("nickname", { ascending: true });

      if (e2) throw e2;

      // palpites da rodada (pelos ids dos jogos)
      const jogoIds = (jogosData || []).map((j) => j.id);
      let palpitesData = [];

      if (jogoIds.length) {
        const { data: pData, error: e3 } = await supabase
          .from("palpites")
          .select("*")
          .in("jogo_id", jogoIds);

        if (e3) throw e3;
        palpitesData = pData || [];
      }

      setJogos(jogosData || []);
      setParticipantes(partData || []);
      setPalpites(palpitesData || []);
    } catch (err) {
      console.error("Erro ao carregar bolão:", err);
      alert("Erro ao carregar dados. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEdit(null);
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rodada, temporada]);

  // maps
  const jogoMap = useMemo(() => {
    const map = new Map();
    for (const j of jogos) map.set(j.id, j);
    return map;
  }, [jogos]);

  const palpiteMap = useMemo(() => {
    const map = new Map();
    for (const p of palpites) {
      map.set(`${p.participante_id}:${p.jogo_id}`, p);
    }
    return map;
  }, [palpites]);

  function abrirEdicao(participante_id, jogo_id) {
    const atual = palpiteMap.get(`${participante_id}:${jogo_id}`);
    setEdit({
      participante_id,
      jogo_id,
      casa: atual?.palpite_casa ?? "",
      fora: atual?.palpite_fora ?? "",
    });
  }

  async function salvarPalpite() {
    if (!edit) return;

    const palpite_casa = Number(edit.casa);
    const palpite_fora = Number(edit.fora);

    if (Number.isNaN(palpite_casa) || Number.isNaN(palpite_fora)) {
      alert("Digite números válidos.");
      return;
    }
    if (palpite_casa < 0 || palpite_fora < 0) {
      alert("Não pode ser negativo.");
      return;
    }

    const jogo = jogoMap.get(edit.jogo_id);
    const pontos = calcularPontos(
      palpite_casa,
      palpite_fora,
      jogo?.gols_casa ?? null,
      jogo?.gols_fora ?? null
    );

    const payload = {
      participante_id: edit.participante_id,
      jogo_id: edit.jogo_id,
      palpite_casa,
      palpite_fora,
      pontos,
      atualizado_em: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("palpites")
      .upsert(payload, { onConflict: "participante_id,jogo_id" })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Erro ao salvar palpite: " + error.message);
      return;
    }

    // atualiza no estado local
    setPalpites((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.participante_id === data.participante_id &&
          p.jogo_id === data.jogo_id
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data;
        return copy;
      }
      return [...prev, data];
    });

    setEdit(null);
  }

  async function recalcularPontosDaRodada() {
    const updates = palpites
      .map((p) => {
        const jogo = jogoMap.get(p.jogo_id);
        if (!jogo) return null;

        const pontos = calcularPontos(
          p.palpite_casa,
          p.palpite_fora,
          jogo.gols_casa,
          jogo.gols_fora
        );

        if ((p.pontos ?? 0) === pontos) return null;
        return { id: p.id, pontos, atualizado_em: new Date().toISOString() };
      })
      .filter(Boolean);

    if (updates.length === 0) {
      alert("Nada para recalcular.");
      return;
    }

    const { error } = await supabase
      .from("palpites")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error(error);
      alert("Erro ao recalcular: " + error.message);
      return;
    }

    // atualiza estado local
    setPalpites((prev) => {
      const map = new Map(prev.map((x) => [x.id, x]));
      for (const u of updates) {
        const old = map.get(u.id);
        if (old) map.set(u.id, { ...old, pontos: u.pontos });
      }
      return Array.from(map.values());
    });

    alert(`✅ Recalculado: ${updates.length} palpites`);
  }

  if (loading) return <div className="p-4">Carregando bolão...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 py-8">
      <h1 className="text-center text-4xl md:text-5xl font-extrabold tracking-wide text-purple-800">
        BOLÃO RODADA {rodada} <span className="font-semibold">(Equipe)</span>
      </h1>

      {/* legenda + botão recalcular */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-green-100 border-green-200">
          <div className="w-5 h-5 rounded bg-green-500" />
          <div className="text-sm text-gray-800">
            <span className="font-semibold">CRAVADA</span>{" "}
            <span className="text-gray-600">+3 (placar exato)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-blue-100 border-blue-200">
          <div className="w-5 h-5 rounded bg-blue-500" />
          <div className="text-sm text-gray-800">
            <span className="font-semibold">VENCEDOR</span>{" "}
            <span className="text-gray-600">+1 (acertou quem ganhou)</span>
          </div>
        </div>

        <button
          onClick={recalcularPontosDaRodada}
          className="px-4 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Recalcular pontos
        </button>
      </div>

      {/* tabela */}
      <div className="mt-10 max-w-6xl mx-auto rounded-2xl bg-white shadow-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-100 to-purple-50 text-gray-900">
                <th className="px-6 py-5 text-left font-extrabold uppercase tracking-wide">
                  Participante
                </th>

                {jogos.map((j) => (
                  <th
                    key={j.id}
                    className="px-4 py-5 text-center font-extrabold uppercase tracking-wide"
                  >
                    <div className="leading-tight">{siglaTime(j, "casa")}</div>
                    <div className="leading-tight">{siglaTime(j, "fora")}</div>
                  </th>
                ))}

                <th className="px-6 py-5 text-center font-extrabold uppercase tracking-wide">
                  Pontos
                </th>
              </tr>
            </thead>

            <tbody>
              {participantes.map((p) => {
                let total = 0;

                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-6 py-6 font-semibold text-gray-800">
                      {p.nickname}
                    </td>

                    {jogos.map((j) => {
                      const key = `${p.id}:${j.id}`;
                      const palpite = palpiteMap.get(key);

                      const pontosCelula = palpite?.pontos ?? 0;
                      const classe = classePorPontos(pontosCelula);

                      total += pontosCelula;

                      const estaEditando =
                        edit &&
                        edit.participante_id === p.id &&
                        edit.jogo_id === j.id;

                      return (
                        <td
                          key={j.id}
                          className={`px-2 py-3 text-center font-semibold ${classe}`}
                        >
                          {estaEditando ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                value={edit.casa}
                                onChange={(e) =>
                                  setEdit((prev) => ({
                                    ...prev,
                                    casa: e.target.value,
                                  }))
                                }
                                className="w-10 border rounded px-2 py-1 text-center text-gray-900"
                                inputMode="numeric"
                              />
                              <span className="text-gray-200">-</span>
                              <input
                                value={edit.fora}
                                onChange={(e) =>
                                  setEdit((prev) => ({
                                    ...prev,
                                    fora: e.target.value,
                                  }))
                                }
                                className="w-10 border rounded px-2 py-1 text-center text-gray-900"
                                inputMode="numeric"
                              />
                              <button
                                onClick={salvarPalpite}
                                className="ml-2 px-2 py-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
                              >
                                Salvar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => abrirEdicao(p.id, j.id)}
                              className="w-full rounded-lg py-2 hover:bg-black/5 transition"
                              title="Clique para palpitar"
                            >
                              {palpite
                                ? `${palpite.palpite_casa}-${palpite.palpite_fora}`
                                : "—"}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-6 py-6 text-center">
                      <span className="text-2xl font-extrabold text-purple-700">
                        {total}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* placar final */}
              <tr className="border-t-4 border-purple-600 bg-gradient-to-r from-purple-100 to-purple-50">
                <td className="px-6 py-6 font-extrabold uppercase tracking-wide text-purple-800">
                  Placar Final
                </td>

                {jogos.map((j) => (
                  <td
                    key={`final-${j.id}`}
                    className="px-4 py-6 text-center font-extrabold text-gray-900"
                  >
                    {j.gols_casa == null || j.gols_fora == null
                      ? "—"
                      : `${j.gols_casa}-${j.gols_fora}`}
                  </td>
                ))}

                <td className="px-6 py-6" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* controles */}
      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600">
        <span>Temporada:</span>
        <input
          className="border rounded px-2 py-1 w-24"
          type="number"
          value={temporada}
          onChange={(e) => setTemporada(Number(e.target.value))}
        />
        <span>Rodada:</span>
        <input
          className="border rounded px-2 py-1 w-20"
          type="number"
          value={rodada}
          onChange={(e) => setRodada(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
