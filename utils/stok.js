import fs from 'fs-extra';
import path from 'path';

const STOK_DIR = './database/stok';

export const stok = {
    async add(product, account) {
        const filePath = path.join(STOK_DIR, `${product.toLowerCase()}.txt`);
        await fs.ensureDir(STOK_DIR);
        
        let currentStok = [];
        if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf-8');
            currentStok = content.split('\n').filter(line => line.trim() !== '');
        }

        if (currentStok.includes(account)) return false; // Anti duplicate

        await fs.appendFile(filePath, `${account}\n`);
        return true;
    },

    async get(product) {
        const filePath = path.join(STOK_DIR, `${product.toLowerCase()}.txt`);
        if (!await fs.pathExists(filePath)) return null;

        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) return null;

        const account = lines[0]; // FIFO
        const remaining = lines.slice(1).join('\n') + (lines.length > 1 ? '\n' : '');
        
        await fs.writeFile(filePath, remaining);
        return account;
    },

    async count(product) {
        const filePath = path.join(STOK_DIR, `${product.toLowerCase()}.txt`);
        if (!await fs.pathExists(filePath)) return 0;

        const content = await fs.readFile(filePath, 'utf-8');
        return content.split('\n').filter(line => line.trim() !== '').length;
    }
};
