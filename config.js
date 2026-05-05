import dotenv from 'dotenv';
dotenv.config();

export const config = {
    // Bot Configuration
    BOT_TOKEN: process.env.BOT_TOKEN || '8104262903:AAG7qcdDdbuEzZTwFgF4os8lN4-loo8JTBU',
    ADMIN_IDS: (process.env.ADMIN_IDS || '6102785057').split(',').map(id => parseInt(id.trim())),
    
    // Tripay Configuration
    TRIPAY: {
        API_KEY: process.env.TRIPAY_API_KEY || '',
        PRIVATE_KEY: process.env.TRIPAY_PRIVATE_KEY || '',
        MERCHANT_CODE: process.env.TRIPAY_MERCHANT_CODE || '',
        MODE: process.env.TRIPAY_MODE || 'sandbox', // 'sandbox' or 'production'
        CALLBACK_URL: process.env.TRIPAY_CALLBACK_URL || ''
    },

    // Security & Limits
    RATE_LIMIT_SECONDS: parseInt(process.env.RATE_LIMIT_SECONDS || '5'),
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
    
    // Paths
    DB_PATH: './database',
    STOK_PATH: './database/stok'
};
