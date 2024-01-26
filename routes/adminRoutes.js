const { createRole } = require('../controllers/userController');
const { checkAdmin } = require('../middlewares/checkAuth');

const router = require('express').Router();
// Pull Requests endpoints
router.post('/create-role', checkAdmin, createRole);

module.exports = router;