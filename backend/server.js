const app = require('./src/app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Smart Order Allocation API listening on port ${env.port} (${env.nodeEnv})`);
});
