import { serialize_dir, hydrate_dir } from "./dir_control.mjs";

const STORAGE_KEY = "dw_os_fs_v1";

export function load_fs() {
   try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? hydrate_dir(JSON.parse(raw)) : null;
   } catch {
      return null; // JSON invalido -> cai no sistema padrao
   }
}

export function save_fs(root) {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize_dir(root)));
      return true;
   } catch {
      return false; // quota estourada, armazenamento bloqueado etc.
   }
}

export const reset_fs = () => localStorage.removeItem(STORAGE_KEY);