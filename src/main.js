const puppeteerCore = require('puppeteer-core');
const fs = require('fs');

const username = process.env.USERNAME || 'test';
const password = process.env.PASSWORD || 'test';
const titleName = 'The Irishman';

(async () => {
    const browser = await puppeteerCore.connect({
        browserWSEndpoint: 'ws://chrome:3000',
        args: [
            '--no-sandbox',
            '--proxy-server=http://torproxy:8118',

            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
        ]
    });

    const page = await browser.newPage();
    const preloadFile = fs.readFileSync('/usr/src/app/src/preload.js', 'utf8');
    await page.evaluateOnNewDocument(preloadFile);

    await page.goto('https://www.netflix.com/login');
    await page.type('#id_userLoginId', username);
    await page.type('#id_password', password);

    sleepRandom(1000, 5000);

    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    await page.click('a[data-uia="action-select-profile+primary"]');

    sleepRandom(1000, 5000);

    await page.goto(`https://www.netflix.com/search?q=${encodeURI(titleName)}`);

    let url = '';
    try {
        url = await page.$eval(`a[aria-label="${titleName}"]`, el => el.href);
        console.log(`Title url: ${url}`);

        sleepRandom(1000, 5000);
        await page.goto(url);

        sleep(10000);
        await page.screenshot({path: 'example.png'});
    } catch(e) {
        console.log(`Unable to find title ${titleName}`);
    }

    await browser.close();
})();

function sleepRandom(minMiliseconds, maxMiliseconds) {
    const miliseconds = Math.floor(Math.random() * maxMiliseconds) + minMiliseconds;
    sleep(miliseconds);
}

function sleep(miliseconds) {
    setTimeout(function () {}, miliseconds);
}
