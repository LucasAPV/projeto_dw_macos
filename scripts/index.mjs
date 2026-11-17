import { create_dir_obj, append_dir } from "./dir_control.mjs";
import { create_file_obj, append_file_to_dir, concat_to_file } from "./file_control.mjs";
import { openApp, closeApp, APPS } from "./wm.mjs";
import { load_fs, save_fs, reset_fs } from "./storage.mjs";

export const curr_dir_pointer = {
   "curr_dir_string" : "",
   "curr_dir_object" : {}
};

const create_default_fs = () => {
   const default_root = create_dir_obj("root");
   default_root.pwd = "/";
   default_root.father_dir = {};

   // Conteúdo inicial de exemplo
   append_dir(default_root, create_dir_obj("Documentos"));
   const leia_me = create_file_obj("leia-me.txt");
   concat_to_file(leia_me, "Abra dois apps para ver o tiling.\nUse o terminal (mkdir, touch, cd, edit) ou o app Arquivos.");
   append_file_to_dir(default_root, leia_me);

   return default_root;
};

// Se existir um sistema salvo no navegador (Turn off), abre ele; senão cria o padrão
export const root = load_fs() ?? create_default_fs();

curr_dir_pointer.curr_dir_object = root;
curr_dir_pointer.curr_dir_string = root.pwd;

// Avisa os apps abertos (terminal, arquivos...) que algo mudou na árvore ou no diretório atual
export const notificar_fs = () => window.dispatchEvent(new Event("fschange"));

window.abrirTerminalModal = () => openApp("terminal");
window.abrirEditor = () => openApp("editor");
window.abrirArquivos = () => openApp("files");

// Menu iniciar
const menu = document.getElementById("start-menu");
const dock_power_menu = document.getElementById("dock-power-menu");

const close_menus = () => {
   menu.classList.add("hidden");
   dock_power_menu.classList.add("hidden");
};

document.getElementById("start-btn").addEventListener("click", e => {
   e.stopPropagation();
   dock_power_menu.classList.add("hidden");
   menu.classList.toggle("hidden");
});
document.addEventListener("click", close_menus);

// ---------- Energia (Power) ----------
const off_screen = document.getElementById("power-off-screen");

const show_power_off_screen = () => off_screen.classList.remove("hidden");

const turn_off = () => {
   if (!save_fs(root)) {
      return alert("Não foi possível salvar. O sistema continua ligado.");
   }
   window.close();
   // Se a aba fechou, este timeout nunca roda. Se o navegador recusou, ainda estamos aqui:
   setTimeout(show_power_off_screen, 300);
};

const reset_os = () => {
   if (!confirm("Resetar o sistema? Todos os arquivos salvos serão apagados.")) return;
   reset_fs();
   location.reload(); // o boot recria o sistema padrão
};

// Turn off e Reset existem no menu iniciar e no menu da dock (atributo data-power)
const power_actions = { off: turn_off, reset: reset_os };
document.querySelectorAll("[data-power]").forEach(btn => {
   btn.addEventListener("click", () => power_actions[btn.dataset.power]());
});

// Botão de power da dock: abre o menu centralizado no botão, logo acima da dock
const dock_power_btn = document.getElementById("dock-power-btn");
dock_power_btn.addEventListener("click", e => {
   e.stopPropagation();
   menu.classList.add("hidden");
   dock_power_menu.classList.toggle("hidden");
   if (dock_power_menu.classList.contains("hidden")) return;

   // só dá para medir a largura do menu depois que ele ficou visível
   const btn = dock_power_btn.getBoundingClientRect();
   const dock = document.getElementById("dock").getBoundingClientRect();
   const left = btn.left + btn.width / 2 - dock_power_menu.offsetWidth / 2;
   dock_power_menu.style.left = Math.max(8, Math.min(left, window.innerWidth - dock_power_menu.offsetWidth - 8)) + "px";
   dock_power_menu.style.bottom = (window.innerHeight - dock.top + 8) + "px";
});

document.getElementById("power-on-btn").addEventListener("click", () => location.reload());

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
   if (!off_screen.classList.contains("hidden")) return; //Bloqueia as teclas caso o OS esteja "Desligado"
   if (!e.altKey) return;
   if (e.key === "Enter")           { e.preventDefault(); openApp("terminal"); }
   if (e.key.toLowerCase() === "e") { e.preventDefault(); openApp("editor"); }
   if (e.key.toLowerCase() === "f") { e.preventDefault(); openApp("files"); }
   if (e.key.toLowerCase() === "q") { e.preventDefault(); closeApp(); }
});

