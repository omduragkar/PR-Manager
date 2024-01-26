const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./utils/connectDB');
dotenv.config();
const cors = require('cors');
const app = express();

// Connect to MongoDB
connectDB();
app.use(express.json());
app.use(cors());

app.use('/pull-requests', require('./routes/pullrequestrouter'));
app.use('/users', require('./routes/userCreationRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
// Add more endpoints as per your requirements

app.listen(process.env.port, () => console.log('Server started on port 3000'));