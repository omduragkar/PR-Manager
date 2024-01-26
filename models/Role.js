const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: String,
},{
  timestamps: true,
  versionKey: false,
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;