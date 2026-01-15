export const sanitizer = {
    clean(text) {
        if (typeof text !== 'string') return text;
        return text
            .trim()
            .replace(/[<>]/g, '') // Remove basic tags
            .slice(0, 500); // Limit length
    },

    escapeHTML(text) {
        if (typeof text !== 'string') return text;
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};
