import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';
import upload from '../middlewares/upload.js';
import { getPosts, getPostById, createPost, updatePost, deletePost, incrementViews, incrementLikes } from '../controllers/postController.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticateJWT, requireAdmin, upload, createPost);
router.put('/:id', authenticateJWT, requireAdmin, upload, updatePost);
router.delete('/:id', authenticateJWT, requireAdmin, deletePost);
router.post('/:id/view', incrementViews);
router.post('/:id/like', incrementLikes);

export default router;
