import { create_file_obj, append_file_to_dir, concat_to_file } from "./file_control.mjs";

export const create_dir_obj = (dir_name) => {
   return {
      "dir_name": dir_name, 
      "pwd": new String, 
      "father_dir": {},
      "children_dir": new Array,
      "files": new Array,
   }
}

export const append_dir = (father_dir, dir) => {
   father_dir.children_dir.push(dir);
   dir.pwd = (father_dir.pwd == "/" ? "" : father_dir.pwd) + "/" + dir.dir_name; /* String concat bruh */
   dir.father_dir = father_dir;
}

export const return_content_dir = (dir) => {
   let union_names = [];

   dir.children_dir.forEach(elem => {
      union_names.push("d - " + elem.dir_name);
   });

   dir.files.forEach(elem => {
      union_names.push("f - " +elem.file_name);
   });

   return union_names;
}


export const is_dir_in_dir = (dir, name_dir_to_find) => {
   return dir.children_dir.some(elem => elem.dir_name === name_dir_to_find);
}

export const change_dir = (to_dir_name, curr_dir_pointer) => {

   let dir_string = curr_dir_pointer.curr_dir_string;
   let curr_dir = curr_dir_pointer.curr_dir_object;
   let childs_curr_dir = curr_dir.children_dir;

   // para o diretorio atual
   if(to_dir_name == ".") {return "OKAY"}

   // para o diretorio anterior
   if(to_dir_name == ".." && dir_string == "/") {return "OKAY"};
   
   if(to_dir_name == "..") {
      curr_dir_pointer.curr_dir_object = curr_dir_pointer.curr_dir_object.father_dir;
      curr_dir_pointer.curr_dir_string = curr_dir_pointer.curr_dir_object.pwd ;
      
      return "OKAY";
   }


   // para um novo diretorio
   try{
      if (!is_dir_in_dir(curr_dir, to_dir_name)) {throw "DIRECTORY DOES NOT EXISTS";} 
   } catch(e) {
      return e
   }

   for (let index = 0; index < childs_curr_dir.length; index++) {
      if(childs_curr_dir[index].dir_name == to_dir_name){
         curr_dir_pointer.curr_dir_object = curr_dir_pointer.curr_dir_object.children_dir[index];

         let is_root = (curr_dir_pointer.curr_dir_string == "/") ? true : false;
         if(is_root){
            curr_dir_pointer.curr_dir_string = curr_dir_pointer.curr_dir_string + to_dir_name;
         } else {
            curr_dir_pointer.curr_dir_string = curr_dir_pointer.curr_dir_string + "/" + to_dir_name;
         }
         break;
      }
   }

   return "OKAY";
}

// Converte a arvore em dados puros (sem pwd e father_dir, que sao circulares)
export const serialize_dir = (dir) => ({
   dir_name: dir.dir_name,
   children_dir: dir.children_dir.map(serialize_dir),
   files: dir.files.map(f => ({ file_name: f.file_name, content: String(f.content) })),
});

// Reconstroi a arvore, refazendo pwd e father_dir
export const hydrate_dir = (data, father_dir = null) => {
   const dir = create_dir_obj(data.dir_name);

   if (father_dir) {
      append_dir(father_dir, dir);
   } else {
      dir.pwd = "/";
      dir.father_dir = {};
   }

   data.files.forEach(f => {
      const file = create_file_obj(f.file_name);
      concat_to_file(file, f.content);
      append_file_to_dir(dir, file);
   });

   data.children_dir.forEach(child => hydrate_dir(child, dir));
   return dir;
}