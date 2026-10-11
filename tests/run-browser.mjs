import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {startDevServer} from '../dev-server.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const server=await startDevServer({root,port:0});
const baseURL=`http://127.0.0.1:${server.address().port}`;
try{
  for(const test of ['tests/browser-sync.mjs','tests/browser-product.mjs']){
    console.log(`Running ${test}`);
    await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[test],{cwd:root,stdio:'inherit',env:{...process.env,HAIXING_TEST_BASE_URL:baseURL}});
      const timer=setTimeout(()=>{child.kill();reject(Error(`${test} exceeded 5 minutes`));},300000);
      child.once('error',error=>{clearTimeout(timer);reject(error);});
      child.once('exit',(code,signal)=>{
        clearTimeout(timer);
        if(code===0)resolve();else reject(Error(`${test} failed (${signal||code})`));
      });
    });
  }
}finally{
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
