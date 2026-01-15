import { db } from '../utils/db.js';
import { stok } from '../utils/stok.js';

export const adminPanel = async (ctx) => {
    await ctx.replyWithMarkdown('🛠 *Panel Admin Hiura-AutoOrder*', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '➕ Tambah Produk', callback_data: 'ADMIN:ADD_PROD' }, { text: '➖ Hapus Produk', callback_data: 'ADMIN:DEL_PROD' }],
                [{ text: '📦 Kelola Stok', callback_data: 'ADMIN:MANAGE_STOCK' }],
                [{ text: '📊 Statistik', callback_data: 'ADMIN:STATS' }],
                [{ text: '⚙️ Pengaturan', callback_data: 'ADMIN:SETTINGS' }]
            ]
        }
    });
};

export const addStockCommand = async (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 3) return ctx.reply('Format salah! Gunakan: /addstock <id_produk> <user:pass>');

    const productId = args[1];
    const account = args.slice(2).join(' ');

    const success = await stok.add(productId, account);
    if (success) {
        ctx.reply(`✅ Berhasil menambahkan stok untuk \`${productId}\``, { parse_mode: 'Markdown' });
    } else {
        ctx.reply('❌ Gagal! Stok mungkin sudah ada (duplikat).');
    }
};
