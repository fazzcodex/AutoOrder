import { config } from '../config.js';

const userCooldowns = new Map();

export const limiter = {
    check(userId) {
        const now = Date.now();
        const lastAction = userCooldowns.get(userId) || 0;
        const cooldownAmount = config.RATE_LIMIT_SECONDS * 1000;

        if (now - lastAction < cooldownAmount) {
            const timeLeft = Math.ceil((cooldownAmount - (now - lastAction)) / 1000);
            return { limited: true, timeLeft };
        }

        userCooldowns.set(userId, now);
        return { limited: false };
    },

    // Middleware untuk Telegraf
    rateLimit(ctx, next) {
        if (config.ADMIN_IDS.includes(ctx.from.id)) return next();

        const result = limiter.check(ctx.from.id);
        if (result.limited) {
            return ctx.reply(`⚠️ Terlalu cepat! Tunggu ${result.timeLeft} detik lagi.`);
        }
        return next();
    }
};
