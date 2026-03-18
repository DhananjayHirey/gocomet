const redis = require('redis');
const { Bid } = require('../models/bidModel');
const { getIO } = require('../socket/socketHandler');


const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});
redisClient.connect().catch(console.error);


// NOTE : CORE LOGIC HERE IS THAT :
// First the triggers occur only if we are within the trigger window...ie
// Within the bidCloseTime/bidForceCloseTime and currentTime
// NOW THERE ARE 3 Triggers:
// 1. extended by extensionMs when any bid is placed
// 2. extended by extensionMs when the rank of any bidder changes
// (Note : Since only unique values are updated, every time the bid is placed rank is going to change)
// 3. exntended by extensionMs when the lowest bidder changes

// Edge Case that I noticed:
// Eg. if the current time is 1h 20min and the trigger window is of 10min suppose the forcedEndTime is 1h28min and the extensionMs is 10mins too. 
// Now in this case, we can't go beyond the forcedEndtime so the bid will be rejected, since the application intends to give a specific buffer to the other suppliers to make decision.

async function handleBidProcessing({ auction_id, supplier_id, price }) {
  try {
    // 1. Fetch Auction details from Redis or DB(incase Redis is empty)
    let auction = await redisClient.hGetAll(`auction:${ auction_id }:metadata`);
    if (Object.keys(auction).length === 0) {
      const dbAuction = await Bid.getAuctionMetadata(auction_id);
      if (!dbAuction) throw new Error('Auction not found');
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
      await redisClient.hSet(`auction:${ auction_id }:metadata`, auction);
    }

    const now = new Date();
    const bidStartTime = new Date(auction.bid_start_time);
    const bidCloseTime = new Date(auction.bid_close_time);
    const forcedCloseTime = new Date(auction.forced_close_time);

    if (auction.status !== 'ACTIVE' || now < bidStartTime || now > bidCloseTime || now > forcedCloseTime) {
      throw new Error('Auction inactive or not in bidding window');
    }

    // 2. bid must be lower than the lowest bid to be placed.
    const currentL1 = await redisClient.zRangeWithScores(`auction:${ auction_id }:bids`, 0, 0);
    if (currentL1.length > 0 && price >= currentL1[0].score) {     
      const io = getIO();
      io.to(`user:${ supplier_id }`).emit('bid_error', { auction_id, message: `Your bid $${ price } did not beat the current L1 of $${ currentL1[0].score }` });
      return { success: false, message: 'Bid did not beat L1' };
    }


    // Pre-checking if exntending the endTime is even possible or not.
  const triggerWindowMs = parseInt(auction.trigger_window_minutes) * 60 * 1000;
  const extensionMs = parseInt(auction.extension_duration_minutes) * 60 * 1000;

  const inTriggerWindow = (bidCloseTime - now <= triggerWindowMs);

  if (inTriggerWindow) {
    let wouldTrigger = false;

    if (auction.trigger_type === 'ANY_BID') {
      wouldTrigger = true;
    } else if (auction.trigger_type === 'ANY_RANK_CHANGE') {     
      wouldTrigger = true;
    } else if (auction.trigger_type === 'L1_CHANGE') {
      if (currentL1.length === 0 || price < currentL1[0].score) {
        wouldTrigger = true;
      }
    }

    if (wouldTrigger) {
      let potentialNewClose = new Date(bidCloseTime.getTime() + extensionMs);

      if (potentialNewClose > forcedCloseTime) {
        potentialNewClose = forcedCloseTime;
      }

      const canExtend = potentialNewClose > bidCloseTime;
      
      if (!canExtend) {
        const io = getIO();
        io.to(`user:${supplier_id}`).emit('bid_error', {
          auction_id,
          message: 'Bid rejected: Cannot extend auction beyond forced close time',
        });

        return {
          success: false,
          message: 'Extension not possible, bid rejected',
        };
      }
    }
  }


    // 3. Process Bid in Redis
    const oldRankings = await redisClient.zRange(`auction:${ auction_id }:bids`, 0, -1);
    const oldSupplierRank = oldRankings.indexOf(supplier_id.toString());
    await redisClient.zAdd(`auction:${ auction_id }:bids`, { score: price, value: supplier_id.toString() });

    const newRankings = await redisClient.zRange(`auction:${ auction_id }:bids`, 0, -1);
    const newL1 = await redisClient.zRangeWithScores(`auction:${ auction_id }:bids`, 0, 0);
    const newSupplierRank = newRankings.indexOf(supplier_id.toString());

    // 4. extending endTime if needed
    let extended = false;   

    if (bidCloseTime - now <= triggerWindowMs) {
      let shouldExtend = false;
      if (auction.trigger_type === 'ANY_BID') shouldExtend = true;
      else if (auction.trigger_type === 'ANY_RANK_CHANGE' && (oldSupplierRank === -1 || oldSupplierRank !== newSupplierRank)) shouldExtend = true;
      else if (auction.trigger_type === 'L1_CHANGE' && (currentL1.length === 0 || currentL1[0].value !== newL1[0].value)) shouldExtend = true;

      if (shouldExtend) {
        let newCloseTime = new Date(bidCloseTime.getTime() + extensionMs);
        if (newCloseTime > forcedCloseTime) newCloseTime = forcedCloseTime;
        if (newCloseTime > bidCloseTime) {
          auction.bid_close_time = newCloseTime.toISOString();
          await redisClient.hSet(`auction:${ auction_id }:metadata`, 'bid_close_time', auction.bid_close_time);
          await Bid.updateAuctionCloseTime(auction_id, newCloseTime);
          extended = true;
        }
      }
    }

    // 5. Redis save, DB save  
    await Bid.save(auction_id, supplier_id, price);
    const bidToLog = { auction_id, supplier_id, price, timestamp: now.toISOString() };
    await redisClient.lPush(`auction:${ auction_id }:history`, JSON.stringify(bidToLog));
    await redisClient.lTrim(`auction:${ auction_id }:history`, 0, 99);

    // 6. Broadcast to all other bidders
    const io = getIO();
    const bidEvent = { ...bidToLog, bid_close_time: auction.bid_close_time, extended, rankings: newRankings };
    io.to(`auction:${ auction_id }`).emit('bid_update', bidEvent);
    if (extended) {
      io.to(`auction:${ auction_id }`).emit('auction_extended', { auction_id, new_close_time: auction.bid_close_time });
    }

    return { success: true, extended, new_close_time: auction.bid_close_time };
  } catch (err) {
    console.error('Bid Processing Error:', err.message);
    const io = getIO();
    io.to(`user:${ supplier_id }`).emit('bid_error', { auction_id, message: err.message });
    return { success: false, error: err.message };
  }
}

exports.handleBidProcessing = handleBidProcessing;

exports.placeBid = async (req, res) => {
  const { auction_id, price } = req.body;
  const supplier_id = req.user.id;
  if (!auction_id || !price) return res.status(400).json({ message: 'auction_id and price are required' });
  
  const result = await handleBidProcessing({ auction_id, supplier_id, price });
  if (result.success) res.status(201).json(result);
  else res.status(400).json(result);
};

exports.getBids = async (req, res) => {
  const { auction_id } = req.params;
  try {
    // fetch data from redis then from db if not found
    let history = await redisClient.lRange(`auction:${auction_id}:history`, 0, -1);
    if (history.length > 0) {
      history = history.map(h => JSON.parse(h));
    } else {     
      const dbHistory = await Bid.getHistory(auction_id);
      history = dbHistory.map(b => ({
        auction_id: b.auction_id,
        supplier_id: b.supplier_id,
        price: b.price,
        timestamp: b.created_at.toISOString()
      }));      
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
