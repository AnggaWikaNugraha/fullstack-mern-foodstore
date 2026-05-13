const router = require('express').Router();
const controller = require('./controller');

router.post('/reviews', controller.create);
router.get('/reviews', controller.index);

module.exports = router;
