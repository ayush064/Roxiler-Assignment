const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/initialize_db', productController.initializeDatabase);
router.get('/transactions', productController.getTransactions);
router.get('/statistics', productController.getStatistics);
router.get('/bar_chart', productController.getBarChart);
router.get('/pie_chart', productController.getPieChart);
router.get('/combined_data', productController.getCombinedData);

module.exports = router;
