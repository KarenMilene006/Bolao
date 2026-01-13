import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase/supabaseCliente";

export const Login = () => {
  const [aba, setAba] = useState("login");
  const [nickname, setNickname] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const entrar = async () => {
    setErro("");
    setCarregando(true);

    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .eq("nickname", nickname)
      .eq("senha", senha)
      .single();

    setCarregando(false);

    if (error || !data) {
      setErro("Nickname ou senha incorretos.");
      return;
    }

    alert(`Bem-vindo, ${data.nickname}!`);
    navigate("/home"); // << redirecionamento
  };

  const cadastrar = async () => {
    setErro("");
    setCarregando(true);

    const { data: existente } = await supabase
      .from("participantes")
      .select("*")
      .eq("nickname", nickname)
      .single();

    if (existente) {
      setCarregando(false);
      setErro("Este nickname já está em uso!");
      return;
    }

    const { error } = await supabase
      .from("participantes")
      .insert([{ nickname, senha }]);

    setCarregando(false);

    if (error) {
      setErro("Erro ao cadastrar. Tente novamente.");
      return;
    }

    alert("Cadastro realizado com sucesso! Agora faça login.");
    setAba("login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-900 text-white">
      <div className="w-100 bg-zinc-800 p-6 rounded-2xl shadow-2xl border border-zinc-700">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Futebol Inglês Brasil
        </h1>
        <p className="text-sm text-center text-zinc-400">
          Bolão Premier League — lives, palpites e resultados
        </p>
        <p className="text-xs text-center text-zinc-500 mt-1">
          Entre na comunidade e acompanhe as rodadas!
        </p>

        {/* TABS */}
        <div className="flex mt-5 border-b border-zinc-700">
          <button
            onClick={() => setAba("login")}
            className={`flex-1 py-2 text-center ${
              aba === "login" ? "border-b-2 border-green-500 font-semibold" : "text-zinc-400"
            }`}
          >
            Já sou participante
          </button>
          <button
            onClick={() => setAba("cadastro")}
            className={`flex-1 py-2 text-center ${
              aba === "cadastro" ? "border-b-2 border-green-500 font-semibold" : "text-zinc-400"
            }`}
          >
            Quero participar
          </button>
        </div>

        {/* FORM */}
        <div className="mt-5 flex flex-col gap-3">
          <label className="text-sm">Nickname</label>
          <input
            className="bg-zinc-700 px-3 py-2 rounded-md outline-none"
            placeholder="@seu-nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <label className="text-sm mt-1">Senha</label>
          <input
            type="password"
            className="bg-zinc-700 px-3 py-2 rounded-md outline-none"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {erro && <p className="text-red-500 text-sm mt-3">{erro}</p>}

        <button
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-md mt-5 font-semibold"
          onClick={aba === "login" ? entrar : cadastrar}
          disabled={carregando}
        >
          {carregando
            ? "Carregando..."
            : aba === "login"
            ? "Entrar no sistema"
            : "Criar conta"}
        </button>

        {aba === "login" && (
          <p className="text-xs text-center text-zinc-400 mt-3 cursor-pointer">
            Esqueceu a senha?
          </p>
        )}

        <p className="text-center text-xs text-zinc-500 mt-5">
          Powered by Futebol Inglês Brasil — área exclusiva
        </p>
      </div>
    </div>
  );
}
