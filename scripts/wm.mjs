// Gerenciador de janelas (tiling)
// 1 app  -> ocupa a area de trabalho, deixando uma margem com o fundo visível
// 2 apps -> metade da tela cada, lado a lado
// 3+     -> o primeiro fica a esquerda, os demais empilhados a direita
const GAP = 14;
const workspace = document.getElementById('workspace');

export const APPS = {
   terminal: { title: 'Terminal', html: './apps/terminal.html', css: './styles/terminal_style.css' },
      editor: { title: 'Editor', html: './apps/editor.html', css: './styles/editor_style.css' },
   files: { title: 'Arquivos', html: './apps/files.html', css: './styles/files_style.css' },
};

const windows = [];       // { id, el, mod }
const abrindo = new Set();

function carregarCss(href) {
   if (document.querySelector(`link[href="${href}"]`)) return;
   const l = document.createElement('link');
   l.rel = 'stylesheet'; l.href = href;
   document.head.append(l);
}

export const idFocado = () => windows.find(w => w.el.classList.contains('active'))?.id;

const avisar = () => window.dispatchEvent(new CustomEvent('wmchange', {
   detail: { abertos: windows.map(w => w.id), focado: idFocado() },
}));

function layout() {
   const n = windows.length;
   if (!n) return;
   const W = workspace.clientWidth, H = workspace.clientHeight;

   windows.forEach((w, i) => {
      let x = GAP, y = GAP, largura = W - 2 * GAP, altura = H - 2 * GAP;

      if (n > 1) {
         largura = (W - 3 * GAP) / 2;
         if (i > 0) {
            const pilha = n - 1;
            altura = (H - GAP * (pilha + 1)) / pilha;
            x = 2 * GAP + largura;
            y = GAP + (i - 1) * (altura + GAP);
         }
      }
      Object.assign(w.el.style, { left: x + 'px', top: y + 'px', width: largura + 'px', height: altura + 'px' });
   });
}

function focar(w) {
   windows.forEach(o => o.el.classList.toggle('active', o === w));
   w.mod?.focus?.(w.el);
   avisar();
}

export async function openApp(id, args = {}) {
   const existente = windows.find(w => w.id === id);
   if (existente) {                       // ja aberto: so foca (e repassa argumentos)
      existente.mod?.open?.(existente.el, args);
      return focar(existente);
   }
   if (abrindo.has(id)) return;
   abrindo.add(id);

   try {
      const def = APPS[id];
      carregarCss(def.css);
      const [html, mod] = await Promise.all([
         fetch(def.html).then(r => r.text()),
         import(`./apps/${id}.mjs`),
      ]);

      const el = document.createElement('section');
      el.className = 'hypr-window';
      el.innerHTML = `
         <header class="hypr-titlebar">
            <div class="macos-buttons">
               <button class="macos-btn btn-close" title="Fechar" aria-label="Fechar"></button>
            </div>
            <span class="hypr-title">${def.title}</span>
            <span></span>
         </header>
         <div class="hypr-content">${html}</div>`;
      workspace.append(el);

      const w = { id, el, mod };
      windows.push(w);
      el.addEventListener('mousedown', () => focar(w));
      el.querySelector('.btn-close').addEventListener('click', () => closeApp(id));

      layout();
      mod.init?.(el, { args });
      focar(w);
   } finally {
      abrindo.delete(id);
   }
}

export function closeApp(id = idFocado()) {
   const i = windows.findIndex(w => w.id === id);
   if (i < 0) return;
   const [w] = windows.splice(i, 1);

   w.el.classList.add('closing');
   setTimeout(() => w.el.remove(), 160);

   layout();                              // os que sobraram se expandem
   if (windows.length) focar(windows[windows.length - 1]);
   else avisar();
}

window.addEventListener('resize', layout);
