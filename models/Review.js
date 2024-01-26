const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  pullRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "PullRequest" },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
},{
  timestamps: true,
  versionKey: false,
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;