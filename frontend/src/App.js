import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const styles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; }
.navbar { background: linear-gradient(135deg, #1a5276, #2e86c1); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; color: white; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
.navbar a { color: white; text-decoration: none; margin: 0 8px; font-size: 14px; }
.navbar .logo { font-size: 18px; font-weight: bold; }
.container { max-width: 900px; margin: 20px auto; padding: 0 15px; }
.card { background: white; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); }
.btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s; }
.btn-primary { background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; }
.btn-danger { background: #e74c3c; color: white; }
.btn-success { background: #27ae60; color: white; }
.btn:hover { opacity: 0.85; transform: translateY(-1px); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
input, textarea, select { width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; margin-bottom: 12px; transition: border 0.3s; }
input:focus, textarea:focus { outline: none; border-color: #2e86c1; }
.alert { padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; }
.alert-error { background: #fdecea; color: #c0392b; border: 1px solid #e74c3c; }
.alert-success { background: #eafaf1; color: #1e8449; border: 1px solid #27ae60; }
.hero { background: linear-gradient(135deg, #1a5276, #2e86c1); color: white; padding: 60px 20px; text-align: center; border-radius: 12px; margin-bottom: 20px; }
.hero h1 { font-size: 28px; margin-bottom: 10px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-pending { background: #fef9e7; color: #d68910; }
.badge-approved { background: #eafaf1; color: #1e8449; }
.badge-rejected { background: #fdecea; color: #c0392b; }
label { font-size: 13px; font-weight: 600; color: #555; margin-bottom: 4px; display: block; }
h2 { margin-bottom: 20px; color: #1a5276; }
h3 { margin-bottom: 15px; color: #2e86c1; }
.notice-item { border-left: 4px solid #2e86c1; padding: 12px 15px; margin-bottom: 12px; background: #f8f9fa; border-radius: 0 8px 8px 0; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #f8f9fa; font-weight: 600; color: #555; }
.otp-note { background: #e8f4fd; border: 1px solid #2e86c1; border-radius: 8px; padding: 10px; font-size: 13px; color: #1a5276; margin-bottom: 12px; }
`;

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('সব তথ্য দিন'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) { setError(err.response?.data?.message || 'লগইন ব্যর্থ'); }
    setLoading(false);
  };

  return (
    <div className="container" style={{maxWidth:400,marginTop:50}}>
      <div className="card">
        <h2>🎖️ লগইন</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <label>ইমেইল</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="আপনার ইমেইল" />
        <label>পাসওয়ার্ড</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="পাসওয়ার্ড" onKeyPress={e=>e.key==='Enter'&&handleLogin()} />
        <button className="btn btn-primary" style={{width:'100%'}} onClick={handleLogin} disabled={loading}>{loading ? 'লোড হচ্ছে...' : 'লগইন করুন'}</button>
        <p style={{textAlign:'center',marginTop:15,fontSize:14}}>অ্যাকাউন্ট নেই? <Link to="/register">রেজিস্টার</Link></p>
      </div>
    </div>
  );
}

function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    if (!email) { setError('ইমেইল দিন'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/auth/send-otp`, { email });
      setMsg('✅ OTP পাঠানো হয়েছে! ইমেইল চেক করুন।');
      setStep(2);
      setCountdown(60);
    } catch (err) { setError(err.response?.data?.message || 'OTP পাঠানো ব্যর্থ'); }
    setLoading(false);
  };

  const resendOtp = async () => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/auth/send-otp`, { email });
      setMsg('✅ নতুন OTP পাঠানো হয়েছে!');
      setCountdown(60);
    } catch (err) { setError('OTP পাঠানো ব্যর্থ'); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || !name || !password || !phone) { setError('সব তথ্য দিন'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API}/auth/register`, { email, otp, name, password, phone });
      setMsg('✅ অ্যাকাউন্ট তৈরি হয়েছে!');
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || 'যাচাইকরণ ব্যর্থ'); }
    setLoading(false);
  };

  return (
    <div className="container" style={{maxWidth:420,marginTop:50}}>
      <div className="card">
        <h2>🎖️ নতুন অ্যাকাউন্ট</h2>
        <div style={{display:'flex',marginBottom:20,gap:5}}>
          {[1,2,3].map(s=>(
            <div key={s} style={{flex:1,height:4,borderRadius:2,background:step>=s?'#2e86c1':'#e0e0e0'}} />
          ))}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}

        {step===1 && <>
          <label>ইমেইল ঠিকানা *</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@gmail.com" />
          <button className="btn btn-primary" style={{width:'100%'}} onClick={sendOtp} disabled={loading}>
            {loading ? 'পাঠানো হচ্ছে...' : '📧 OTP পাঠান'}
          </button>
        </>}

        {step===2 && <>
          <div className="otp-note">
            📧 <strong>{email}</strong> এ OTP পাঠানো হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন।
          </div>
          <label>পূর্ণ নাম *</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="আপনার পূর্ণ নাম" />
          <label>মোবাইল নম্বর *</label>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
          <label>OTP কোড *</label>
          <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="৬ সংখ্যার OTP" maxLength={6} style={{letterSpacing:8,fontSize:20,textAlign:'center'}} />
          <div style={{textAlign:'right',marginBottom:12}}>
            {countdown > 0 ? <span style={{fontSize:13,color:'#999'}}>{countdown}s পরে আবার পাঠান</span> :
            <button onClick={resendOtp} style={{background:'none',border:'none',color:'#2e86c1',cursor:'pointer',fontSize:13}} disabled={loading}>🔄 আবার OTP পাঠান</button>}
          </div>
          <label>পাসওয়ার্ড *</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" />
          <button className="btn btn-primary" style={{width:'100%'}} onClick={verifyOtp} disabled={loading}>
            {loading ? 'যাচাই হচ্ছে...' : '✅ অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </>}

        {step===3 && <>
          <div style={{textAlign:'center',padding:20}}>
            <div style={{fontSize:60}}>🎉</div>
            <h3>অ্যাকাউন্ট তৈরি হয়েছে!</h3>
            <p style={{color:'#666',marginBottom:20}}>এখন লগইন করুন।</p>
            <Link to="/login"><button className="btn btn-success" style={{width:'100%'}}>লগইন করুন</button></Link>
          </div>
        </>}
        <p style={{textAlign:'center',marginTop:15,fontSize:14}}>অ্যাকাউন্ট আছে? <Link to="/login">লগইন</Link></p>
      </div>
    </div>
  );
}

function Home() {
  const [notices, setNotices] = useState([]);
  useEffect(() => { axios.get(`${API}/notices`).then(r=>setNotices(r.data.notices||[])).catch(()=>{}); }, []);
  return (
    <div className="container">
      <div className="hero">
        <h1>🎖️ স্কাউট সার্ভিস পোর্টাল</h1>
        <p>বাংলাদেশ স্কাউটস - ডিজিটাল সদস্য ব্যবস্থাপনা</p>
        <div style={{marginTop:20}}>
          <Link to="/register"><button className="btn" style={{background:'white',color:'#1a5276',marginRight:10}}>রেজিস্টার করুন</button></Link>
          <Link to="/login"><button className="btn" style={{background:'transparent',border:'2px solid white',color:'white'}}>লগইন করুন</button></Link>
        </div>
      </div>
      <div className="grid">
        <div className="card" style={{textAlign:'center'}}><div style={{fontSize:40}}>🆔</div><h3>ডিজিটাল আইডি কার্ড</h3><p style={{fontSize:13,color:'#666'}}>PDF ফরম্যাটে ডাউনলোড</p></div>
        <div className="card" style={{textAlign:'center'}}><div style={{fontSize:40}}>👤</div><h3>প্রোফাইল ম্যানেজমেন্ট</h3><p style={{fontSize:13,color:'#666'}}>তথ্য আপডেট করুন</p></div>
        <div className="card" style={{textAlign:'center'}}><div style={{fontSize:40}}>📢</div><h3>নোটিস বোর্ড</h3><p style={{fontSize:13,color:'#666'}}>সর্বশেষ ঘোষণা</p></div>
      </div>
      <div className="card">
        <h2>📢 সর্বশেষ নোটিস</h2>
        {notices.length===0 && <p style={{color:'#999',fontSize:14}}>কোনো নোটিস নেই।</p>}
        {notices.map(n=>(
          <div key={n._id} className="notice-item">
            <strong>{n.title}</strong>
            <p style={{fontSize:13,color:'#555',marginTop:5}}>{n.content}</p>
            <small style={{color:'#999'}}>{new Date(n.createdAt).toLocaleDateString('bn-BD')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const [profile, setProfile] = useState({});
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');
  useEffect(() => {
    axios.get(`${API}/user/profile`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>setProfile(r.data.user||{})).catch(()=>{});
  }, []);
  const save = async () => {
    try {
      await axios.post(`${API}/user/profile`,profile,{headers:{Authorization:`Bearer ${token}`}});
      setMsg('✅ সংরক্ষিত হয়েছে!'); setTimeout(()=>setMsg(''),3000);
    } catch(err) { setMsg('❌ সংরক্ষণ ব্যর্থ'); }
  };
  const downloadId = () => window.open(`${API}/idcard/${profile._id}?token=${token}`,'_blank');
  const fields = [
    {key:'name',label:'পূর্ণ নাম'},{key:'phone',label:'মোবাইল নম্বর'},
    {key:'dateOfBirth',label:'জন্ম তারিখ',type:'date'},{key:'bloodGroup',label:'রক্তের গ্রুপ'},
    {key:'scoutRank',label:'স্কাউট র‍্যাংক'},{key:'schoolName',label:'স্কুল/প্রতিষ্ঠান'},
    {key:'nidNumber',label:'NID/জন্ম নিবন্ধন'},{key:'address',label:'ঠিকানা'},
  ];
  return (
    <div className="container">
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <div><h2 style={{marginBottom:4}}>👤 আমার ড্যাশবোর্ড</h2><p style={{fontSize:13,color:'#666'}}>{profile.email}</p></div>
          <span className={`badge badge-${profile.status||'pending'}`}>
            {profile.status==='approved'?'✅ অনুমোদিত':profile.status==='rejected'?'❌ প্রত্যাখ্যাত':'⏳ অপেক্ষমাণ'}
          </span>
        </div>
      </div>
      {msg && <div className={`alert ${msg.includes('✅')?'alert-success':'alert-error'}`}>{msg}</div>}
      <div className="card">
        <h3>✏️ প্রোফাইল সম্পাদনা</h3>
        <div className="grid">
          {fields.map(f=>(
            <div key={f.key}>
              <label>{f.label}</label>
              <input type={f.type||'text'} value={profile[f.key]||''} onChange={e=>setProfile({...profile,[f.key]:e.target.value})} />
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={save}>💾 সংরক্ষণ করুন</button>
          {profile.status==='approved' && <button className="btn btn-success" onClick={downloadId}>🆔 আইডি কার্ড ডাউনলোড</button>}
        </div>
      </div>
    </div>
  );
}

function Admin() {
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('token');
  const headers = {Authorization:`Bearer ${token}`};
  useEffect(() => {
    axios.get(`${API}/admin/users`,{headers}).then(r=>setUsers(r.data.users||[])).catch(()=>{});
    axios.get(`${API}/notices`).then(r=>setNotices(r.data.notices||[])).catch(()=>{});
  }, []);
  const updateUser = async (id,data) => {
    await axios.put(`${API}/admin/users/${id}`,data,{headers});
    setUsers(users.map(u=>u._id===id?{...u,...data}:u));
  };
  const addNotice = async () => {
    if(!title||!content) return;
    const res = await axios.post(`${API}/notices`,{title,content},{headers});
    setNotices([res.data.notice,...notices]); setTitle(''); setContent('');
  };
  const deleteNotice = async (id) => {
    await axios.delete(`${API}/notices/${id}`,{headers});
    setNotices(notices.filter(n=>n._id!==id));
  };
  const filteredUsers = users.filter(u=>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );
  return (
    <div className="container">
      <div className="card">
        <h2>⚙️ অ্যাডমিন প্যানেল</h2>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className={`btn ${tab==='users'?'btn-primary':''}`} onClick={()=>setTab('users')}>👥 ব্যবহারকারী ({users.length})</button>
          <button className={`btn ${tab==='notices'?'btn-primary':''}`} onClick={()=>setTab('notices')}>📢 নোটিস</button>
        </div>
      </div>
      {tab==='users' && (
        <div className="card">
          <h3>👥 সকল ব্যবহারকারী</h3>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..." />
          <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>নাম</th><th>ইমেইল</th><th>মোবাইল</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr></thead>
              <tbody>
                {filteredUsers.map(u=>(
                  <tr key={u._id}>
                    <td>{u.name||'N/A'}</td>
                    <td style={{fontSize:12}}>{u.email}</td>
                    <td style={{fontSize:12}}>{u.phone||'N/A'}</td>
                    <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                    <td>
                      {u.status!=='approved'&&<button className="btn btn-success" style={{padding:'4px 8px',fontSize:12,marginRight:5}} onClick={()=>updateUser(u._id,{status:'approved'})}>✅</button>}
                      {u.status!=='rejected'&&<button className="btn btn-danger" style={{padding:'4px 8px',fontSize:12}} onClick={()=>updateUser(u._id,{status:'rejected'})}>❌</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab==='notices' && (
        <div className="card">
          <h3>📢 নোটিস যোগ করুন</h3>
          <label>শিরোনাম</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="নোটিসের শিরোনাম" />
          <label>বিষয়বস্তু</label>
          <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} placeholder="নোটিসের বিষয়বস্তু" />
          <button className="btn btn-primary" onClick={addNotice}>📢 প্রকাশ করুন</button>
          <hr style={{margin:'20px 0'}} />
          {notices.map(n=>(
            <div key={n._id} className="notice-item" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><strong>{n.title}</strong><p style={{fontSize:13,marginTop:5}}>{n.content}</p></div>
              <button className="btn btn-danger" style={{padding:'4px 8px',fontSize:12,marginLeft:10}} onClick={()=>deleteNotice(n._id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(()=>{ try{return JSON.parse(localStorage.getItem('user'));}catch{return null;} });
  const logout = () => { localStorage.clear(); setUser(null); };
  return (
    <BrowserRouter>
      <style>{styles}</style>
      <nav className="navbar">
        <Link to="/" className="logo">🎖️ স্কাউট পোর্টাল</Link>
        <div style={{display:'flex',alignItems:'center',flexWrap:'wrap'}}>
          <Link to="/">হোম</Link>
          {!user&&<><Link to="/login">লগইন</Link><Link to="/register">রেজিস্টার</Link></>}
          {user&&<><Link to="/dashboard">ড্যাশবোর্ড</Link>{user.role==='admin'&&<Link to="/admin">অ্যাডমিন</Link>}<button onClick={logout} style={{background:'transparent',border:'1px solid white',color:'white',padding:'4px 10px',borderRadius:6,cursor:'pointer',marginLeft:8,fontSize:13}}>লগআউট</button></>}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={user?<Navigate to="/dashboard"/>:<Login setUser={setUser}/>} />
        <Route path="/register" element={user?<Navigate to="/dashboard"/>:<Register/>} />
        <Route path="/dashboard" element={user?<Dashboard/>:<Navigate to="/login"/>} />
        <Route path="/admin" element={user?.role==='admin'?<Admin/>:<Navigate to="/"/>} />
      </Routes>
    </BrowserRouter>
  );
                                                                                                                           }                
