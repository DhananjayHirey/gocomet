const { Kafka } = require('kafkajs');
const kafka = new Kafka({
  clientId: 'test-producer',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();
async function run() {
  await producer.connect();
  const bidData = { auction_id: 1, price: 90, supplier_id: 4 };
  await producer.send({
    topic: 'bid-updates',
    messages: [{ value: JSON.stringify(bidData) }]
  });
  console.log('Sent bid', bidData);
  await producer.disconnect();
}
run().catch(console.error);
