import { db } from '../utils/db.js';
import { tripay } from '../utils/tripay.js';
import { stok } from '../utils/stok.js';

export const buttonHandler = async (ctx) => {
    const data = ctx.callbackQuery.data;
    const [action, param1, param2] = data.split(':');

    try {
        switch (action) {
            case 'BUY': {
                const products = await db.read('products.json');
                const product = products.find(p => p.id === param1);
                if (!product) return ctx.answerCbQuery('Produk tidak ditemukan');

                const stockCount = await stok.count(param1);
                if (stockCount === 0) return ctx.answerCbQuery('Maaf, stok sedang habis');

                await ctx.editMessageText(`📦 *${product.name}*\n💰 Harga: Rp ${product.price.toLocaleString()}\n\nSilakan pilih metode pembayaran:`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'QRIS', callback_data: `PAYMETHOD:${param1}:QRIS` }],
                            [{ text: 'GOPAY', callback_data: `PAYMETHOD:${param1}:GOPAY` }],
                            [{ text: 'OVO', callback_data: `PAYMETHOD:${param1}:OVO` }],
                            [{ text: '⬅️ Kembali', callback_data: 'LIST_PRODUCTS' }]
                        ]
                    }
                });
                break;
            }

            case 'PAYMETHOD': {
                const products = await db.read('products.json');
                const product = products.find(p => p.id === param1);
                const method = param2;

                await ctx.editMessageText('⏳ Sedang membuat invoice...');

                try {
                    const invoice = await tripay.createInvoice(method, product, ctx.from, product.price);
                    
                    // Simpan order ke DB
                    const orders = await db.read('orders.json');
                    orders.push({
                        user_id: ctx.from.id,
                        merchant_ref: invoice.merchant_ref,
                        product_id: product.id,
                        amount: product.price,
                        status: 'UNPAID',
                        created_at: new Date().toISOString()
                    });
                    await db.write('orders.json', orders);

                    await ctx.editMessageText(`✅ *Invoice Berhasil Dibuat!*\n\nID: \`${invoice.merchant_ref}\`\nMetode: ${method}\nTotal: Rp ${invoice.amount.toLocaleString()}\n\nSilakan bayar melalui link berikut:\n[KLIK DI SINI UNTUK BAYAR](${invoice.checkout_url})`, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Cek Status Pembayaran', callback_data: `CHECK_STATUS:${invoice.merchant_ref}` }]
                            ]
                        }
                    });
                } catch (error) {
                    await ctx.editMessageText('❌ Gagal membuat invoice. Silakan coba lagi nanti.');
                }
                break;
            }

            case 'LIST_PRODUCTS': {
                const products = await db.read('products.json');
                const buttons = products.map(p => [{ text: `${p.name} - Rp ${p.price.toLocaleString()}`, callback_data: `BUY:${p.id}` }]);
                
                await ctx.editMessageText('🛒 *Daftar Produk Tersedia:*', {
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: buttons }
                });
                break;
            }

            default:
                await ctx.answerCbQuery('Fitur belum tersedia');
        }
    } catch (error) {
        console.error('Button Handler Error:', error);
        await ctx.answerCbQuery('Terjadi kesalahan sistem');
    }
};
