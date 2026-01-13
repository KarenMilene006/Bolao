import { useState } from "react";
import supabase from "../supabase/supabaseCliente";
// e use sua URL do backend proxy:
const API = import.meta.env.VITE_BACKEND_URL;

export function ImportarJogos() {
  const [rodada, setRodada] = useState(20);
  const [msg, setMsg] = useState("");

  async function importar() {
    setMsg("Buscando jogos na API...");

    const res = await fetch(`${API}/api/football/competitions/PL/matches`);
    const data = await res.json();

    const jogosDaRodada = (data.matches || []).filter(
      (m) => Number(m.matchday) === Number(rodada)
    );

    if (!jogosDaRodada.length) {
      setMsg("Nenhum jogo encontrado nessa rodada.");
      return;
    }

    const temporada = new Date(jogosDaRodada[0].utcDate).getUTCFullYear();

    const rows = jogosDaRodada.map((m) => ({
      competicao: "PL",
      temporada,
      rodada: Number(rodada),
      api_jogo_id: m.id,
      data_hora: m.utcDate,
      status: m.status,
      time_casa: m.homeTeam?.name,
      time_fora: m.awayTeam?.name,
      sigla_casa: m.homeTeam?.tla || m.homeTeam?.shortName,
      sigla_fora: m.awayTeam?.tla || m.awayTeam?.shortName,
      escudo_casa: m.homeTeam?.crest,
      escudo_fora: m.awayTeam?.crest,
      gols_casa: m.score?.fullTime?.home ?? null,
      gols_fora: m.score?.fullTime?.away ?? null,
    }));

    setMsg("Salvando no Supabase...");

    const { error } = await supabase
      .from("jogos")
      .upsert(rows, { onConflict: "api_jogo_id" });

    if (error) {
      console.error(error);
      setMsg("Erro ao salvar: " + error.message);
      return;
    }

    setMsg(`✅ Jogos da rodada ${rodada} salvos com sucesso (${rows.length} jogos).`);
  }

  return (
    <div className="p-4 border rounded-xl bg-white">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={rodada}
          onChange={(e) => setRodada(e.target.value)}
          className="border rounded px-2 py-1 w-24"
        />
        <button
          onClick={importar}
          className="px-3 py-2 rounded bg-purple-600 text-white"
        >
          Importar jogos
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-600">{msg}</p>
    </div>
  );
}
