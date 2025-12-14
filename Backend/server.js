const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/student', require('./routes/student'));
app.use('/parent', require('./routes/parent'));
app.use('/advisor', require('./routes/advisor'));
app.use('/hod', require('./routes/hod'));
app.use('/floor', require('./routes/floor'));

app.get('/', (req, res) => res.send('CIT OutpassX Backend running'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
