import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config.js';

const BASE_URL = config.TRIPAY.MODE === 'production' 
    ? 'https://tripay.co.id/api/transaction' 
    : 'https://tripay.co.id/api-sandbox/transaction';

export const tripay = {
    async createInvoice(method, product, user, amount) {
        const merchantRef = `INV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const signature = crypto
            .createHmac('sha256', config.TRIPAY.PRIVATE_KEY)
            .update(config.TRIPAY.MERCHANT_CODE + merchantRef + amount)
            .digest('hex');

        const payload = {
            method,
            merchant_ref: merchantRef,
            amount,
            customer_name: user.first_name || 'Customer',
            customer_email: 'customer@example.com', // Tripay requires email
            order_items: [
                {
                    sku: product.id,
                    name: product.name,
                    price: amount,
                    quantity: 1
                }
            ],
            callback_url: config.TRIPAY.CALLBACK_URL,
            return_url: `https://t.me/your_bot_username`,
            expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            signature
        };

        try {
            const response = await axios.post(`${BASE_URL}/create`, payload, {
                headers: { Authorization: `Bearer ${config.TRIPAY.API_KEY}` }
            });
            return response.data.data;
        } catch (error) {
            console.error('Tripay Create Error:', error.response?.data || error.message);
            throw new Error('Gagal membuat invoice Tripay');
        }
    },

    verifySignature(body, signature) {
        const hash = crypto
            .createHmac('sha256', config.TRIPAY.PRIVATE_KEY)
            .update(JSON.stringify(body))
            .digest('hex');
        return hash === signature;
    }
};
