import { create_dir_obj, append_dir } from "./dir_control.mjs";
import { create_file_obj, append_file_to_dir, concat_to_file } from "./file_control.mjs";
import { openApp, closeApp, APPS } from "./wm.mjs";

export const curr_dir_pointer = {
   "curr_dir_string" : "",
   "curr_dir_object" : {}
};

const root = create_dir_obj("root");
root.pwd = "/";
root.father_dir = {};

curr_dir_pointer.curr_dir_object = root;
curr_dir_pointer.curr_dir_string = root.pwd;

// Avisa os apps abertos (terminal, arquivos...) que algo mudou na árvore ou no diretório atual
export const notificar_fs = () => window.dispatchEvent(new Event("fschange"));

// Conteúdo inicial de exemplo
append_dir(root, create_dir_obj("Documentos"));
const leia_me = create_file_obj("leia-me.txt");
concat_to_file(leia_me, "Abra dois apps para ver o tiling.\nUse o terminal (mkdir, touch, cd, edit) ou o app Arquivos.");
append_file_to_dir(root, leia_me);


window.abrirTerminalModal = () => openApp("terminal");
window.abrirEditor = () => openApp("editor");
window.abrirArquivos = () => openApp("files");

// Menu iniciar
const menu = document.getElementById("start-menu");
document.getElementById("start-btn").addEventListener("click", e => {
   e.stopPropagation();
   menu.classList.toggle("hidden");
});
document.addEventListener("click", () => menu.classList.add("hidden"));

// Dock (ponto sob apps abertos) e nome do app em foco na barra de menu
const botoesDock = document.querySelectorAll(".dock-btn");
const nomeApp = document.getElementById("app-name");
window.addEventListener("wmchange", ({ detail: { abertos, focado } }) => {
   botoesDock.forEach(b => b.classList.toggle("aberto", abertos.includes(b.dataset.app)));
   nomeApp.textContent = focado ? APPS[focado].title : "Início";
});

// Relógio
const relogio = document.getElementById("clock");
const tick = () => relogio.textContent = new Date().toLocaleString("pt-BR", {
   weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
});
tick(); setInterval(tick, 10000);

// Atalhos: Alt+Enter abre o terminal, Alt+Q fecha a janela em foco
document.addEventListener("keydown", e => {
   if (!e.altKey) return;
   if (e.key === "Enter")           { e.preventDefault(); openApp("terminal"); }
   if (e.key.toLowerCase() === "e") { e.preventDefault(); openApp("editor"); }
   if (e.key.toLowerCase() === "f") { e.preventDefault(); openApp("files"); }
   if (e.key.toLowerCase() === "q") { e.preventDefault(); closeApp(); }
});
