import { db } from './db.js';
import os from 'os';

export const monitoring = {
    async getStats() {
        const orders = await db.read('orders.json');
        const users = await db.read('users.json');
        
        const paidOrders = orders.filter(o => o.status === 'PAID');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
        
        return {
            revenue: totalRevenue,
            totalOrders: orders.length,
            paidOrders: paidOrders.length,
            totalUsers: users.length,
            uptime: process.uptime(),
            memory: process.memoryUsage().rss,
            platform: os.platform(),
            cpuLoad: os.loadavg()
        };
    }
};
