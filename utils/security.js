import { config } from '../config.js';

export const security = {
    isAdmin(userId) {
        return config.ADMIN_IDS.includes(userId);
    },

    isMaintenance() {
        return config.MAINTENANCE_MODE;
    },

    verifyTripayIP(ip) {
        // List IP Tripay (contoh, sebaiknya update berkala)
        const tripayIPs = ['103.146.202.167', '103.146.202.168']; 
        return tripayIPs.includes(ip);
    },

    // Middleware untuk Telegraf
    adminOnly(ctx, next) {
        if (config.ADMIN_IDS.includes(ctx.from.id)) {
            return next();
        }
        return ctx.reply('❌ Akses ditolak. Anda bukan admin.');
    },

    maintenanceCheck(ctx, next) {
        if (config.MAINTENANCE_MODE && !config.ADMIN_IDS.includes(ctx.from.id)) {
            return ctx.reply('⚠️ Bot sedang dalam pemeliharaan. Silakan coba lagi nanti.');
        }
        return next();
    }
};
