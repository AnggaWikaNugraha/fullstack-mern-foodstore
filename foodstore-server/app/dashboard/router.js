const router = require('express').Router();
const controller = require('./controller');

router.get('/dashboard/summary', controller.getSummary);
router.get('/dashboard/revenue', controller.getRevenueChart);
router.get('/dashboard/top-products', controller.getTopProducts);

module.exports = router;
