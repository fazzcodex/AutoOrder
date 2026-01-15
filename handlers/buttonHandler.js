import { db } from '../utils/db.js';
import { tripay } from '../utils/tripay.js';
import { stok } from '../utils/stok.js';
import { security } from '../utils/security.js';

export const buttonHandler = async (ctx) => {
    const data = ctx.callbackQuery.data;
    const [action, param1, param2] = data.split(':');
    const userId = ctx.from.id;

    try {
        // --- USER ACTIONS ---
        if (action === 'BUY') {
            const products = await db.read('products.json');
            const product = products.find(p => p.id === param1);
            if (!product) return ctx.answerCbQuery('❌ Produk tidak ditemukan');

            const stockCount = await stok.count(param1);
            if (stockCount === 0) return ctx.answerCbQuery('⚠️ Maaf, stok sedang habis');

            await ctx.editMessageText(`📦 *${product.name}*\n💰 Harga: Rp ${product.price.toLocaleString()}\n📝 Deskripsi: ${product.description}\n\nSilakan pilih metode pembayaran:`, {
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
        } 
        
        else if (action === 'PAYMETHOD') {
            const products = await db.read('products.json');
            const product = products.find(p => p.id === param1);
            const method = param2;

            await ctx.editMessageText('⏳ Sedang membuat invoice Tripay...');

            try {
                const invoice = await tripay.createInvoice(method, product, ctx.from, product.price);
                
                const orders = await db.read('orders.json');
                orders.push({
                    user_id: userId,
                    merchant_ref: invoice.merchant_ref,
                    product_id: product.id,
                    amount: product.price,
                    status: 'UNPAID',
                    checkout_url: invoice.checkout_url,
                    created_at: new Date().toISOString()
                });
                await db.write('orders.json', orders);

                await ctx.editMessageText(`✅ *Invoice Berhasil Dibuat!*\n\nID: \`${invoice.merchant_ref}\`\nProduk: ${product.name}\nTotal: Rp ${invoice.amount.toLocaleString()}\n\nSilakan selesaikan pembayaran melalui link di bawah:`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💳 BAYAR SEKARANG', url: invoice.checkout_url }],
                            [{ text: '🔄 Cek Status Pembayaran', callback_data: `CHECK_STATUS:${invoice.merchant_ref}` }]
                        ]
                    }
                });
            } catch (error) {
                await ctx.editMessageText('❌ Gagal membuat invoice. Silakan hubungi admin.');
            }
        }

        else if (action === 'LIST_PRODUCTS') {
            const products = await db.read('products.json');
            const buttons = products.map(p => [{ text: `${p.name} - Rp ${p.price.toLocaleString()}`, callback_data: `BUY:${p.id}` }]);
            
            await ctx.editMessageText('🛒 *Daftar Produk Tersedia:*', {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: buttons }
            });
        }

        else if (action === 'HISTORY') {
            const orders = await db.read('orders.json');
            const userOrders = orders.filter(o => o.user_id === userId).slice(-5);
            
            if (userOrders.length === 0) return ctx.answerCbQuery('📭 Anda belum memiliki riwayat pesanan.');

            let msg = '📜 *5 Pesanan Terakhir Anda:*\n\n';
            userOrders.forEach(o => {
                msg += `🔹 ID: \`${o.merchant_ref}\`\nStatus: ${o.status}\nTotal: Rp ${o.amount.toLocaleString()}\n---\n`;
            });

            await ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '⬅️ Kembali', callback_data: 'BACK_TO_START' }]] } });
        }

        else if (action === 'BACK_TO_START') {
            await ctx.editMessageText(`👋 *Halo ${ctx.from.first_name}!*\n\nSelamat datang kembali di *Hiura Auto Order Bot*.\nSilakan pilih menu di bawah ini:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛒 Daftar Produk', callback_data: 'LIST_PRODUCTS' }],
                        [{ text: '📜 Riwayat Pesanan', callback_data: 'HISTORY' }],
                        [{ text: '❓ Bantuan', callback_data: 'HELP' }]
                    ]
                }
            });
        }

        // --- ADMIN ACTIONS ---
        else if (action === 'ADMIN') {
            if (!security.isAdmin(userId)) return ctx.answerCbQuery('❌ Akses Ditolak');

            switch (param1) {
                case 'MANAGE_STOCK': {
                    const products = await db.read('products.json');
                    const buttons = await Promise.all(products.map(async p => {
                        const count = await stok.count(p.id);
                        return [{ text: `${p.name} (${count})`, callback_data: `ADMIN:VIEW_STOCK:${p.id}` }];
                    }));
                    buttons.push([{ text: '⬅️ Kembali ke Panel', callback_data: 'ADMIN:PANEL' }]);

                    await ctx.editMessageText('📦 *Kelola Stok Produk*\nPilih produk untuk melihat detail stok:', {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: buttons }
                    });
                    break;
                }
                case 'VIEW_STOCK': {
                    const count = await stok.count(param2);
                    await ctx.editMessageText(`📊 *Detail Stok: ${param2}*\n\nJumlah Stok Tersedia: *${count}*\n\nUntuk menambah stok, gunakan perintah:\n\`/addstock ${param2} user:pass\``, {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: [[{ text: '⬅️ Kembali', callback_data: 'ADMIN:MANAGE_STOCK' }]] }
                    });
                    break;
                }
                case 'STATS': {
                    const orders = await db.read('orders.json');
                    const totalSales = orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.amount, 0);
                    const totalOrders = orders.length;
                    
                    await ctx.editMessageText(`📊 *Statistik Bot*\n\n💰 Total Penjualan: Rp ${totalSales.toLocaleString()}\n📦 Total Pesanan: ${totalOrders}\n👤 Total User: (Cek database/users.json)`, {
                        parse_mode: 'Markdown',
                        reply_markup: { inline_keyboard: [[{ text: '⬅️ Kembali', callback_data: 'ADMIN:PANEL' }]] }
                    });
                    break;
                }
                case 'PANEL': {
                    await ctx.editMessageText('🛠 *Panel Admin Hiura-AutoOrder*', {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '➕ Tambah Produk', callback_data: 'ADMIN:ADD_PROD' }, { text: '➖ Hapus Produk', callback_data: 'ADMIN:DEL_PROD' }],
                                [{ text: '📦 Kelola Stok', callback_data: 'ADMIN:MANAGE_STOCK' }],
                                [{ text: '📊 Statistik', callback_data: 'ADMIN:STATS' }],
                                [{ text: '⚙️ Pengaturan', callback_data: 'ADMIN:SETTINGS' }]
                            ]
                        }
                    });
                    break;
                }
                default:
                    await ctx.answerCbQuery('🚧 Fitur Admin ini sedang dikembangkan');
            }
        }

        else {
            await ctx.answerCbQuery('🚧 Fitur sedang dalam pengembangan');
        }

    } catch (error) {
        console.error('Button Handler Error:', error);
        await ctx.answerCbQuery('❌ Terjadi kesalahan sistem');
    }
};
