const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/login-form.feature');

let page;
let browser;

defineFeature(feature, test => {

    beforeAll(async () => {
        browser = process.env.GITHUB_ACTIONS
            ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
            : await puppeteer.launch({headless: false, slowMo: 20});
        page = await browser.newPage();

        await page
            .goto("http://localhost:3000", {
                waitUntil: "networkidle0",
            })
            .catch(() => {
            });
    });

    test('The user is registered in the site', ({given, when, then}) => {

        let username;
        let password;

        given('A registered user', async () => {
            username = "loginUser"
            password = "123456q@"
            await expect(page).toClick("button", { text: "Don't have an account? Sign up here." });
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Add User' });
            await expect(page).toClick("button", { text: username });
            await expect(page).toClick("li", { text: "Cerrar sesión" });
        });

        when('I fill the data in the form and press submit', async () => {
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Login' });
        });

        then('The main page should be displayed', async () => {
            await expect(page).toMatchElement("div", { text: username + ", ¿Listo para jugar?" });
            await expect(page).toClick("button", { text: username });
            await expect(page).toClick("li", { text: "Cerrar sesión" });
        });
    });

    test('The user is not registered in the site', ({given, when, then}) => {

        let username;
        let password;

        given('A not registered user', async () => {
            username = "loginUser2"
            password = "123456q@"
        });

        when('I fill the data in the form and press submit', async () => {
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Login' });
        });

        then('The error message should be displayed', async () => {
            await expect(page).toMatchElement("p", { text: "Usuario o contraseña incorrectos" });
        });
    });

    test('The user is registered in the site but the password is wrong', ({given, when, then}) => {

        let username;
        let password;

        given('A registered user', async () => {
            username = "loginUser"
            password = "123456q+"
        });

        when('I fill the data with the wrong password in the form and press submit', async () => {
            await expect(page).toFill('input[name="username"]', username);
            await expect(page).toFill('input[name="password"]', password);
            await expect(page).toClick('button', { text: 'Login' });
        });

        then('The error message should be displayed', async () => {
            await expect(page).toMatchElement("p", { text: "Usuario o contraseña incorrectos" });
        });
    });

    afterAll(async ()=>{
        browser.close()
    });

});
