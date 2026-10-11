import {chromium} from 'playwright';
import fs from 'node:fs/promises';

export const baseURL=process.env.HAIXING_TEST_BASE_URL||'http://127.0.0.1:4173';

export async function launchTestBrowser(){
  let executablePath=process.env.HAIXING_BROWSER_EXECUTABLE;
  if(!executablePath&&process.platform==='win32'&&!process.env.CI){
    const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
    try{await fs.access(chrome);executablePath=chrome;}catch{}
  }
  return chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
}
