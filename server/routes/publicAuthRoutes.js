import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import PublicUser from '../models/PublicUser.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
  const { email, password, name } = req.body;
  const exists = await PublicUser.findOne({ email });
  if (exists) return res.status(400).json({ status: 'error', message: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 12);
  const user = await PublicUser.create({ email, password: hashed, name });
  const token = jwt.sign({ public_id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ status: 'success', data: { user: { email: user.email, name: user.name }, token } });
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
  const { email, password } = req.body;
  const user = await PublicUser.findOne({ email });
  if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  const token = jwt.sign({ public_id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ status: 'success', data: { user: { email: user.email, name: user.name }, token } });
});

export default router;


