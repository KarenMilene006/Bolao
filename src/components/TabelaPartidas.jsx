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

function labelStatus(status) {
  if (status === "FINISHED") return "Finalizado";
  if (status === "IN_PLAY") return "Ao vivo";
  if (status === "PAUSED") return "Intervalo";
  if (status === "SCHEDULED") return "Agendado";
  if (status === "TIMED") return "Programado";
  if (status === "POSTPONED") return "Adiado";
  return status;
}

function statusClasses(status) {
  // badge color
  if (status === "FINISHED")
    return "bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20";
  if (status === "IN_PLAY" || status === "PAUSED")
    return "bg-rose-600/10 text-rose-700 ring-1 ring-rose-600/20";
  if (status === "SCHEDULED" || status === "TIMED")
    return "bg-zinc-600/10 text-zinc-700 ring-1 ring-zinc-600/20";
  return "bg-zinc-600/10 text-zinc-700 ring-1 ring-zinc-600/20";
}

export const TabelaPartidas = () => {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rodada, setRodada] = useState("todas");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/football/competitions/PL/matches`);
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

  const rodadasDisponiveis = useMemo(() => {
    const set = new Set(partidas.map((p) => p.matchday).filter(Boolean));
    return Array.from(set).sort((a, b) => a - b);
  }, [partidas]);

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

  if (loading)
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 max-w-md mx-auto">
        <p className="text-sm text-zinc-600">Carregando partidas...</p>
      </div>
    );

  return (
    <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm max-w-md mx-auto h-[650px] flex flex-col overflow-hidden">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-zinc-100 px-4 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-purple-600/10 text-purple-700">
              <CalendarDays className="w-5 h-5" />
            </span>
            Partidas
          </h2>

          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 shadow-sm outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300"
              value={rodada}
              onChange={(e) => setRodada(e.target.value)}
            >
              <option value="todas">Todas as rodadas</option>
              {rodadasDisponiveis.map((r) => (
                <option key={r} value={r}>
                  Rodada {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Conteúdo scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {Object.entries(partidasPorData).map(([data, jogos]) => (
          <div key={data} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <CalendarDays className="w-4 h-4" />
              <span>{data}</span>
              <span className="ml-auto text-[11px] text-zinc-400">
                {jogos.length} jogo(s)
              </span>
            </div>

            <div className="space-y-3">
              {jogos.map((jogo) => {
                const home = jogo.score?.fullTime?.home;
                const away = jogo.score?.fullTime?.away;

                return (
                  <article
                    key={jogo.id}
                    className="rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* topo do card */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          statusClasses(jogo.status),
                        ].join(" ")}
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        {labelStatus(jogo.status)}
                      </span>

                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatarHora(jogo.utcDate)}
                      </span>
                    </div>

                    {/* meio do card */}
                    <div className="px-4 py-4">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        {/* Home */}
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={jogo.homeTeam.crest}
                            alt={jogo.homeTeam.name}
                            className="w-7 h-7 shrink-0"
                            loading="lazy"
                          />
                          <span className="font-medium text-zinc-900 truncate">
                            {jogo.homeTeam.shortName}
                          </span>
                        </div>

                        {/* Placar */}
                        <div className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                          <span className="text-lg font-extrabold text-purple-700 tabular-nums">
                            {(home ?? "-")}{" "}
                            <span className="text-zinc-400 font-bold">-</span>{" "}
                            {(away ?? "-")}
                          </span>
                        </div>

                        {/* Away */}
                        <div className="flex items-center justify-end gap-2 min-w-0">
                          <span className="font-medium text-zinc-900 truncate text-right">
                            {jogo.awayTeam.shortName}
                          </span>
                          <img
                            src={jogo.awayTeam.crest}
                            alt={jogo.awayTeam.name}
                            className="w-7 h-7 shrink-0"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500/60" />
                          Rodada {jogo.matchday}
                        </span>

                        {/* espaço pra você colocar estádio depois, se tiver */}
                        {/* <span className="truncate max-w-[160px]">Anfield</span> */}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
