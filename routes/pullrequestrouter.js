const { createPullRequest, getAllpullrequestsByUserIdOrRelatedToUserId, deletePullRequest, editPullRequest, addCommentToPullRequest, getAllCommentsForPullRequest, addApprovalToPullRequest } = require('../controllers/pullrequestController');
const { checkAuth, checkAuthApprover } = require('../middlewares/checkAuth');

const router = require('express').Router();
// Pull Requests endpoints
router.get('/', checkAuth, getAllpullrequestsByUserIdOrRelatedToUserId);
router.put('/:id', checkAuth, editPullRequest);
router.delete('/:id', checkAuth, deletePullRequest);
router.post('/create', checkAuth, createPullRequest);
router.post('/comments/:id', checkAuth, addCommentToPullRequest);
router.get('/comments/:id', checkAuth, getAllCommentsForPullRequest);
router.post('/approve/:id', checkAuthApprover, addApprovalToPullRequest);
module.exports = router;