import React, { useEffect, useState } from "react";

export default function Tabela() {
  const [tabela, setTabela] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarTabela = async () => {
      try {
        const resp = await fetch('http://localhost:3001/api/football/competitions/PL/standings', {
          headers: {
            "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API
          }
        });

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

  if (carregando) return <p className="text-zinc-300">Carregando tabela...</p>;
  if (erro) return <p className="text-red-500">{erro}</p>;

  return (
    <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 text-white w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Tabela Premier League</h2>

      <table className="w-full text-sm">
        <thead className="text-zinc-400 border-b border-zinc-600">
          <tr>
            <th className="py-2 text-left">#</th>
            <th className="text-left">Clube</th>
            <th>P</th>
            <th>J</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>SG</th>
          </tr>
        </thead>

        <tbody>
          {tabela.map((item) => (
            <tr
              key={item.team.id}
              className="border-b border-zinc-700 text-center"
            >
              <td className="py-2">{item.position}</td>
              <td className="text-left flex items-center gap-2">
                <img
                  src={item.team.crest}
                  alt={item.team.name}
                  className="w-5 h-5"
                />
                {item.team.shortName}
              </td>
              <td>{item.points}</td>
              <td>{item.playedGames}</td>
              <td>{item.won}</td>
              <td>{item.draw}</td>
              <td>{item.lost}</td>
              <td>{item.goalDifference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
