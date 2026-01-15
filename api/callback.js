import express from 'express';
import { tripay } from '../utils/tripay.js';
import { security } from '../utils/security.js';
import { db } from '../utils/db.js';
import { stok } from '../utils/stok.js';

const router = express.Router();

router.post('/tripay/callback', async (req, res) => {
    const signature = req.headers['x-callback-signature'];
    const event = req.headers['x-callback-event'];
    
    // 1. Validasi IP (Opsional tapi disarankan)
    // if (!security.verifyTripayIP(req.ip)) return res.status(403).send('Invalid IP');

    // 2. Validasi Signature
    if (!tripay.verifySignature(req.body, signature)) {
        return res.status(400).send('Invalid Signature');
    }

    if (event !== 'payment_status') {
        return res.status(200).send('Event ignored');
    }

    const { merchant_ref, status } = req.body;

    if (status === 'PAID') {
        const orders = await db.read('orders.json');
        const orderIndex = orders.findIndex(o => o.merchant_ref === merchant_ref);

        if (orderIndex !== -1 && orders[orderIndex].status !== 'PAID') {
            const order = orders[orderIndex];
            
            // Ambil stok
            const account = await stok.get(order.product_id);
            
            if (account) {
                order.status = 'PAID';
                order.account = account;
                order.paid_at = new Date().toISOString();
                
                await db.write('orders.json', orders);

                // Notifikasi ke user (Memerlukan instance bot, akan dihandle di index.js atau via event emitter)
                console.log(`Order ${merchant_ref} PAID. Account: ${account}`);
            } else {
                console.error(`STOK HABIS untuk order ${merchant_ref}`);
                // Handle refund atau manual admin
            }
        }
    }

    res.json({ success: true });
});

export default router;
