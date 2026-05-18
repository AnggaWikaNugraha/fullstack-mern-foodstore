const express = require('express');
const router = express.Router();
const pusher = require('../pusher');

router.post('/pusher/auth', (req, res) => {
    const user = req.user;
    if (!user) return res.status(403).json({ error: 'Unauthorized' });

    const { socket_id, channel_name } = req.body;

    if (channel_name === 'private-admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // private-order-{orderId} — siapapun yang login boleh subscribe
    const auth = pusher.authorizeChannel(socket_id, channel_name);
    res.send(auth);
});

module.exports = router;
