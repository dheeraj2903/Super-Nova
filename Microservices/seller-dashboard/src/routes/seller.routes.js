const express = require('express');
const createAuthMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/metrics', createAuthMiddleware([ "seller" ]), )


module.exports = router;