import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'tests',testMatch:'**/*.spec.ts',timeout:20000,expect:{timeout:4500},retries:0,workers:1,
  reporter:[['list'],['json',{outputFile:'test-results/results.json'}]],
  use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4188',...devices['Desktop Chrome'],viewport:{width:1440,height:900},launchOptions:process.platform==='win32'?{channel:'chrome'}:{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']},reducedMotion:'reduce',trace:'retain-on-failure',screenshot:'only-on-failure'},
  ...(process.env.PLAYWRIGHT_BASE_URL?{}:{webServer:{command:'npm run preview -- --port 4188 --strictPort',url:'http://127.0.0.1:4188/',reuseExistingServer:true,timeout:20000}}),
});
