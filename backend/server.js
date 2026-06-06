const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  schoolName: { type: String, default: '' },
  scoutRank: { type: String, default: '' },
  nidNumber: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const otpSchema = new mongoose.Schema({
  email: String, otp: String,
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

const noticeSchema = new mongoose.Schema({
  title: String, content: String, author: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP', otpSchema);
const Notice = mongoose.model('Notice', noticeSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) { res.status(401).json({ success: false, message: 'Invalid token' }); }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
  next();
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already exists' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    console.log(`OTP for ${email}: ${otp}`);
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER, to: email,
        subject: 'Scout Portal OTP',
        html: `<h2>Scout Portal</h2><p>Your OTP: <strong>${otp}</strong></p><p>Valid 5 minutes.</p>`
      });
    } catch (e) { console.log('Email error:', e.message); }
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!await OTP.findOne({ email, otp })) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    const user = await User.create({ email, password: await bcrypt.hash(password, 10), name, isVerified: true });
    await OTP.deleteMany({ email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role, status: user.status } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/user/profile', auth, (req, res) => res.json({ success: true, user: req.user }));

app.post('/api/user/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; delete updates.role;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/notices', async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });
  res.json({ success: true, notices });
});

app.post('/api/notices', auth, adminAuth, async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, author: req.user.name });
    res.json({ success: true, notice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/notices/:id', auth, adminAuth, async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/users', auth, adminAuth, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

app.put('/api/admin/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/idcard/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: [280, 440], margin: 20 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=scout-id.pdf`);
    doc.pipe(res);
    doc.fontSize(14).fillColor('#1a5276').text('SCOUTS OF BANGLADESH', { align: 'center' });
    doc.moveDown(0.5).fontSize(10).fillColor('#333');
    doc.text(`Name: ${user.name || 'N/A'}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phone || 'N/A'}`);
    doc.text(`Blood Group: ${user.bloodGroup || 'N/A'}`);
    doc.text(`Scout Rank: ${user.scoutRank || 'N/A'}`);
    doc.text(`School: ${user.schoolName || 'N/A'}`);
    doc.text(`DOB: ${user.dateOfBirth || 'N/A'}`);
    doc.text(`Address: ${user.address || 'N/A'}`);
    doc.moveDown().fontSize(8).fillColor('#666').text(`ID: ${user._id}`, { align: 'center' });
    doc.end();
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/', (req, res) => res.json({ message: '🎖️ Scout Portal API Running!' }));
app.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
