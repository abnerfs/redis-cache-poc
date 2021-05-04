import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

export const parseDateStr = (dateStr: string) => {
    let dateSplit = dateStr.split('\n');

    let datePart = dateSplit[0];

    let datePartSplit = datePart.split('/');

    let day = parseInt(datePartSplit[0]);
    let month = parseInt(datePartSplit[1]);
    let year = parseInt(datePartSplit[2]);

    let timePart = dateSplit[1];

    let timePartSplit = timePart.split(':');

    let hours = parseInt(timePartSplit[0]);
    let minutes = parseInt(timePartSplit[1]);

    return new Date(year, month, day, hours, minutes, 0);
}

export type PackageInfoStatus = {
    id?: number;
    date: Date;
    description: string;
}

export type PackageInfo = {
    id?: number;
    code: string;
    description: string;
    status: PackageInfoStatus[]
}

const getPackageInfoBody = async (codigo: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www2.correios.com.br/sistemas/rastreamento/default.cfm', {
        waitUntil: 'networkidle0'
    });
    await page.waitForSelector('#objetos');
    await page.evaluate((tmpCode: string) => {
        const obj = document.querySelector('#objetos') as HTMLTextAreaElement | undefined;
        if (obj)
            obj.value = tmpCode;
    }, codigo);

    await page.click('#btnPesq');
    await page.waitForSelector('.listEvent');
    const content = await page.evaluate(() => document.querySelector('body')?.innerHTML)

    await browser.close();
    return content;
}

const getPackageInfo = (body: string, code: string): PackageInfo => {
    const dom = new JSDOM(body);

    const status = Array.prototype.slice.call(dom.window.document.querySelectorAll('.listEvent'))
        .map(row => {
            const dt = row.querySelector('.sroDtEvent').textContent as string;
            const dtParsed = parseDateStr(dt);
            const desc = row.querySelector('.sroLbEvent').textContent

            const status: PackageInfoStatus = {
                description: desc,
                date: dtParsed
            };
            return status;
        });

    return {
        code,
        status,
        description: ''
    };
}

export const getPackageCorreios = async (code: string) => {
    const body = await getPackageInfoBody(code);
    if (!body)
        throw new Error("Package not found");

    return getPackageInfo(body, code);
}