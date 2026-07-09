require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');

const app = express();

app.use(cors({ exposedHeaders: ['X-Total-Count'] }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('hello');
});

app.use('/auth', authRoutes);
app.use('/leads', leadsRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
