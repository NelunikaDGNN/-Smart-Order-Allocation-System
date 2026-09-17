const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security headers
app.use(helmet());

// Restrict CORS to the known frontend origin rather than '*'
const allowedOrigins = Array.isArray(env.frontendOrigin)
  ? env.frontendOrigin
  : env.frontendOrigin.split(',').map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
     
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));


app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', routes);


app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use(errorHandler);

module.exports = app;
