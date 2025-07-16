import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino.pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Transport configuration is where we make the changes
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          // --- PRETTY-PRINTING OPTIONS ---
          options: {
            // 1. Use colors in the terminal
            colorize: true,
            // 2. Force single-line output
            singleLine: true,
            // 3. Customize the message format for a clean, single-line view
            messageFormat:
              '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
            // 4. We can still ignore noisy properties
            ignore: 'pid,hostname,req,res,responseTime',
          },
        }
      : undefined,
});

// Your working pino-http configuration remains the same
export const httpLogger = pinoHttp.pinoHttp({
  logger,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  // Serializers are still important, as they prepare the data
  // that pino-pretty uses in its messageFormat
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
