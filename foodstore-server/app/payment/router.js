const router = require('express').Router();
const controller = require('./controller');

router.get('/payments/token/:order_id', controller.getSnapToken);
router.post('/payments/notification', controller.handleNotification);

module.exports = router;
