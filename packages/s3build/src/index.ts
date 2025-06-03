import { producer, publishLog } from "./utils/kafka"
import s3Client from "./utils/s3Client"
import {  PutObjectCommand } from "@aws-sdk/client-s3"
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import mime from 'mime-types'
import dotenv from 'dotenv'

dotenv.config()

const PROJECT_ID = process.env.PROJECT_ID

async function init() {

    await producer.connect()

    console.log('Executing script.js')
    await publishLog('Build Started...')
    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    if (p.stdout) {
        p.stdout.on('data', function (data: string) {
            console.log(data.toString())
            publishLog(data.toString())
        })

        p.stdout.on('error', async function (data: string) {
            console.log('Error', data.toString())
            await publishLog(`error: ${data.toString()}`)
        })
    }

    p.on('close', async function () {
        console.log('Build Complete')
        await publishLog(`Build Complete`)
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

        await publishLog(`Starting to upload`)
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file.toString())
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath)
            await publishLog(`uploading ${file}`)

            const command = new PutObjectCommand({
                Bucket: 'vercel-clone-outputs-1',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) as string
            })

            await s3Client.send(command)
            publishLog(`uploaded ${file}`)
            console.log('uploaded', filePath)
        }
        await publishLog(`Done`)
        console.log('Done...')
        process.exit(0)
    })
}

init()