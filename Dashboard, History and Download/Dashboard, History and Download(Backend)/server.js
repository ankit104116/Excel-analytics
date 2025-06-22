const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const historyRoutes = require('./routes/historyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/excelDB');

app.use('/api', historyRoutes);

app.listen(3000, () => console.log("Backend running on port 3000"));