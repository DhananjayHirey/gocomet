const redis = require('redis');
const fs = require('fs');
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });
redisClient.connect().then(async () => {
  const history = await redisClient.lRange('auction:1:history', 0, -1);
  fs.writeFileSync('redis-out.json', JSON.stringify(history, null, 2));
  process.exit(0);
});
