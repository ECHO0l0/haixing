import {_electron} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const executablePath=process.env.HAIXING_DESKTOP_EXECUTABLE;
if(!executablePath)throw Error('Set HAIXING_DESKTOP_EXECUTABLE to the installed app executable');
const userDataDir=await fs.mkdtemp(path.join(os.tmpdir(),'haixing-desktop-qa-'));
const app=await _electron.launch({executablePath,args:['--user-data-dir='+userDataDir],timeout:30000});
try{
 const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8239/#profile');await page.locator('[data-action=edit-profile]').click();await page.locator('#profile-nickname').fill('桌面验收');await page.locator('#profile-bio').fill('海行 1.3.0');await page.locator('[data-action=pick-avatar][data-avatar="⛵"]').click();await page.locator('[data-action=save-profile]').click();await page.locator('.profile-heading h1').filter({hasText:'桌面验收'}).waitFor();await page.reload();await page.locator('.profile-heading h1').filter({hasText:'桌面验收'}).waitFor();
 await page.getByRole('button',{name:'返回学习概览',exact:true}).click();await page.waitForURL('**/#home');await page.goto('http://127.0.0.1:8239/#bank/theory-50033');await page.locator('.chapter-row').first().waitFor();assert.equal(await page.locator('.chapter-ring').count(),16);assert.equal(await page.locator('.chapter-group [data-action=custom]').count(),0);assert.ok((await page.locator('.chapter-row small').last().innerText()).includes('/ 390'));
 await page.waitForTimeout(250);await page.evaluate(()=>window.scrollTo(0,1000));await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>scrollY),1000);await page.reload();await page.locator('.chapter-row').first().waitFor();await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>scrollY),1000);
 await fs.mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/installed-desktop-product.png'});assert.deepEqual(errors,[]);console.log(JSON.stringify({installedApp:true,profilePersisted:true,chapters:16,associatedQuestions:390,scrollRestored:true,errors}));
}finally{
 await app.close();
 if(path.dirname(userDataDir)!==path.resolve(os.tmpdir())||!path.basename(userDataDir).startsWith('haixing-desktop-qa-'))throw Error('Unexpected test data directory');
 await fs.rm(userDataDir,{recursive:true,force:true});
}
