// import https from 'https';
// import cron from 'node-cron';
// import log from '../../utils/index.js';

// const url = 'https://car-rental-backend-lhm2.onrender.com';

// function keepAlive(url) {
//   https
//     .get(url, (res) => {
//       console.log(`Status: ${res.statusCode}`);
//     })
//     .on('error', (error) => {
//       logger.error(`Errors: ${error.message}`);
//     });
// }

// cron.schedule('*/5 * * * *', () => {
//   keepAlive(url);
//   console.log('Pinging the server every 5 minutes');
// });

// export default keepAlive;
