import { Kafka } from "kafkajs";
const path = require('path')
import fs from 'fs';

const DEPLOYEMENT_ID = process.env.DEPLOYEMENT_ID
const PROJECT_ID = process.env.PROJECT_ID || 'default-project';
const kafka = new Kafka({
    clientId: `docker-build-server-${DEPLOYEMENT_ID}`,
    brokers: [''],
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')]
    },
    sasl: {
        username: '',
        password: '',
        mechanism: 'plain'
    }

})



export const producer = kafka.producer()

export async function publishLog(log: string) {
    await producer.send({ topic: `container-logs`, messages: [{ key: 'log', value: JSON.stringify({ PROJECT_ID, DEPLOYEMENT_ID, log }) }] })
}
