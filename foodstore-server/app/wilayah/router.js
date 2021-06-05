const router = require('express').Router();
const wilayahController = require('./controller');

router.get('/wilayah/provinsi', wilayahController.getProvinsi);
router.get('/wilayah/kabupaten', wilayahController.getKabupaten);

module.exports = router;
