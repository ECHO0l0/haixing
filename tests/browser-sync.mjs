import{baseURL,launchTestBrowser}from'./browser-helpers.mjs';
import assert from'node:assert/strict';
import fs from'node:fs/promises';
const browser=await launchTestBrowser();
const user={id:'11111111-1111-4111-8111-111111111111',email:'test@example.invalid',aud:'authenticated',role:'authenticated'};
const encoded=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const token=encoded({alg:'HS256',typ:'JWT'})+'.'+encoded({sub:user.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})+'.test';
let events=[];const pages=[],errors=[];
async function makePage(){
 const context=await browser.newContext();const page=await context.newPage();pages.push(page);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/sync-config.js',r=>r.fulfill({contentType:'text/javascript',body:"export const syncConfig={url:'https://demo.supabase.co',publishableKey:'sb_publishable_test'};"}));
 await page.route('https://demo.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url());let body={};
  if(url.pathname.startsWith('/auth/v1/token'))body={access_token:token,refresh_token:'test-refresh',expires_in:3600,token_type:'bearer',user};
  else if(url.pathname==='/auth/v1/user')body=user;
  else if(url.pathname.endsWith('/rpc/haixing_push_events')){for(const e of req.postDataJSON().batch)if(!events.some(x=>x.event_id===e.id))events.push({seq:events.length+1,event_id:e.id,device:e.device,clock:e.clock,payload:e.payload});body=null;}
  else if(url.pathname==='/rest/v1/haixing_events'){const cursor=Number((url.searchParams.get('seq')||'gt.0').slice(3));body=events.filter(e=>e.seq>cursor);}
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 await page.goto(baseURL+'/#profile');await page.getByRole('button',{name:'登录 / 注册',exact:true}).waitFor();
 await page.getByRole('button',{name:'登录 / 注册',exact:true}).click();await page.locator('#cloud-email').fill(user.email);await page.locator('#cloud-password').fill('test-password');await page.getByRole('button',{name:'登录',exact:true}).click();await page.getByRole('button',{name:'立即同步',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.status-dot')?.textContent==='已同步');
 return page;
}
async function manualSync(p){await p.getByRole('button',{name:'立即同步',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('[data-action=cloud-sync]')?.disabled);}
try{
 const a=await makePage(),b=await makePage();
 await a.evaluate(async()=>{const c=await import('/core.js');await c.put('records','test:1',{uid:'test:1',attempts:1,correctCount:1,wrongCount:0,lastCorrect:true,lastAt:100});});
 await b.evaluate(async()=>{const c=await import('/core.js');await c.put('records','test:1',{uid:'test:1',attempts:1,correctCount:0,wrongCount:1,lastCorrect:false,lastAt:200});});
 for(const p of [a,b,a])await manualSync(p);
 for(const p of [a,b]){const r=await p.evaluate(async()=>{const c=await import('/core.js');return c.get('records','test:1');});assert.equal(r.attempts,2);assert.equal(r.correctCount,1);assert.equal(r.wrongCount,1);}
 await manualSync(a);assert.equal(events.length,2);
 await b.context().setOffline(true);await b.evaluate(async()=>{const c=await import('/core.js');const old=await c.get('records','test:1');await c.put('records','test:1',{...old,attempts:3,correctCount:2,lastCorrect:true,lastAt:300});});
 await b.waitForTimeout(900);assert.equal(events.length,2);assert.equal(await b.evaluate(async()=>{const c=await import('/core.js');return(await c.entries('sync-events')).filter(x=>x[1].pending).length;}),1);
 await b.context().setOffline(false);for(let i=0;i<100;i++){if(!await b.evaluate(async()=>{const c=await import('/core.js');return(await c.entries('sync-events')).some(x=>x[1].pending);}))break;await b.waitForTimeout(100);}
 await manualSync(a);assert.equal((await a.evaluate(async()=>{const c=await import('/core.js');return c.get('records','test:1');})).attempts,3);
 await a.getByRole('button',{name:'退出账号',exact:true}).click();await a.getByRole('button',{name:'登录 / 注册',exact:true}).waitFor();const guest=await a.evaluate(async()=>{const c=await import('/core.js');return c.get('records','test:1');});assert.equal(guest,undefined);
 await fs.mkdir('test-results',{recursive:true});await b.screenshot({path:'test-results/cloud-profile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log(JSON.stringify({mockBackend:true,twoDevicesMerged:true,retriesIdempotent:true,offlineQueueRecovered:true,accountIsolation:true,events:events.length,errors}));
}finally{await browser.close();}
