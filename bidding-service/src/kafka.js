const { Kafka } = require('kafkajs');
const { handleBidProcessing } = require('./controllers/bidController');

const kafka = new Kafka({
  clientId: 'bidding-service',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'bidding-group' });

const initKafka = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'bid-updates', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const bidData = JSON.parse(message.value.toString());
        console.log(`Kafka Consumer: Processing bid for auction ${bidData.auction_id}`);
        await handleBidProcessing(bidData);
      },
    });
    console.log('Kafka Consumer connected and running');
  } catch (err) {
    console.error('Kafka Consumer Error:', err);
  }
};

module.exports = { initKafka };
