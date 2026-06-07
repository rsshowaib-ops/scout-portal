const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  scoutRank: { type: String, default: '' },
  scoutGroup: { type: String, default: '' },
  nidNumber: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  permanentAddress: { type: String, default: '' },
  currentAddress: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  role: { type: String, default: 'user' },
  membershipNo: { type: String, default: '' }
}, { timestamps: true });

const noticeSchema = new mongoose.Schema({
  title: String, content: String, author: String
}, { timestamps: true });

const studySchema = new mongoose.Schema({
  title: String, content: String, imageUrl: String, author: String
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  message: String,
  reply: { type: String, default: '' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userPhoto: String,
  message: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Notice = mongoose.model('Notice', noticeSchema);
const Study = mongoose.model('Study', studySchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const Chat = mongoose.model('Chat', chatSchema);

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'অনুমতি নেই' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) { res.status(401).json({ success: false, message: 'Invalid token' }); }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
  next();
};

// Register - সরাসরি, কোনো OTP নাই
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, fatherName, motherName, photoUrl, permanentAddress, currentAddress, bloodGroup, dateOfBirth, scoutRank, nidNumber } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'এই ইমেইল দিয়ে আগে থেকে অ্যাকাউন্ট আছে' });
    const membershipNo = 'SC' + Date.now().toString().slice(-6);
    const user = await User.create({
      email, password: await bcrypt.hash(password, 10),
      name, phone, fatherName, motherName, photoUrl,
      permanentAddress, currentAddress, bloodGroup,
      dateOfBirth, scoutRank, nidNumber, membershipNo
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role, photoUrl: user.photoUrl, status: user.status } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(400).json({ success: false, message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.role, photoUrl: user.photoUrl, status: user.status } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Profile
app.get('/api/user/profile', auth, (req, res) => res.json({ success: true, user: req.user }));
app.post('/api/user/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; delete updates.role; delete updates.status;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Public Profile for QR
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'পাওয়া যায়নি' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Notices
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

// Study Materials
app.get('/api/study', async (req, res) => {
  const items = await Study.find().sort({ createdAt: -1 });
  res.json({ success: true, items });
});
app.post('/api/study', auth, adminAuth, async (req, res) => {
  try {
    const item = await Study.create({ ...req.body, author: req.user.name });
    res.json({ success: true, item });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.delete('/api/study/:id', auth, adminAuth, async (req, res) => {
  await Study.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Complaints
app.get('/api/complaints', auth, async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
  const complaints = await Complaint.find(query).sort({ createdAt: -1 });
  res.json({ success: true, complaints });
});
app.post('/api/complaints', auth, async (req, res) => {
  try {
    const complaint = await Complaint.create({ userId: req.user._id, userName: req.user.name, message: req.body.message });
    res.json({ success: true, complaint });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
app.put('/api/complaints/:id/reply', auth, adminAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { reply: req.body.reply, status: 'replied' }, { new: true });
    res.json({ success: true, complaint });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Chat
app.get('/api/chat', auth, async (req, res) => {
  const messages = await Chat.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, messages: messages.reverse() });
});
app.post('/api/chat', auth, async (req, res) => {
  try {
    const msg = await Chat.create({ userId: req.user._id, userName: req.user.name, userPhoto: req.user.photoUrl, message: req.body.message });
    res.json({ success: true, message: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin
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

// ID Card PDF
app.get('/api/idcard/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: [204, 324], margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=scout-id.pdf`);
    doc.pipe(res);
    doc.rect(0, 0, 204, 324).fill('#f5f5f5');
    doc.rect(0, 0, 204, 45).fill('#1a472a');
    doc.fillColor('white').fontSize(7).font('Helvetica-Bold').text('BANGLADESH SCOUTS', 0, 6, { align: 'center', width: 204 });
    doc.fontSize(5.5).text('জিনজিরা পীর মোহাম্মদ পাইলট স্কুল এন্ড কলেজ স্কাউট গ্রুপ', 0, 18, { align: 'center', width: 204 });
    doc.fontSize(6).text('সদস্য পরিচয়পত্র / MEMBERSHIP CARD', 0, 32, { align: 'center', width: 204 });
    doc.rect(10, 52, 60, 75).fill('white').stroke('#1a472a');
    doc.fillColor('#999').fontSize(6).text('Photo', 30, 82);
    doc.fillColor('#1a472a').fontSize(7).font('Helvetica-Bold');
    const fields = [
      ['নাম', user.name], ['পিতা', user.fatherName], ['মাতা', user.motherName],
      ['রক্তের গ্রুপ', user.bloodGroup], ['র‍্যাংক', user.scoutRank],
      ['মোবাইল', user.phone], ['সদস্য নং', user.membershipNo]
    ];
    fields.forEach((f, i) => {
      doc.font('Helvetica-Bold').fillColor('#1a472a').fontSize(6).text(`${f[0]}:`, 78, 54 + i * 11);
      doc.font('Helvetica').fillColor('#333').text(f[1] || '-', 110, 54 + i * 11, { width: 84 });
    });
    doc.moveTo(10, 133).lineTo(194, 133).stroke('#1a472a');
    doc.fillColor('#333').fontSize(5.5).font('Helvetica').text(`ঠিকানা: ${user.permanentAddress || '-'}`, 10, 138, { width: 184 });
    doc.rect(77, 150, 50, 50).fill('white').stroke('#1a472a');
    doc.fillColor('#999').fontSize(5).text('QR Code', 88, 172);
    doc.fillColor('#666').fontSize(5).text(`ID: ${user._id}`, 10, 208, { width: 184, align: 'center' });
    doc.rect(0, 290, 204, 34).fill('#1a472a');
    doc.fillColor('white').fontSize(6).text('স্বাক্ষর: _______________', 10, 298);
    doc.text(`মেয়াদ: ডিসেম্বর ${new Date().getFullYear() + 1}`, 10, 310);
    doc.end();
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/', (req, res) => res.json({ message: 'জিনজিরা পীর মোহাম্মদ পাইলট স্কুল স্কাউট গ্রুপ - API Running' }));
app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
