import express from 'express';
import logger from './loaders/logger'
import Loaders from './loaders';

async function StartServer() {
  const app = express();
  await Loaders({ expressApp: app });
  app
    .listen(8000, () => {
      console.log("Server is Connected Successfully with PORT", 8000);
    })
    .on('error', (err) => {
      logger.error(err);
      process.exit(1);
    })
}

StartServer();
