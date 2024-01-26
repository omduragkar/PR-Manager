const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  pullRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "PullRequest" },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: String,
},{
  timestamps: true,
  versionKey: false,
});
const Approval = mongoose.model("Approval", approvalSchema);
module.exports = Approval;