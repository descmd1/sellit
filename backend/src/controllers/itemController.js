const Item = require('../models/Item');
const { cloudinary } = require('../config/cloudinary');

exports.createItem = async (req, res) => {
  try {
    const { title, description, category, condition, location, expectedPrice } = req.body;

    const images = [];
    const videos = [];

    if (req.files) {
      for (const file of req.files) {
        const entry = { url: file.path, publicId: file.filename };
        if (file.mimetype.startsWith('image/')) images.push(entry);
        else videos.push(entry);
      }
    }

    const item = await Item.create({
      title,
      description,
      category,
      condition,
      location,
      expectedPrice: expectedPrice ? Number(expectedPrice) : undefined,
      images,
      videos,
      seller: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ message: 'Item submitted for review', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublishedItems = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, minPrice, maxPrice } = req.query;

    const query = { status: 'approved', isPublished: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = Number(minPrice);
      if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      items,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name phone location')
      .populate('buyer', 'name');

    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Increment views for published items
    if (item.isPublished) {
      item.views += 1;
      await item.save();
    }

    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { seller: req.user._id };
    if (status) query.status = status;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      items,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (item.status === 'sold') {
      return res.status(400).json({ message: 'Cannot delete a sold item' });
    }

    // Clean up Cloudinary assets
    for (const img of item.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }
    for (const vid of item.videos) {
      if (vid.publicId) await cloudinary.uploader.destroy(vid.publicId, { resource_type: 'video' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
