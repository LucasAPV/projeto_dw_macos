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
   let found = false;
   return_content_dir(dir).every(elem => {
      if(elem.includes(name_dir_to_find)) {
         found = true;
         return false /* faz brekar do every */
      }

      return true /* faz o every continuar */
   });

   return found /* retorna se achou */
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