import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URL;

function formatarData(dataISO) {
  return new Date(dataISO).toLocaleDateString("pt-BR");
}

function formatarHora(dataISO) {
  return new Date(dataISO).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const TabelaPartidas = () => {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rodada, setRodada] = useState("todas");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const res = await fetch(
          `${API}/api/football/competitions/PL/matches`
        );
        const data = await res.json();
        setPartidas(data.matches || []);
      } catch (err) {
        console.error("Erro ao buscar partidas", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const partidasPorData = useMemo(() => {
    const filtradas =
      rodada === "todas"
        ? partidas
        : partidas.filter((p) => p.matchday === Number(rodada));

    return filtradas.reduce((acc, partida) => {
      const data = formatarData(partida.utcDate);
      if (!acc[data]) acc[data] = [];
      acc[data].push(partida);
      return acc;
    }, {});
  }, [partidas, rodada]);

  if (loading) return <p>Carregando partidas...</p>;

  return (
    <div className="bg-white rounded-xl border p-4 max-w-md mx-auto h-[650px] flex flex-col">
      {/* Header fixo */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-purple-700">
          <CalendarDays className="w-5 h-5" />
          Partidas
        </h2>

        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={rodada}
          onChange={(e) => setRodada(e.target.value)}
        >
          <option value="todas">Todas as rodadas</option>
          {[...new Set(partidas.map((p) => p.matchday))].map((r) => (
            <option key={r} value={r}>
              Rodada {r}
            </option>
          ))}
        </select>
      </div>

      {/* Scroll aqui 👇 */}
      <div className="overflow-y-auto pr-1 space-y-6">
        {Object.entries(partidasPorData).map(([data, jogos]) => (
          <div key={data}>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <CalendarDays className="w-4 h-4" />
              {data}
            </div>

            <div className="space-y-3">
              {jogos.map((jogo) => (
                <div
                  key={jogo.id}
                  className="border rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-green-600 text-white px-2 py-0.5 rounded-full">
                      {jogo.status === "FINISHED"
                        ? "Finalizado"
                        : jogo.status}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatarHora(jogo.utcDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={jogo.homeTeam.crest}
                        alt={jogo.homeTeam.name}
                        className="w-6 h-6"
                      />
                      <span className="font-medium">
                        {jogo.homeTeam.shortName}
                      </span>
                    </div>

                    <span className="text-lg font-bold text-purple-700">
                      {jogo.score.fullTime.home} -{" "}
                      {jogo.score.fullTime.away}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {jogo.awayTeam.shortName}
                      </span>
                      <img
                        src={jogo.awayTeam.crest}
                        alt={jogo.awayTeam.name}
                        className="w-6 h-6"
                      />
                    </div>
                  </div>

                  <span className="text-xs text-gray-500">
                    Rodada {jogo.matchday}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
