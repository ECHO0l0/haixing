import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp'};

export async function startDevServer({root=process.cwd(),port=4173}={}){
  root=path.resolve(root);
  const server=http.createServer(async(req,res)=>{
    try{
      let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if(file!==root&&!file.startsWith(root+path.sep))throw Error('Outside document root');
      if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
      res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
      res.end(await fs.readFile(file));
    }catch{res.writeHead(404);res.end('Not found');}
  });
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(port,'127.0.0.1',resolve);
  });
  return server;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||4173);
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('PORT must be an integer from 0 to 65535');
  const server=await startDevServer({port});
  console.log(`http://127.0.0.1:${server.address().port}`);
}
