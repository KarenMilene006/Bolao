import { BolaoEquipe } from "../../components/BolaoEquipe";
import { Header } from "../../components/Header";
import { ImportarJogos } from "../../components/ImportarJogos";
import Tabela from "../../components/TabelaJogos";
import { TabelaPartidas } from "../../components/TabelaPartidas";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className=" w-full mx-auto px-4 py-6">
        {/* Grid das tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabela de classificação */}
          <div className="bg-white rounded-xl shadow-sm">
            <Tabela />
          </div>

          {/* Tabela de partidas */}
          <div className="bg-white rounded-xl shadow-sm">
            <TabelaPartidas />
          </div>
        </div>

        <BolaoEquipe />

        <ImportarJogos />
      </main>
    </div>
  );
};
