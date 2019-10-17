import express from 'express'
import fs from 'fs'
import http from 'http'

import userbaseServer from 'userbase-server'

const app = express()
const distDir = './src/proof-of-concept/dist'

const httpsKeyPath = '../keys/key.pem'
const httpsCertPath = '../keys/cert.pem'
const httpPort = process.env.PORT || 8080
const httpsPort = process.env.PORT || 8443
const certExists = fs.existsSync(httpsKeyPath) && fs.existsSync(httpsCertPath)
const httpsKey = certExists && fs.readFileSync(httpsKeyPath)
const httpsCert = certExists && fs.readFileSync(httpsCertPath)

const userbaseConfig = {
  httpsKey,
  httpsCert,
  httpsPort,
  httpPort
}

const ADMIN_NAME = 'admin'
const ADMIN_ID = 'admin-id'

const APP_NAME = 'proof-of-concept'
const APP_ID = 'poc-id'

const CONFLICT_STATUS_CODE = 409

start()
async function start() {
  app.use(express.static(distDir))
  await userbaseServer.start(app, userbaseConfig)

  await setupAdmin()
  await setupApp()
}

async function setupAdmin() {
  try {
    const adminPassword = process.env['sm.ADMIN_ACCOUNT_PASSWORD']

    await userbaseServer.createAdmin(ADMIN_NAME, adminPassword, ADMIN_ID)
  } catch (e) {
    if (!e || e.status !== CONFLICT_STATUS_CODE) {
      console.log(`Failed to set up new admin account with ${JSON.stringify(e)}`)
    }
  }
}

async function setupApp() {
  try {
    await userbaseServer.createApp(APP_NAME, APP_ID, ADMIN_ID)
  } catch (e) {
    if (!e || e.status !== CONFLICT_STATUS_CODE) {
      console.log(`Failed to set up new app with ${JSON.stringify(e)}`)
    }
  }
}
