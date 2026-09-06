module.exports = async (req, res) => {
  try {
    const app = require('../server/src/app');
    return app(req, res);
  } catch (err) {
    console.error('SERVERLESS INIT ERROR:', err);
    return res.status(500).json({
      error: 'SERVERLESS_INIT_ERROR',
      message: err.message,
      stack: err.stack
    });
  }
};
