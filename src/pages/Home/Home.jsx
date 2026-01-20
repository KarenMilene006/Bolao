import { BolaoEquipe } from "../../components/BolaoEquipe";
import { Header } from "../../components/Header";
import { ImportarJogos } from "../../components/ImportarJogos";
import Tabela from "../../components/TabelaJogos";
import { TabelaPartidas } from "../../components/tabelapartidas";
export const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Título da seção */}
        <section className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Premier League
          </h1>
          <p className="text-sm text-zinc-500">
            Classificação e resultados da temporada
          </p>
        </section>

        {/* Grid principal */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Classificação */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-600">
              Tabela de Classificação
            </h2>
            <Tabela />
          </div>

          {/* Partidas */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-600">
              Resultados e Partidas
            </h2>
            <TabelaPartidas />
          </div>
        </section>

        {/* Outras seções */}
        <section className="space-y-8">
          <BolaoEquipe />
          <ImportarJogos />
        </section>
      </main>
    </div>
  );
};
