const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  roles: [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
},{
  timestamps: true,
  versionKey: false,
});

const User = mongoose.model("User", userSchema);
module.exports = User;