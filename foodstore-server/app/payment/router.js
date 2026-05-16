const router = require('express').Router();
const controller = require('./controller');

router.get('/payments/token/:order_id', controller.getSnapToken);
router.get('/payments/verify/:order_id', controller.verifyPayment);
router.post('/payments/notification', controller.handleNotification);

module.exports = router;
