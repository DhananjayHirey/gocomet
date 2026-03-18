const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId:"gocomet-kafka-admin",
    brokers: ['localhost:9092']
})

async function init(){
    const admin = kafka.admin();
    console.log("admin connecting");
    await admin.connect();
    console.log("admin connection success");
    await admin.createTopics({
        topics: [{
            topic: "bid-updates",
            numPartitions: 1
        }]
    })  
    console.log("topic created success");
    await admin.disconnect();
    console.log("admin disconnected");    
}

init();
