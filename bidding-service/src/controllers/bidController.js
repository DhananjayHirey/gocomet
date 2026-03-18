const redis = require('redis');
const { Bid } = require('../models/bidModel');
const { getIO } = require('../socket/socketHandler');

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});
redisClient.connect().catch(console.error);

exports.placeBid = async (req, res) => {
  const { auction_id, price } = req.body;
  const supplier_id = req.user.id; // From middleware

  if (!auction_id || !price) {
    return res.status(400).json({ message: 'auction_id and price are required' });
  }

  try {
    // 1. Get auction metadata (from Redis or DB)
    let auction = await redisClient.hGetAll(`auction:${auction_id}:metadata`);
    if (Object.keys(auction).length === 0) {
      const dbAuction = await Bid.getAuctionMetadata(auction_id);
      if (!dbAuction) return res.status(404).json({ message: 'Auction not found' });
      
      auction = {
        id: dbAuction.id.toString(),
        bid_start_time: dbAuction.bid_start_time.toISOString(),
        bid_close_time: dbAuction.bid_close_time.toISOString(),
        forced_close_time: dbAuction.forced_close_time.toISOString(),
        trigger_window_minutes: dbAuction.trigger_window_minutes.toString(),
        extension_duration_minutes: dbAuction.extension_duration_minutes.toString(),
        trigger_type: dbAuction.trigger_type,
        status: dbAuction.status,
      };
      await redisClient.hSet(`auction:${auction_id}:metadata`, auction);
    }

    const now = new Date();
    const bidStartTime = new Date(auction.bid_start_time);
    const bidCloseTime = new Date(auction.bid_close_time);
    const forcedCloseTime = new Date(auction.forced_close_time);

    if (auction.status !== 'ACTIVE' || now < bidStartTime || now > bidCloseTime || now > forcedCloseTime) {
      if (now < bidStartTime) return res.status(400).json({ message: 'Auction has not started yet' });
      return res.status(400).json({ message: 'Auction inactive or ended' });
    }

    // 2. Process Bid in Redis
    const oldL1 = await redisClient.zRangeWithScores(`auction:${auction_id}:bids`, 0, 0);
    const oldRankings = await redisClient.zRange(`auction:${auction_id}:bids`, 0, -1);
    const oldSupplierRank = oldRankings.indexOf(supplier_id.toString());

    await redisClient.zAdd(`auction:${auction_id}:bids`, { score: price, value: supplier_id.toString() });

    const newRankings = await redisClient.zRange(`auction:${auction_id}:bids`, 0, -1);
    const newL1 = await redisClient.zRangeWithScores(`auction:${auction_id}:bids`, 0, 0);
    const newSupplierRank = newRankings.indexOf(supplier_id.toString());

    // 3. Extension Logic
    let extended = false;
    const triggerWindowMs = parseInt(auction.trigger_window_minutes) * 60 * 1000;
    const extensionMs = parseInt(auction.extension_duration_minutes) * 60 * 1000;

    if (bidCloseTime - now <= triggerWindowMs) {
      let shouldExtend = false;
      if (auction.trigger_type === 'ANY_BID') shouldExtend = true;
      else if (auction.trigger_type === 'ANY_RANK_CHANGE' && (oldSupplierRank === -1 || oldSupplierRank !== newSupplierRank)) shouldExtend = true;
      else if (auction.trigger_type === 'L1_CHANGE' && (oldL1.length === 0 || oldL1[0].value !== newL1[0].value)) shouldExtend = true;

      if (shouldExtend) {
        let newCloseTime = new Date(bidCloseTime.getTime() + extensionMs);
        if (newCloseTime > forcedCloseTime) newCloseTime = forcedCloseTime;

        if (newCloseTime > bidCloseTime) {
          auction.bid_close_time = newCloseTime.toISOString();
          await redisClient.hSet(`auction:${auction_id}:metadata`, 'bid_close_time', auction.bid_close_time);
          await Bid.updateAuctionCloseTime(auction_id, newCloseTime);
          extended = true;
        }
      }
    }

    // 4. Persistence
    await Bid.save(auction_id, supplier_id, price);
    const bidToLog = { auction_id, supplier_id, price, timestamp: now.toISOString() };
    await redisClient.lPush(`auction:${auction_id}:history`, JSON.stringify(bidToLog));
    await redisClient.lTrim(`auction:${auction_id}:history`, 0, 99); // Keep last 100 bids in Redis

    // 5. Broadcast
    const io = getIO();
    const bidEvent = { ...bidToLog, bid_close_time: auction.bid_close_time, extended, rankings: newRankings };
    io.to(`auction:${auction_id}`).emit('bid_update', bidEvent);
    if (extended) {
      io.to(`auction:${auction_id}`).emit('auction_extended', { auction_id, new_close_time: auction.bid_close_time });
    }

    res.status(201).json({ message: 'Bid placed successfully', extended, new_close_time: auction.bid_close_time });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBids = async (req, res) => {
  const { auction_id } = req.params;
  try {
    // Try Redis first
    let history = await redisClient.lRange(`auction:${auction_id}:history`, 0, -1);
    if (history.length > 0) {
      history = history.map(h => JSON.parse(h));
    } else {
      // Fallback to DB
      const dbHistory = await Bid.getHistory(auction_id);
      history = dbHistory.map(b => ({
        auction_id: b.auction_id,
        supplier_id: b.supplier_id,
        price: b.price,
        timestamp: b.created_at.toISOString()
      }));
      // Cache in Redis
      if (history.length > 0) {
        const toCache = history.slice(0, 100).map(h => JSON.stringify(h));
        await redisClient.lPush(`auction:${auction_id}:history`, ...toCache.reverse());
      }
    }

    const rankings = await redisClient.zRange(`auction:${auction_id}:bids`, 0, -1);
    
    res.json({ history, rankings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
