const router = require('express').Router();
const controller = require('./controller');

router.get('/wishlists', controller.index);
router.post('/wishlists', controller.store);
router.delete('/wishlists/:product_id', controller.destroy);

module.exports = router;
