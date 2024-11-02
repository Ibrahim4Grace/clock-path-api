import mongoose from 'mongoose';
import { customEnv } from '../config/index.js';
import { log } from '../utils/index.js';

const connection = {};

async function connectDb() {
  try {
    if (connection.isConnected) {
      log.info('Already connected to the database.');
      return;
    }
    if (mongoose.connections.length > 0) {
      connection.isConnected = mongoose.connections[0].readyState;
      if (connection.isConnected === 1) {
        log.info('Use previous connection to the database.');
        return;
      }
      await mongoose.disconnect();
    }
    const db = await mongoose.connect(customEnv.mongoDbURI);
    log.info(`New connection to the database: ${db.connection.host}`.gray);
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function disconnectDb() {
  if (connection.isConnected) {
    if (process.env.NODE_END === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('not diconnecting from the database.');
    }
  }
}
const db = { connectDb, disconnectDb };
export { db };
