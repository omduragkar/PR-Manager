const mongoose = require('mongoose');
const { PRCONSTANTS } = require('../constants/prconstants');

const pullRequestSchema = new mongoose.Schema({
  title: String,
  description: String,
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvers: [
    {
      approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: [PRCONSTANTS.approved, PRCONSTANTS.rejected, PRCONSTANTS.pending],
        default: PRCONSTANTS.pending,
      },
      comments: String,
    },
  ],
  isSequential: {
    type: Boolean,
    default: false,
  },
  currentApproverIndex: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: [PRCONSTANTS.approved, PRCONSTANTS.rejected, PRCONSTANTS.pending],
    default: PRCONSTANTS.pending,
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  approvals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Approval' }],

},{
  timestamps: true,
  versionKey: false,
});

const PullRequest = mongoose.model("PullRequest", pullRequestSchema);
module.exports = PullRequest;