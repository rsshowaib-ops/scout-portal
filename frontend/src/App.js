import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SCHOOL = 'জিনজিরা পীর মোহাম্মদ পাইলট স্কুল এন্ড কলেজ স্কাউট গ্রুপ';
const FB_LINK = 'https://www.facebook.com/share/18jFvjErxH/';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Hind Siliguri', sans-serif; background: #f4f6f9; color: #2c3e50; }
a { text-decoration: none; color: inherit; }

.topbar { background: #1a472a; color: white; padding: 6px 20px; font-size: 12px; display: flex; justify-content: space-between; }
.navbar { background: white; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
.navbar .brand { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.navbar .brand-text h1 { font-size: 14px; font-weight: 700; color: #1a472a; line-height: 1.2; }
.navbar .brand-text p { font-size: 11px; color: #666; }
.navbar .logo-circle { width: 45px; height: 45px; background: #1a472a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; }
.nav-links { display: flex; gap: 5px; align-items: center; }
.nav-links a, .nav-links button { padding: 8px 14px; border-radius: 4px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; background: transparent; color: #333; font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s; }
.nav-links a:hover, .nav-links button:hover { background: #f0f0f0; color: #1a472a; }
.nav-links .btn-logout { background: #e74c3c; color: white; }
.nav-links .btn-logout:hover { background: #c0392b; }

.hero { background: linear-gradient(135deg, #1a472a 0%, #2e7d4f 50%, #1a5276 100%); color: white; padding: 60px 20px; text-align: center; }
.hero h1 { font-size: 26px; font-weight: 700; margin-bottom: 10px; }
.hero p { font-size: 15px; opacity: 0.9; margin-bottom: 30px; }
.hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn { padding: 10px 24px; border-radius: 5px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; font-family: 'Hind Siliguri', sans-serif; }
.btn-primary { background: #1a472a; color: white; }
.btn-primary:hover { background: #0f2d1a; }
.btn-white { background: white; color: #1a472a; }
.btn-white:hover { background: #f0f0f0; }
.btn-outline { background: transparent; color: white; border: 2px solid white; }
.btn-outline:hover { background: white; color: #1a472a; }
.btn-success { background: #27ae60; color: white; }
.btn-success:hover { background: #1e8449; }
.btn-danger { background: #e74c3c; color: white; }
.btn-danger:hover { background: #c0392b; }
.btn-sm { padding: 6px 14px; font-size: 12px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 30px 0; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }

.card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1px solid #eee; }
.card-header { background: #1a472a; color: white; padding: 14px 20px; border-radius: 8px 8px 0 0; margin: -24px -24px 20px -24px; }
.card-header h3 { font-size: 15px; font-weight: 600; }

.feature-card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-top: 4px solid #1a472a; text-align: center; transition: transform 0.2s; }
.feature-card:hover { transform: translateY(-4px); }
.feature-card .icon { width: 56px; height: 56px; background: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.feature-card .icon svg { width: 28px; height: 28px; color: #1a472a; fill: #1a472a; }
.feature-card h3 { font-size: 15px; font-weight: 600; color: #1a472a; margin-bottom: 6px; }
.feature-card p { font-size: 13px; color: #666; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #ddd; border-radius: 5px; font-size: 14px; font-family: 'Hind Siliguri', sans-serif; transition: border 0.2s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #1a472a; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.alert { padding: 12px 16px; border-radius: 5px; margin-bottom: 16px; font-size: 14px; }
.alert-error { background: #fdecea; color: #c0392b; border-left: 4px solid #e74c3c; }
.alert-success { background: #eafaf1; color: #1e8449; border-left: 4px solid #27ae60; }
.alert-info { background: #ebf5fb; color: #1a5276; border-left: 4px solid #2e86c1; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-pending { background: #fef9e7; color: #d68910; border: 1px solid #f39c12; }
.badge-approved { background: #eafaf1; color: #1e8449; border: 1px solid #27ae60; }
.badge-rejected { background: #fdecea; color: #c0392b; border: 1px solid #e74c3c; }

table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #dee2e6; }
td { padding: 11px 12px; border-bottom: 1px solid #eee; color: #444; }
tr:hover td { background: #f8f9fa; }

.notice-item { padding: 16px; border-left: 4px solid #1a472a; background: #f9f9f9; margin-bottom: 12px; border-radius: 0 6px 6px 0; }
.notice-item h4 { font-size: 14px; font-weight: 600; color: #1a472a; margin-bottom: 4px; }
.notice-item p { font-size: 13px; color: #555; }
.notice-item small { font-size: 11px; color: #999; }

.profile-header { background: linear-gradient(135deg, #1a472a, #2e7d4f); color: white; padding: 30px; border-radius: 8px; display: flex; gap: 24px; align-items: center; margin-bottom: 24px; }
.profile-avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid white; object-fit: cover; background: #ccc; }
.profile-avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; border: 3px solid white; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; }
.profile-info h2 { font-size: 22px; font-weight: 700; }
.profile-info p { font-size: 13px; opacity: 0.85; margin-top: 4px; }

.stat-card { background: white; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-left: 4px solid #1a472a; }
.stat-card h3 { font-size: 28px; font-weight: 700; color: #1a472a; }
.stat-card p { font-size: 13px; color: #666; }

.chat-container { height: 400px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; padding: 16px; background: #f9f9f9; margin-bottom: 12px; }
.chat-msg { margin-bottom: 12px; }
.chat-msg .msg-header { font-size: 12px; font-weight: 600; color: #1a472a; margin-bottom: 3px; }
.chat-msg .msg-body { background: white; padding: 8px 12px; border-radius: 6px; font-size: 13px; display: inline-block; max-width: 80%; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.chat-msg.own .msg-body { background: #1a472a; color: white; }
.chat-msg.own { text-align: right; }
.chat-input { display: flex; gap: 8px; }
.chat-input input { flex: 1; padding: 10px 14px; border: 1.5px solid #ddd; border-radius: 5px; font-size: 14px; font-family: 'Hind Siliguri', sans-serif; }

.study-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1px solid #eee; }
.study-card img { width: 100%; height: 160px; object-fit: cover; }
.study-card .study-body { padding: 16px; }
.study-card h4 { font-size: 15px; font-weight: 600; color: #1a472a; margin-bottom: 8px; }
.study-card p { font-size: 13px; color: #555; line-height: 1.6; }

.complaint-item { background: white; border-radius: 6px; padding: 16px; margin-bottom: 12px; border: 1px solid #eee; }
.complaint-item .c-question { font-size: 14px; color: #333; margin-bottom: 8px; }
.complaint-item .c-reply { background: #eafaf1; padding: 10px; border-radius: 5px; font-size: 13px; color: #1e8449; border-left: 3px solid #27ae60; }

.footer { background: #1a472a; color: white; padding: 40px 20px 20px; margin-top: 60px; }
.footer-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; margin-bottom: 30px; }
.footer h4 { font-size: 14px; font-weight: 700; margin-bottom: 12px; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 8px; }
.footer p, .footer a { font-size: 13px; opacity: 0.8; display: block; margin-bottom: 6px; color: white; }
.footer a:hover { opacity: 1; }
.footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.7; max-width: 1100px; margin: 0 auto; }

.page-title { font-size: 22px; font-weight: 700; color: #1a472a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #1a472a; }
.section-title { font-size: 18px; font-weight: 700; color: #1a472a; margin-bottom: 16px; }

.photo-upload { border: 2px dashed #1a472a; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; }
.photo-upload:hover { background: #f0f7f0; }
.photo-preview { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto 10px; display: block; border: 3px solid #1a472a; }

.tab-nav { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #eee; }
.tab-btn { padding: 10px 18px; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #666; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s; }
.tab-btn.active { color: #1a472a; border-bottom-color: #1a472a; }
`;

// Helper
const toBase64 = file => new Promise((res, rej) => {
  const reader = new FileReader();
  reader.onload = () => res(reader.result);
  reader.onerror = rej;
  reader.readAsDataURL(file);
});

// Navbar
function Navbar({ user, setUser }) {
  const logout = () => { localStorage.clear(); setUser(null); };
  return (
    <>
      <div className="topbar">
        <span>বাংলাদেশ স্কাউটস - জিনজিরা গ্রুপ</span>
        <a href={FB_LINK} target="_blank" rel="noreferrer">Facebook পেজ</a>
      </div>
      <nav className="navbar">
        <Link to="/" className="brand">
          <div className="logo-circle">স</div>
          <div className="brand-text">
            <h1>জিনজিরা পীর মোহাম্মদ পাইলট স্কুল</h1>
            <p>স্কাউট গ্রুপ - বাংলাদেশ স্কাউটস</p>
          </div>
        </Link>
        <div className="nav-links">
          <Link to="/">হোম</Link>
          <Link to="/notices">নোটিস</Link>
          <Link to="/study">পড়ালেখা</Link>
          {!user && <><Link to="/login">লগইন</Link><Link to="/register" style={{background:'#1a472a',color:'white',padding:'8px 14px',borderRadius:4}}>নিবন্ধন</Link></>}
          {user && <>
            <Link to="/dashboard">ড্যাশবোর্ড</Link>
            <Link to="/chat">চ্যাট</Link>
            <Link to="/complaint">মতামত</Link>
            {user.role === 'admin' && <Link to="/admin">অ্যাডমিন</Link>}
            <button className="btn-logout" onClick={logout}>লগআউট</button>
          </>}
        </div>
      </nav>
    </>
  );
}

// Home
function Home() {
  const [notices, setNotices] = useState([]);
  useEffect(() => { axios.get(`${API}/notices`).then(r => setNotices(r.data.notices?.slice(0, 3) || [])).catch(() => {}); }, []);
  return (
    <div>
      <div className="hero">
        <h1>{SCHOOL}</h1>
        <p>বাংলাদেশ স্কাউটস - ডিজিটাল সদস্য ব্যবস্থাপনা পোর্টাল</p>
        <div className="hero-btns">
          <Link to="/register"><button className="btn btn-white">সদস্য নিবন্ধন</button></Link>
          <Link to="/login"><button className="btn btn-outline">লগইন</button></Link>
          <a href={FB_LINK} target="_blank" rel="noreferrer"><button className="btn btn-outline">Facebook গ্রুপ</button></a>
        </div>
      </div>
      <div className="container">
        <div className="grid-3">
          {[
            { title: 'ডিজিটাল আইডি কার্ড', desc: 'QR কোডসহ পরিচয়পত্র ডাউনলোড করুন' },
            { title: 'অনলাইন প্রোফাইল', desc: 'সদস্যের সম্পূর্ণ তথ্য একজায়গায়' },
            { title: 'পড়ালেখার উপকরণ', desc: 'স্কাউট প্রশিক্ষণের পাঠ্যসামগ্রী' },
            { title: 'নোটিস বোর্ড', desc: 'সর্বশেষ ঘোষণা ও তথ্য' },
            { title: 'অভিযোগ ও মতামত', desc: 'আপনার মতামত জানান' },
            { title: 'গ্রুপ চ্যাট', desc: 'সদস্যদের সাথে যোগাযোগ করুন' },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><h3>সর্বশেষ নোটিস</h3></div>
          {notices.length === 0 && <p style={{color:'#999',fontSize:14}}>কোনো নোটিস নেই।</p>}
          {notices.map(n => (
            <div key={n._id} className="notice-item">
              <h4>{n.title}</h4>
              <p>{n.content}</p>
              <small>{new Date(n.createdAt).toLocaleDateString('bn-BD')}</small>
            </div>
          ))}
          {notices.length > 0 && <Link to="/notices"><button className="btn btn-primary btn-sm" style={{marginTop:12}}>সকল নোটিস দেখুন</button></Link>}
        </div>
      </div>
    </div>
  );
}

// Register
function Register() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', fatherName:'', motherName:'', bloodGroup:'', scoutRank:'', dateOfBirth:'', nidNumber:'', permanentAddress:'', currentAddress:'', photoUrl:'' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setPreview(b64);
    setForm({ ...form, photoUrl: b64 });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) { setError('নাম, ইমেইল, ফোন ও পাসওয়ার্ড আবশ্যক'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/auth/register`, form);
      setMsg('নিবন্ধন সফল হয়েছে! অ্যাডমিন অনুমোদনের পর আপনার অ্যাকাউন্ট সক্রিয় হবে।');
    } catch (err) { setError(err.response?.data?.message || 'নিবন্ধন ব্যর্থ'); }
    setLoading(false);
  };

  if (msg) return (
    <div className="container" style={{maxWidth:500,marginTop:50}}>
      <div className="card">
        <div className="alert alert-success">{msg}</div>
        <Link to="/login"><button className="btn btn-primary" style={{width:'100%'}}>লগইন পেজে যান</button></Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{maxWidth:700,marginTop:30}}>
      <div className="card">
        <div className="card-header"><h3>নতুন সদস্য নিবন্ধন</h3></div>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{textAlign:'center',marginBottom:20}}>
          {preview ? <img src={preview} className="photo-preview" alt="preview" /> : null}
          <div className="photo-upload" onClick={() => document.getElementById('photo-input').click()}>
            <p style={{fontSize:13,color:'#1a472a',fontWeight:600}}>ছবি আপলোড করুন (ক্লিক করুন)</p>
            <p style={{fontSize:11,color:'#999'}}>JPG, PNG - সর্বোচ্চ 2MB</p>
          </div>
          <input id="photo-input" type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto} />
        </div>
        <div className="form-row">
          <div className="form-group"><label>পূর্ণ নাম *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="আপনার পূর্ণ নাম" /></div>
          <div className="form-group"><label>ইমেইল *</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="example@gmail.com" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>মোবাইল নম্বর *</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="01XXXXXXXXX" /></div>
          <div className="form-group"><label>পাসওয়ার্ড *</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="কমপক্ষে ৬ অক্ষর" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>পিতার নাম</label><input value={form.fatherName} onChange={e=>setForm({...form,fatherName:e.target.value})} placeholder="পিতার নাম" /></div>
          <div className="form-group"><label>মাতার নাম</label><input value={form.motherName} onChange={e=>setForm({...form,motherName:e.target.value})} placeholder="মাতার নাম" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>জন্ম তারিখ</label><input type="date" value={form.dateOfBirth} onChange={e=>setForm({...form,dateOfBirth:e.target.value})} /></div>
          <div className="form-group"><label>রক্তের গ্রুপ</label>
            <select value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>
              <option value="">নির্বাচন করুন</option>
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>স্কাউট র‍্যাংক</label>
            <select value={form.scoutRank} onChange={e=>setForm({...form,scoutRank:e.target.value})}>
              <option value="">নির্বাচন করুন</option>
              {['কাব স্কাউট','স্কাউট','রোভার স্কাউট'].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group"><label>NID / জন্ম নিবন্ধন নম্বর</label><input value={form.nidNumber} onChange={e=>setForm({...form,nidNumber:e.target.value})} placeholder="নম্বর লিখুন" /></div>
        </div>
        <div className="form-group"><label>স্থায়ী ঠিকানা</label><input value={form.permanentAddress} onChange={e=>setForm({...form,permanentAddress:e.target.value})} placeholder="গ্রাম/এলাকা, উপজেলা, জেলা" /></div>
        <div className="form-group"><label>বর্তমান ঠিকানা</label><input value={form.currentAddress} onChange={e=>setForm({...form,currentAddress:e.target.value})} placeholder="বর্তমান ঠিকানা" /></div>
        <button className="btn btn-primary" style={{width:'100%',padding:12}} onClick={handleSubmit} disabled={loading}>
          {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
        </button>
        <p style={{textAlign:'center',marginTop:16,fontSize:13}}>ইতোমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" style={{color:'#1a472a',fontWeight:600}}>লগইন করুন</Link></p>
      </div>
    </div>
  );
}

// Login
function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin =
