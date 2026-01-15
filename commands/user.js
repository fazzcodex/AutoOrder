import { db } from '../utils/db.js';

export const startCommand = async (ctx) => {
    const welcomeMsg = `👋 *Halo ${ctx.from.first_name}!*\n\nSelamat datang di *Hiura Auto Order Bot*.\nKami menyediakan berbagai produk digital dengan proses otomatis 24/7.\n\nSilakan pilih menu di bawah ini:`;
    
    await ctx.replyWithMarkdown(welcomeMsg, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🛒 Daftar Produk', callback_data: 'LIST_PRODUCTS' }],
                [{ text: '📜 Riwayat Pesanan', callback_data: 'HISTORY' }],
                [{ text: '❓ Bantuan', callback_data: 'HELP' }]
            ]
        }
    });
};

export const listProdukCommand = async (ctx) => {
    const products = await db.read('products.json');
    if (products.length === 0) return ctx.reply('Maaf, belum ada produk tersedia.');

    const buttons = products.map(p => [{ text: `${p.name} - Rp ${p.price.toLocaleString()}`, callback_data: `BUY:${p.id}` }]);
    
    await ctx.replyWithMarkdown('🛒 *Daftar Produk Tersedia:*', {
        reply_markup: { inline_keyboard: buttons }
    });
};
