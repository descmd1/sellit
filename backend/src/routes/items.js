const express = require('express');
const router = express.Router();
const { createItem, getPublishedItems, getItemById, getMyItems, deleteItem } = require('../controllers/itemController');
const { protect, sellerOrAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getPublishedItems);
router.get('/my-items', protect, getMyItems);
router.get('/:id', getItemById);
router.post('/', protect, sellerOrAdmin, upload.array('media', 10), createItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
