const Auction = require('../models/auctionModel');

exports.createAuction = async (req, res) => {
  const { name, bid_start_time, bid_close_time, forced_close_time, trigger_window_minutes, extension_duration_minutes, trigger_type } = req.body;

  
  if (new Date(forced_close_time) <= new Date(bid_close_time)) {
    return res.status(400).json({ message: 'forced_close_time must be greater than bid_close_time' });
  }

  try {
    const auction = await Auction.create(req.body);
    res.status(201).json(auction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findAll();
    res.json(auctions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
