import { Telegraf } from 'telegraf';
import express from 'express';
import { config } from './config.js';
import { security } from './utils/security.js';
import { limiter } from './utils/limiter.js';
import { startCommand, listProdukCommand } from './commands/user.js';
import { adminPanel, addStockCommand } from './commands/admin.js';
import { buttonHandler } from './handlers/buttonHandler.js';
import callbackRouter from './api/callback.js';

const bot = new Telegraf(config.BOT_TOKEN);
const app = express();

// Express Middleware
app.use(express.json());
app.use(callbackRouter);

// Bot Middlewares
bot.use(security.maintenanceCheck);
bot.use(limiter.rateLimit);

// User Commands
bot.start(startCommand);
bot.command('listproduk', listProdukCommand);

// Admin Commands
bot.command('admin', security.adminOnly, adminPanel);
bot.command('addstock', security.adminOnly, addStockCommand);

// Handlers
bot.on('callback_query', buttonHandler);

// Error Handling
bot.catch((err, ctx) => {
    console.error(`Telegraf Error for ${ctx.updateType}:`, err);
});

// Start Server & Bot
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

bot.launch().then(() => {
    console.log('Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    process.exit();
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    process.exit();
});
