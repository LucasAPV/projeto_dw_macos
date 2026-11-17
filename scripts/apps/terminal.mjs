import { curr_dir_pointer, notificar_fs } from "../index.mjs";
import { append_dir, change_dir, create_dir_obj, return_content_dir } from "../dir_control.mjs";
import { append_file_to_dir, create_file_obj, find_file } from "../file_control.mjs";
import { openApp, closeApp } from "../wm.mjs";

//Parse das funcoes
export function parse_command(str) {
   const cmds = str.trim().split(/\s+/);
   if (!cmds[0]) return "";

   switch(cmds[0].toLowerCase()){
      //parse de comando unico
      case "help":
         let known_commands = "Comando conhecidos: \n" + 
         "- clear => Limpa o terminal \n" +
         "- ls => Lista conteudo do diretorio\n" +
         "- pwd => Mostra o diretorio atual\n" +
         "- exit => Sai do terminal\n" +
         "- mkdir [nome-pasta] => Cria uma nova pasta com o nome especificado \n" +
         "- touch [nome-arquivo] => Cria um novo arquivo com o nome especificado \n" +
         "- cat [nome-arquivo] => Mostra o conteudo do arquivo\n" +
         "- edit [nome-arquivo] => Abre o arquivo no editor de texto (cria se nao existir)\n" +
         "- cd [nome-pasta] => Move para a pasta com o nome especificado\n";
         return known_commands;
      break;

      case "clear":
         document.getElementById("terminal-saida").innerHTML = "";
         return null; // Retorna null para não imprimir resposta
      break;

      case "ls":
         let content = return_content_dir(curr_dir_pointer.curr_dir_object).join("\n"); 
         return `${content}`
      break;

      case "pwd":
         return curr_dir_pointer.curr_dir_string;
      break;

      case "exit":
         fecharTerminalModal();
         document.getElementById("terminal-saida").innerHTML = "";
         return null;
      break;

      //parse dos comandos de 2 entradas
      case "mkdir":
         if (!cmds[1]) return "Uso: mkdir [nome-pasta]";
         if (curr_dir_pointer.curr_dir_object.children_dir.some(d => d.dir_name === cmds[1])) return `Ja existe uma pasta chamada ${cmds[1]}`;
         let new_dir = create_dir_obj(cmds[1]);
         append_dir(curr_dir_pointer.curr_dir_object, new_dir);
         notificar_fs();
         return `Diretorio ${new_dir.dir_name} criado com sucesso`
      break;

      case "touch":
         if (!cmds[1]) return "Uso: touch [nome-arquivo]";
         if (find_file(curr_dir_pointer.curr_dir_object, cmds[1])) return `Ja existe um arquivo chamado ${cmds[1]}`;
         let new_file = create_file_obj(cmds[1]);
         append_file_to_dir(curr_dir_pointer.curr_dir_object, new_file);
         notificar_fs();
         return `Arquivo ${new_file.file_name} criado com sucesso`
      break;

      case "cd":
         let to_go_dir = cmds[1];
         let error = change_dir(to_go_dir, curr_dir_pointer); 
         if(error != "OKAY") {
            return error
         } else {
            notificar_fs();
            return null;
         };
      break;

      case "cat": {
         if (!cmds[1]) return "Uso: cat [nome-arquivo]";
         const f = find_file(curr_dir_pointer.curr_dir_object, cmds[1]);
         return f ? String(f.content) : `Arquivo ${cmds[1]} nao encontrado`;
      }

      case "edit": {
         if (!cmds[1]) return "Uso: edit [nome-arquivo]";
         const dir = curr_dir_pointer.curr_dir_object;
         let file = find_file(dir, cmds[1]);
         if (!file) {
            file = create_file_obj(cmds[1]);
            append_file_to_dir(dir, file);
            notificar_fs();
         }
         openApp("editor", { file });
         return null;
      }
   }
   return `Comando desconhecido ${cmds[0]}!! Digite help para ver os comandos`;
}

// ==========================================
// CONTROLE DA JANELA DO TERMINAL (agora gerenciada pelo tiling)
// ==========================================
export const abrirTerminalModal = () => openApp("terminal");
export const fecharTerminalModal = () => closeApp("terminal");

export function configurarEventosTerminal(el) {
   const body = el.querySelector("#terminal-body");
   const input = el.querySelector("#terminal-input");
   const saida = el.querySelector("#terminal-saida");
   const prompt = el.querySelector("#prompt_path");

   const atualizarPrompt = () => {
      prompt.textContent = curr_dir_pointer.curr_dir_string + " $";
   };
   atualizarPrompt();

   // Se o diretório mudar por fora (app Arquivos), o prompt acompanha
   const aoMudar = () => el.isConnected ? atualizarPrompt() : window.removeEventListener("fschange", aoMudar);
   window.addEventListener("fschange", aoMudar);

   // Fechar com a tecla ESC
   el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fecharTerminalModal();
   });

   // Focar no input ao clicar em qualquer lugar do terminal
   body.addEventListener("click", () => input.focus());

   // Processar o comando ao apertar Enter
   input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         const textoDigitado = input.value;

         // Mostra o comando digitado no histórico
         const linhaComando = document.createElement("div");
         linhaComando.className = "linha-historico";
         const simbolo = document.createElement("span");
         simbolo.className = "prompt-simbolo";
         simbolo.textContent = "$";
         const texto = document.createElement("span");
         texto.textContent = textoDigitado;
         linhaComando.append(simbolo, texto);
         saida.appendChild(linhaComando);

         // Processa e mostra a resposta
         const resultado = parse_command(textoDigitado);
         if (resultado !== null && resultado !== "") {
            const linhaResposta = document.createElement("div");
            linhaResposta.className = "linha-historico resposta-texto";
            linhaResposta.textContent = resultado;
            saida.appendChild(linhaResposta);
         }

         // Reseta o input e rola para o final
         input.value = "";
         atualizarPrompt();
         body.scrollTop = body.scrollHeight;
      }
   });
}

// Chamados pelo gerenciador de janelas
export const init = (el) => configurarEventosTerminal(el);
export const focus = (el) => el.querySelector("#terminal-input").focus();
