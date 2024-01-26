const mongoose = require('mongoose');
module.exports.connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}
