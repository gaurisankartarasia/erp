import { login , logout, getCurrentUser} from "../controllers/auth/AuthController.js";

import express from "express";

const router = express.Router();

router.post("/login", login);
router.post('/logout', logout);
router.get('/session',  getCurrentUser);

export default router;
