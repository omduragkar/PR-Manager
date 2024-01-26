const {  createUser, loginUser, getRoles, getApproverUsers } = require('../controllers/userController');
const { checkAuth } = require('../middlewares/checkAuth');


const router = require('express').Router();
// Pull Requests endpoints
router.post('/login', loginUser)
router.post('/signup', createUser);
router.get('/get-approval-users', checkAuth, getApproverUsers);
router.get('/get-roles', getRoles);

module.exports = router;