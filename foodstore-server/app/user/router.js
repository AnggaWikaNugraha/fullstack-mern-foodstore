const router = require('express').Router();
const controller = require('./controller');

router.put('/users/set-password', controller.setPassword);

module.exports = router;
