export const create_file_obj = (file_name) => {
   return {
      "file_name": file_name,
      "pwd": new String,
      "content": new String
   }   
}

export const append_file_to_dir = (dir, file) => {
   file.pwd = (dir.pwd == "/" ? "" : dir.pwd) + file.file_name;
   dir.files.push(file);
}

export const concat_to_file = (file, content) => {
   file.content = content;
}

// Procura um arquivo pelo nome dentro de um diretório (usado pelo editor, cat e edit)
export const find_file = (dir, file_name) => dir.files.find(f => f.file_name === file_name);
