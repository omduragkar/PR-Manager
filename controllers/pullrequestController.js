const Yup = require("yup");
const PullRequest = require("../models/PullRequest");
const createNotification = require("../utils/createNotification");
const Notifications = require("../models/Notification");
const Review = require("../models/Review");
const Approval = require("../models/Approvals");
const { isValidObjectId } = require("mongoose");
const { PRCONSTANTS } = require("../constants/prconstants");

const getAllpullrequestsByUserIdOrRelatedToUserId = async (req, res) => {
  const userId = req.user._id;

  //   Validate the request body
  try {
    if (req.query.id) {
      if (!isValidObjectId(req.query.id)) {
        return res.status(400).json({
          message: "Invalid Pull Request Id.",
        });
      }
      const pullRequestId = req.query.id;
      let pullrequest = await PullRequest.findOne({ _id: pullRequestId })
        .populate("requesterId")
        .populate({
          path: "approvers.approverId",
          model: "User",
        })
        .populate({
          path: "reviews",
          populate: {
            path: "reviewerId",
            model: "User",
          },
        });
      if (!pullrequest) {
        return res.status(400).json({ message: "Pull Request Not Found." });
      }

      await new Promise((resolve, reject) => {
        let data = pullrequest.approvers.findIndex(
          (approver, i) =>
            approver?.approverId._id.toString() == req.user._id.toString()
        );
        if (data == -1) {
          if (
            req.user._id.toString() !== pullrequest.requesterId._id.toString()
          ) {
            return res.status(403).json({
              message: "You are not authorized to view this pull request.",
            });
          }
        }
        resolve();
      });

      if (req.user._id.toString() === pullrequest.requesterId._id.toString()) {
        pullrequest = pullrequest.toObject();
        pullrequest.isOwner = true;
      }
      return res.json(pullrequest);
    }
    let pullrequests = await PullRequest.find({
      $or: [{ requesterId: userId }, { "approvers.approverId": userId }],
    })
      .populate("requesterId")
      .populate({
        path: "approvers.approverId",
        model: "User",
      });

    let modifiedPrs = pullrequests.map((pr) => {
      let prObject = pr.toObject(); // Convert to plain JavaScript object
      prObject.createdByUser = pr.requesterId._id.equals(userId);
      prObject.askedToReviewByUser = !prObject.createdByUser;
      return prObject;
    });
    const userNotifications = await Notifications.find({ userId, read: false });

    return res.json({
      pullrequests: modifiedPrs,
      notifications: userNotifications,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const createPullRequest = async (req, res) => {
  const bodyValidations = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().required(),
    approvers: Yup.array()
      .of(
        Yup.object().shape({
          approverId: Yup.string().required(),
        })
      )
      .required(),
    isSequential: Yup.boolean().required(),
  });
  try {
    let validated = await bodyValidations.validate(req.body);
    const requesterId = req.user._id;
    if (!validated || validated.error || !requesterId) {
      return res.status(400).json({
        message: validated.error.message || "Error Creating Pull Request.",
      });
    }
    req.body.requesterId = requesterId;
    const pullRequest = new PullRequest(req.body);
    // Create a new notification
    const approvers = pullRequest.approvers;
    const notificationPromises = approvers.map((approver, i) => {
      let message = "";
      if (pullRequest?.isSequential) {
        message = `A pull request "${pullRequest.title}" by ${req.user.email} is waiting for Review. After ${i} Number of Reviewers.`;
      } else {
        message = `A pull request "${pullRequest.title}" by ${req.user.email} is waiting for review.`;
      }
      return createNotification(approver.approverId, message);
    });
    let message = `You have a new pull request "${pullRequest.title}" to review.`;
    notificationPromises.push(createNotification(requesterId, message));
    Promise.all(notificationPromises);
    let prs = await pullRequest.save();
    if (!prs) {
      return res.status(400).json({ message: "Error Creating Pull Request." });
    }
    res.json(pullRequest);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller function to delete a pull request
const deletePullRequest = async (req, res) => {
  try {
    const pullRequestId = req.params.id;
    if (!isValidObjectId(pullRequestId)) {
      return res.status(400).json({ message: "Invalid Pull Request Id." });
    }
    const existingPullRequest = await PullRequest.findById(pullRequestId);

    if (!existingPullRequest) {
      return res.status(404).json({ message: "Pull Request not found." });
    }

    // Delete the pull request
    await PullRequest.findByIdAndDelete(pullRequestId);

    res.json({ message: "Pull Request deleted successfully." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// Controller function to edit a pull request
const editPullRequest = async (req, res) => {
  try {
    const pullRequestId = req.params.id;
    if (!isValidObjectId(pullRequestId)) {
      return res.status(400).json({ message: "Invalid Pull Request Id." });
    }
    const existingPullRequest = await PullRequest.findOne({
      _id: pullRequestId,
      $or: [
        { requesterId: req.user._id },
        { "approvers.approverId": req.user._id },
      ],
    })
    if (!existingPullRequest) {
      return res.status(404).json({ message: "Pull Request not found." });
    }
    // Validate the request body
    const bodyValidations = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      approvers: Yup.array().of(
        Yup.object().shape({
          approverId: Yup.string().required(),
        })
      ),
      isSequential: Yup.boolean(),
    });

    const validated = await bodyValidations.validate(req.body, {
      abortEarly: false,
    });

    // Update the pull request fields
    Object.assign(existingPullRequest, validated);

    // Save the updated pull request
    const updatedPullRequest = await existingPullRequest.save();

    res.json(updatedPullRequest);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const addCommentToPullRequest = async (req, res) => {
  try {
    const pullRequestId = req.params.id;
    const { commentText } = req.body;
    const validated = await Yup.object()
      .shape({
        commentText: Yup.string().required(),
      })
      .validate({ commentText });
    if (!isValidObjectId(pullRequestId)) {
      return res.status(400).json({ message: "Invalid Pull Request Id." });
    }
    if (!validated || validated.error) {
      return res.status(400).json({ message: validated.error.message });
    }
    // Validate the comment text
    const commentValidation = Yup.object().shape({
      commentText: Yup.string().required(),
    });

    const validatedComment = await commentValidation.validate({ commentText });

    // Find the pull request by ID
    const pullRequest = await PullRequest.findOne({
      _id: pullRequestId,
      $or: [
        { requesterId: req.user._id },
        { "approvers.approverId": req.user._id },
      ],
    });

    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found." });
    }

    // Create a new comment
    const review = await Review.create({
      pullRequestId,
      comment: validatedComment.commentText,
      reviewerId: req.user._id,
    });
    if (!review) {
      return res.status(400).json({ message: "Error Adding Comment." });
    }
    const poulatedReview = await Review.populate(review, {
      path: "reviewerId",
      model: "User",
    });
    let updatePR = await PullRequest.findByIdAndUpdate(pullRequestId, {
      $push: { reviews: review._id },
    });
    if (!updatePR) {
      return res.status(400).json({ message: "Error Adding Comment." });
    }
    // Create a notification for the pull request owner
    const message = `A new comment has been added to pull request "${pullRequest.title}" by ${req.user.email}.`;
    let notificationsArray =[];
    pullRequest.approvers.forEach((approver) => {
      if (approver.approverId.toString() !== req.user._id.toString()) {
        notificationsArray.push(createNotification(approver.approverId, message));
      }
    })
    if(pullRequest.requesterId.toString() !== req.user._id.toString()){
      notificationsArray.push(createNotification(pullRequest.requesterId, message));
    }
    Promise.all(notificationsArray);
    res.json({
      message: "Comment added successfully.",
      comment: poulatedReview,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller function to get all comments for a pull request
const getAllCommentsForPullRequest = async (req, res) => {
  try {
    const pullRequestId = req.params.id;
    if (!isValidObjectId(pullRequestId)) {
      return res.status(400).json({ message: "Invalid Pull Request Id." });
    }
    // Find the pull request by ID
    const pullRequest = await PullRequest.findOne({
      _id: pullRequestId,
      $or: [
        { requesterId: req.user._id },
        { "approvers.approverId": req.user._id },
      ],
    }).populate("reviews");
    if (!pullRequest) {
      return res.status(404).json({ message: "Pull Request not found." });
    }

    res.json(pullRequest);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller function to add an approval to a pull request
const addApprovalToPullRequest = async (req, res) => {
  try {
    const pullRequestId = req.params.id;
    const { toApprove = true } = req.body;

    // Find the pull request by ID
    if (!isValidObjectId(pullRequestId)) {
      return res.status(400).json({ message: "Invalid Pull Request Id." });
    }
    let pullRequest = await PullRequest.findOne({
      _id: pullRequestId,
      approvers: {
        $elemMatch: {
          approverId: req.user._id,
        },
      },
    });
    if (!pullRequest) {
      return res.status(404).json({
        message: "Pull Request not allowed to Approve from this account.",
      });
    }

    let alreadySubmitted = pullRequest.approvers.find(
      (approver) => approver.approverId.toString() === req.user._id.toString()
    ).status;
    if (
      alreadySubmitted === PRCONSTANTS.approved ||
      alreadySubmitted === PRCONSTANTS.rejected
    ) {
      return res.status(403).json({
        message: "Thanks!You have already submitted your review.",
      });
    }
    // Check if the pull request is already approved or rejected
    if (
      pullRequest?.isSequential && (pullRequest.status === PRCONSTANTS.approved ||
      pullRequest.status === PRCONSTANTS.rejected)
    ) {
      return res.status(403).json({
        message: "This pull request has already been approved or rejected.",
      });
    }
    // Validate if sequential and the current user is the next approver
    if (pullRequest.isSequential) {
      const nextApproverIndex = pullRequest.currentApproverIndex;
      if (
        req.user._id.toString() !==
        pullRequest.approvers[nextApproverIndex].approverId.toString()
      ) {
        return res.status(403).json({
          message: "It is not your turn to approve this pull request.",
        });
      }

      // Ensure that all previous approvers have approved
      const previousApprovers = pullRequest.approvers.slice(
        0,
        nextApproverIndex
      );
      const anyPreviousNotApproved = previousApprovers.some(
        (approver) => approver.status !== PRCONSTANTS.approved
      );

      if (anyPreviousNotApproved) {
        return res.status(403).json({
          message:
            "Previous approvers have not yet approved this pull request.",
        });
      }

      // If the current approver rejects, set the pull request status to PRCONSTANTS.rejected
      if (!toApprove) {
        let newPR = await PullRequest.findOneAndUpdate(
          {
            _id: pullRequestId,
            "approvers.approverId": req.user._id,
          },
          {
            $set: {
              "approvers.$.status": toApprove
                ? PRCONSTANTS.approved
                : PRCONSTANTS.rejected,
            },
            $inc: { currentApproverIndex: 1 },
            status: PRCONSTANTS.rejected,
          },
          {
            new: true,
          }
        );
        return res.status(200).json({
          message: "You rejected the Pull Request SuccessFully.",
          pullRequest: newPR,
        });
      }
    }

    // Update the pull request
    pullRequest = await PullRequest.findOneAndUpdate(
      {
        _id: pullRequestId,
        "approvers.approverId": req.user._id,
      },
      {
        $set: {
          "approvers.$.status": toApprove
            ? PRCONSTANTS.approved
            : PRCONSTANTS.rejected,
        },
      }
    );
    const isLastApproverIndex = pullRequest.approvers.length - 1;
    if (pullRequest.currentApproverIndex === isLastApproverIndex) {
      if (pullRequest.isSequential) {
        let decide = toApprove;
        for (let i = 0; i < pullRequest.approvers.length - 1; i++) {
          if (pullRequest.approvers[i].status !== PRCONSTANTS.approved) {
            decide = false;
          }
        }
        await PullRequest.findOneAndUpdate(
          { _id: pullRequestId },
          {
            $set: {
              status: decide ? PRCONSTANTS.approved : PRCONSTANTS.rejected,
            },
          }
        );
      } else {
        await PullRequest.findOneAndUpdate(
          { _id: pullRequestId },
          {
            $set: {
              status:toApprove
              ? PRCONSTANTS.approved
              : PRCONSTANTS.rejected
            },
          }
        );
      }
    } else {
      if (!pullRequest.isSequential) {
        await PullRequest.findOneAndUpdate(
          { _id: pullRequestId },
          {
            $set: {
              status: toApprove ? PRCONSTANTS.approved : PRCONSTANTS.rejected,
            },
          }
        );
      } else {
        await PullRequest.findOneAndUpdate(
          { _id: pullRequestId },
          { $inc: { currentApproverIndex: 1 },
            $set: {
              status: PRCONSTANTS.pending,
            },
          }
        );
      }
    }

    // Create a notification for the pull request owner
    const message = `Your pull request "${pullRequest.title}" has been ${
      toApprove ? "Approved" : "Rejected"
    } by ${req.user.email}.`;
    Promise.all([createNotification(pullRequest.requesterId, message)]);

    // Save the approval
    res.json(PullRequest);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllpullrequestsByUserIdOrRelatedToUserId,
  createPullRequest,
  deletePullRequest,
  editPullRequest,
  addCommentToPullRequest,
  getAllCommentsForPullRequest,
  addApprovalToPullRequest,
};
