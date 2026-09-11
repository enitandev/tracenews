import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    
    const html = await page.evaluate(() => document.body.outerHTML);
    fs.writeFileSync('test_dom.html', html);
    
    await browser.close();
    console.log('Saved DOM to test_dom.html');
}
run();
