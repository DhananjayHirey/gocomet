const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId:"gocomet-kafka-admin",
    brokers: ['localhost:9092']
})

async function init(){
    const producer = kafka.producer();
    console.log("producer connecting");
    await producer.connect();
    console.log("producer connection success");
    await producer.send({
        topic: "bid-updates",
        messages: [
            { key:"1",value: JSON.stringify(bid) }
        ] 
    })
    console.log("message sent success");
    await producer.disconnect();
    console.log("producer disconnected");
}

init();