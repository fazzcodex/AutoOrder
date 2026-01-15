import fs from 'fs-extra';
import path from 'path';
import lockfile from 'lockfile';

const LOCK_TIMEOUT = 10000;

export const db = {
    async read(filename) {
        const filePath = path.join('./database', filename);
        try {
            if (!await fs.pathExists(filePath)) {
                await fs.writeJson(filePath, []);
                return [];
            }
            return await fs.readJson(filePath);
        } catch (error) {
            console.error(`Error reading ${filename}:`, error);
            return [];
        }
    },

    async write(filename, data) {
        const filePath = path.join('./database', filename);
        const lockPath = `${filePath}.lock`;

        return new Promise((resolve, reject) => {
            lockfile.lock(lockPath, { wait: LOCK_TIMEOUT }, async (err) => {
                if (err) return reject(new Error(`Could not acquire lock for ${filename}`));

                try {
                    await fs.writeJson(filePath, data, { spaces: 2 });
                    lockfile.unlock(lockPath, (unlockErr) => {
                        if (unlockErr) console.error(`Error unlocking ${filename}:`, unlockErr);
                        resolve();
                    });
                } catch (error) {
                    lockfile.unlock(lockPath, () => reject(error));
                }
            });
        });
    }
};
