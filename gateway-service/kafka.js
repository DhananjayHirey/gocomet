const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'gateway-service',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'],
});

const producer = kafka.producer();

const initKafkaProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
  } catch (err) {
    console.error('Kafka Producer Error:', err);
  }
};

const sendBidUpdate = async (bidData) => {
  try {
    await producer.send({
      topic: 'bid-updates',
      messages: [{ value: JSON.stringify(bidData) }],
    });
  } catch (err) {
    console.error('Failed to send Kafka message:', err);
  }
};

module.exports = { initKafkaProducer, sendBidUpdate };
