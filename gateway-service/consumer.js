const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId:"gocomet-kafka-admin",
    brokers: ['localhost:9092']
})

async function init(){
    const consumer = kafka.consumer({groupId:"user-1"});
    console.log("consumer connecting");
    await consumer.connect();
    console.log("consumer connection success");
    await consumer.subscribe({topic:"bid-updates",fromBeginning:true});
    console.log("consumer subscribed success");
    await consumer.run({
        eachMessage: async ({topic,partition,message}) => {
            console.log(message.value.toString());
        }
    })
    console.log("consumer running");
}