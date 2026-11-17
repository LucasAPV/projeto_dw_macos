import { curr_dir_pointer, notificar_fs } from "../index.mjs";
import { append_file_to_dir, concat_to_file, create_file_obj, find_file } from "../file_control.mjs";

const estado = new WeakMap(); // janela -> { arquivo, quill}

export function init(el, { args }) {
   const nome = el.querySelector("#editor-nome");
   const quill = new Quill(el.querySelector("#editor-quill"), {
      theme: "snow",
      placeholder: "Comece a escrever…",
      modules: { toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["clean"]] },
   });
   const status = el.querySelector("#editor-status");
   estado.set(el, { arquivo: null, quill });

   const aviso = (msg) => {
      status.textContent = msg;
      setTimeout(() => status.textContent = "", 2000);
   };

   const salvar = () => {
      const e = estado.get(el);

      // Arquivo novo: cria no diretório atual com o nome digitado
      if (!e.arquivo) {
         const n = nome.value.trim();
         if (!n) return aviso("Dê um nome ao arquivo.");
         const dir = curr_dir_pointer.curr_dir_object;
         if (find_file(dir, n)) return aviso("Já existe um arquivo com esse nome.");
         e.arquivo = create_file_obj(n);
         append_file_to_dir(dir, e.arquivo);
         nome.readOnly = true;
      }

      concat_to_file(e.arquivo, e.quill.getText().replace(/\n$/, ""));
      notificar_fs();
      aviso("Salvo");
   };

   el.querySelector("#editor-salvar").addEventListener("click", salvar);
   el.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); salvar(); }
   });

   open(el, args);
}

// Chamado pelo gerenciador (e pelo init) para abrir um arquivo existente
export function open(el, { file } = {}) {
   if (!file) return;
   estado.get(el).arquivo = file;
   const nome = el.querySelector("#editor-nome");
   nome.value = file.file_name;
   nome.readOnly = true;
   estado.get(el).quill.setText(String(file.content));
}

export const focus = (el) => estado.get(el)?.quill.focus();
