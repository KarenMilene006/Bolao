import React, { useEffect, useState } from "react";

export default function Tabela() {
  const [tabela, setTabela] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarTabela = async () => {
      try {
        const resp = await fetch(
          "http://localhost:3001/api/football/competitions/PL/standings",
          {
            headers: {
              "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API,
            },
          },
        );

        const data = await resp.json();

        if (!data.standings || !data.standings[0].table) {
          setErro("Não foi possível carregar a tabela.");
          return;
        }

        setTabela(data.standings[0].table);
      } catch (err) {
        setErro("Erro ao conectar com a API.");
      }

      setCarregando(false);
    };

    carregarTabela();
  }, []);

  if (carregando) return <p className="text-zinc-600">Carregando tabela...</p>;
  if (erro) return <p className="text-red-500">{erro}</p>;

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-lg font-semibold text-zinc-900">
          Tabela Premier League
        </h2>
        <p className="text-sm text-zinc-500">Classificação atual</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600 border-y border-zinc-200">
            <tr>
              <th className="py-3 px-4 text-left w-17.5">#</th>
              <th className="py-3 px-4 text-left">Clube</th>
              <th className="py-3 px-2 text-center">P</th>
              <th className="py-3 px-2 text-center">J</th>
              <th className="py-3 px-2 text-center">V</th>
              <th className="py-3 px-2 text-center">E</th>
              <th className="py-3 px-2 text-center">D</th>
              <th className="py-3 px-2 text-center">SG</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {tabela.map((item) => {
              const top5 = item.position <= 5;

              return (
                <tr
                  key={item.team.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  {/* POSIÇÃO com bolinha verde nos 5 primeiros */}
                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "inline-flex h-2.5 w-2.5 rounded-full",
                          top5 ? "bg-emerald-500" : "bg-transparent",
                        ].join(" ")}
                      />
                      <span className="font-medium text-zinc-900">
                        {item.position}
                      </span>
                    </div>
                  </td>

                  {/* CLUBE */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.team.crest}
                        alt={item.team.name}
                        className="w-5 h-5"
                        loading="lazy"
                      />
                      <span className="text-zinc-900">
                        {item.team.shortName}
                      </span>
                    </div>
                  </td>

                  {/* NÚMEROS */}
                  <td className="py-3 px-2 text-center font-semibold text-zinc-900">
                    {item.points}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-700">
                    {item.playedGames}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-700">
                    {item.won}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-700">
                    {item.draw}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-700">
                    {item.lost}
                  </td>
                  <td className="py-3 px-2 text-center text-zinc-700">
                    {item.goalDifference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
