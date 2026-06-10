const SENSITIVE = ['password', 'password_confirmation', 'token', 'id_token', 'fcm_token', 'private_key'];

function redact(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) =>
            SENSITIVE.includes(k.toLowerCase()) ? [k, '***'] : [k, v]
        )
    );
}

function apiLogger(req, res, next) {
    const start = Date.now();
    const { method, originalUrl, params, query, body } = req;

    const originalJson = res.json.bind(res);
    res.json = function (data) {
        const ms = Date.now() - start;
        const log = {
            method,
            url: originalUrl,
            ...(Object.keys(params).length  && { params }),
            ...(Object.keys(query).length   && { query }),
            ...(body && Object.keys(body).length && { body: redact(body) }),
            status: res.statusCode,
            ms,
            response: truncate(data),
        };
        console.log(`[API] ${method} ${originalUrl} ${res.statusCode} ${ms}ms`);
        console.log(JSON.stringify(log, null, 2));
        return originalJson(data);
    };

    next();
}

function truncate(data) {
    if (!data) return data;
    const str = JSON.stringify(data);
    if (str.length <= 500) return data;
    return str.slice(0, 500) + '...(truncated)';
}

module.exports = apiLogger;
