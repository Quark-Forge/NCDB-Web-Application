import express from 'express';
import sequelize from '../config/db.js';

const router = express.Router();

router.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'success', 
      message: 'Database connected successfully',
      database: sequelize.config.database
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

export default router;