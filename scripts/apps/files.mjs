import { curr_dir_pointer, notificar_fs } from "../index.mjs";
import { append_dir, change_dir, create_dir_obj } from "../dir_control.mjs";
import { append_file_to_dir, create_file_obj, find_file } from "../file_control.mjs";
import { openApp } from "../wm.mjs";

export function init(el) {
   const lista = el.querySelector("#files-lista");
   const caminho = el.querySelector("#files-path");
   const btnSubir = el.querySelector("#files-subir");
   let criando = null; // "pasta" | "arquivo" | null

   const confirmar = (nome) => {
      const dir = curr_dir_pointer.curr_dir_object;
      const tipo = criando;
      criando = null;
      if (nome) {
         if (tipo === "pasta" && !dir.children_dir.some(d => d.dir_name === nome)) {
            append_dir(dir, create_dir_obj(nome));
         } else if (tipo === "arquivo" && !find_file(dir, nome)) {
            append_file_to_dir(dir, create_file_obj(nome));
         }
      }
      notificar_fs(); // re-renderiza
   };

   const linhaNova = () => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="bi bi-${criando === "pasta" ? "folder-fill" : "file-earmark-text"}"></i><input spellcheck="false" placeholder="${criando === "pasta" ? "Nome da pasta" : "Nome do arquivo"}">`;
      const input = li.querySelector("input");
      input.addEventListener("keydown", (e) => {
         if (e.key === "Enter") confirmar(input.value.trim());
         if (e.key === "Escape") { criando = null; render(); }
      });
      setTimeout(() => input.focus());
      return li;
   };

   const item = (icone, nome, aoAbrir) => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="bi bi-${icone}"></i><span></span>`;
      li.lastChild.textContent = nome;
      li.addEventListener("click", () => {
         lista.querySelectorAll("li.sel").forEach(x => x.classList.remove("sel"));
         li.classList.add("sel");
      });
      li.addEventListener("dblclick", aoAbrir);
      return li;
   };

   const render = () => {
      const dir = curr_dir_pointer.curr_dir_object;
      caminho.textContent = curr_dir_pointer.curr_dir_string;
      btnSubir.disabled = curr_dir_pointer.curr_dir_string === "/";
      lista.replaceChildren();

      if (criando) lista.append(linhaNova());

      dir.children_dir.forEach(d => lista.append(item("folder-fill", d.dir_name, () => {
         change_dir(d.dir_name, curr_dir_pointer);
         notificar_fs();
      })));
      dir.files.forEach(f => lista.append(item("file-earmark-text", f.file_name, () => openApp("editor", { file: f }))));

      if (!criando && !dir.children_dir.length && !dir.files.length) {
         lista.innerHTML = '<li class="vazio">Pasta vazia. Crie um arquivo ou uma pasta.</li>';
      }
   };

   btnSubir.addEventListener("click", () => { change_dir("..", curr_dir_pointer); notificar_fs(); });
   el.querySelector("#files-nova-pasta").addEventListener("click", () => { criando = "pasta"; render(); });
   el.querySelector("#files-novo-arquivo").addEventListener("click", () => { criando = "arquivo"; render(); });

   const aoMudar = () => el.isConnected ? render() : window.removeEventListener("fschange", aoMudar);
   window.addEventListener("fschange", aoMudar);
   render();
}
