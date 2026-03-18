const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bidController.placeBid);
router.get('/:auction_id', bidController.getBids);

module.exports = router;
