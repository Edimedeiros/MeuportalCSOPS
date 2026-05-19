import React, { useState } from "react";
import {
  Upload,
  KeyRound,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  UserCircle,
  Pencil,
  Mail,
} from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import Badge from "../ui/Badge.jsx";

export default function SettingsView({
  profilePhoto,
  setProfilePhoto,
  theme,
  setTheme,
  profileName,
  setProfileName,
  onLog,
  notify,
  requestText,
}) {
  const [email, setEmail] = useState("edimarley.oliveira@acessorias.com");

  function uploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(reader.result);
      onLog?.("Foto alterada", "Configurações", "Foto de perfil atualizada");
      notify?.("Foto de perfil atualizada.", "success");
    };
    reader.readAsDataURL(file);
  }

  function requestPasswordChange() {
    notify?.("Link de redefinição de senha simulado enviado para o e-mail cadastrado.", "success");
    onLog?.("Senha solicitada", "Configurações", "Usuário solicitou redefinição de senha");
  }

  function requestEmailChange() {
    requestText?.({
      title: "Trocar e-mail de acesso",
      label: "Novo e-mail",
      initialValue: email,
      confirmLabel: "Enviar confirmação",
      onConfirm: (newEmail) => {
        if (!newEmail || !String(newEmail).includes("@")) {
          notify?.("Informe um e-mail válido.", "error");
          return;
        }
        notify?.("Link de confirmação enviado para o e-mail antigo: " + email, "success");
        onLog?.("Troca de e-mail solicitada", "Configurações", email + " -> " + newEmail);
        setEmail(newEmail);
      },
    });
  }

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h4 className="mb-4 font-semibold text-stone-900">Meu perfil</h4>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-stone-100 text-stone-500">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-10 w-10" />
                )}
              </div>
              <label className="cursor-pointer rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                <Upload className="mr-2 inline h-4 w-4" />
                Inserir minha foto
                <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
              </label>
            </div>
            <TextInput value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nome" />
            <div className="mt-3">
              <TextInput value={email} readOnly placeholder="E-mail" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h4 className="mb-4 font-semibold text-stone-900">Segurança</h4>
            <div className="space-y-3">
              <button onClick={requestPasswordChange} className="security-action flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left hover:bg-stone-100 transition">
                <span className="flex items-center gap-3 text-sm font-medium text-stone-700">
                  <KeyRound className="h-4 w-4" />
                  Redefinir senha
                </span>
                <Pencil className="h-4 w-4 text-stone-400" />
              </button>
              <button onClick={requestEmailChange} className="security-action flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left hover:bg-stone-100 transition">
                <span className="flex items-center gap-3 text-sm font-medium text-stone-700">
                  <Mail className="h-4 w-4" />
                  Trocar e-mail
                </span>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">Confirmação no e-mail antigo</Badge>
              </button>
              <button className="security-action flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left hover:bg-stone-100 transition">
                <span className="flex items-center gap-3 text-sm font-medium text-stone-700">
                  <Smartphone className="h-4 w-4" />
                  Ativar MFA
                </span>
                <Badge className="border-amber-200 bg-amber-50 text-amber-700">Recomendado</Badge>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h4 className="mb-4 font-semibold text-stone-900">Tema</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => { setTheme("light"); onLog?.("Tema alterado", "Configurações", "Tema Claro"); }}
                className={`rounded-2xl border p-4 text-left transition ${theme === "light" ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white"}`}
              >
                <Sun className="mb-2 h-5 w-5 text-stone-700" />
                <p className="font-medium text-stone-800">Claro</p>
                <p className="text-xs text-stone-500">Visual limpo e leve</p>
              </button>
              <button
                onClick={() => { setTheme("dark"); onLog?.("Tema alterado", "Configurações", "Tema Escuro"); }}
                className={`rounded-2xl border bg-stone-950 p-4 text-left text-white transition ${theme === "dark" ? "border-stone-500" : "border-stone-800"}`}
              >
                <Moon className="mb-2 h-5 w-5" />
                <p className="font-medium">Escuro</p>
                <p className="text-xs text-stone-300">Ideal para baixa luz</p>
              </button>
              <button
                onClick={() => { setTheme("plaky"); onLog?.("Tema alterado", "Configurações", "Tema Azul"); }}
                className={`theme-choice-blue rounded-2xl border bg-[#00458f] p-4 text-left text-white transition ${theme === "plaky" ? "border-cyan-300" : "border-[#0072ce]"}`}
              >
                <Monitor className="mb-2 h-5 w-5 text-cyan-200" />
                <p className="font-medium">Azul</p>
                <p className="text-xs text-blue-100/90">Paleta azul profissional</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
