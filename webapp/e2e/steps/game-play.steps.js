const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-play.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
            : await puppeteer.launch({headless: false, slowMo: 10});
        page = await browser.newPage();

        await page
            .goto("http://localhost:3000", {
                waitUntil: "networkidle0",
            })
            .catch(() => {
            });
    });

    test('I play a game', ({given, when, then}) => {

        let username;
        let password;

        given('I am on the main page', async () => {
            username = "gamePlayUser"
            password = "123456q@"
            await expect(page).toClick("button", { text: "Don't have an account? Sign up here." });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
        });

        when('I click on the "Play" button', async () => {
            await expect(page).toClick('button', { text: '🎮 JUGAR' });
        });

        then('I can play the game', async () => {
            await page.waitForSelector('div.css-8wnzpr button', { timeout: 120000 });
            for (let i = 0; i < 10; i++) {
                // Asegura que haya botones antes de hacer clic
                await page.waitForSelector('div.css-8wnzpr button');
                // Clic en el primer botón dentro del contenedor de respuestas
                await page.$eval('div.css-8wnzpr button', btn => btn.click());

                await new Promise(resolve => setTimeout(resolve, 7000));
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            await expect(page).toMatchElement("div", { text: "¡Juego Terminado!" });

        });
    }, 120000);



    afterAll(async ()=>{
        browser.close()
    });

});