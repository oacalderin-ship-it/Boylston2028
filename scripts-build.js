import {cp,mkdir,readdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const entry of ['index.html','manifest.webmanifest','sw.js','assets','src']) await cp(entry,`dist/${entry}`,{recursive:true});
console.log('Static dependency-free production build written to dist/.');
