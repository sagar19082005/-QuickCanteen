import { useState, useEffect, useRef } from "react";

// ─── Google Font ───────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
document.head.appendChild(fontLink);

// ─── CSS ───────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0C0D0F;
    --surface: #141518;
    --surface2: #1C1E24;
    --border: #2A2D35;
    --accent: #FF5C00;
    --accent2: #FFB347;
    --green: #22C55E;
    --red: #EF4444;
    --yellow: #EAB308;
    --blue: #3B82F6;
    --text: #F0F0F0;
    --muted: #6B7280;
    --card-r: 16px;
  }
  body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
  button { cursor: pointer; font-family: inherit; }
  input, select, textarea { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes pop { 0% { transform:scale(0.85); opacity:0; } 100% { transform:scale(1); opacity:1; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  .fade-up { animation: fadeUp 0.4s ease both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
  .pop { animation: pop 0.25s ease both; }

  .btn-primary {
    background: var(--accent); color: #fff; border: none;
    padding: 12px 26px; border-radius: 10px; font-weight: 600;
    font-family: 'Syne', sans-serif; font-size: 14px; letter-spacing: .5px;
    transition: all .2s; box-shadow: 0 4px 20px #FF5C0044;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px #FF5C0066; background: #FF6D1A; }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary {
    background: var(--surface2); color: var(--text); border: 1px solid var(--border);
    padding: 11px 22px; border-radius: 10px; font-weight: 500; font-size: 14px;
    transition: all .2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background:#EF444422; color: var(--red); border: 1px solid #EF444444; padding: 8px 16px; border-radius:8px; font-size:13px; transition:all .2s; }
  .btn-danger:hover { background:#EF444433; }

  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--card-r);
    transition: border-color .2s, box-shadow .2s;
  }
  .card:hover { border-color: #3A3D47; box-shadow: 0 8px 32px #00000066; }

  .input {
    background: var(--surface2); border: 1.5px solid var(--border); color: var(--text);
    padding: 11px 14px; border-radius: 10px; font-size: 14px; width: 100%;
    transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px #FF5C0022; }
  .input::placeholder { color: var(--muted); }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
    letter-spacing: .4px; text-transform: uppercase;
  }
  .badge-pending { background:#EAB30822; color:var(--yellow); border:1px solid #EAB30844; }
  .badge-confirmed { background:#3B82F622; color:var(--blue); border:1px solid #3B82F644; }
  .badge-preparing { background:#FF5C0022; color:var(--accent); border:1px solid #FF5C0044; }
  .badge-ready { background:#22C55E22; color:var(--green); border:1px solid #22C55E44; }
  .badge-completed { background:#6B728022; color:var(--muted); border:1px solid #6B728044; }
  .badge-cancelled { background:#EF444422; color:var(--red); border:1px solid #EF444444; }

  .tag-veg { background:#22C55E22; color:#22C55E; border:1px solid #22C55E44; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:700; }
  .tag-nonveg { background:#EF444422; color:#EF4444; border:1px solid #EF444444; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:700; }

  .tab-bar { display:flex; gap:4px; background:var(--surface2); padding:5px; border-radius:12px; border:1px solid var(--border); }
  .tab { padding:8px 18px; border-radius:9px; border:none; background:transparent; color:var(--muted); font-weight:600; font-size:13px; transition:all .2s; }
  .tab.active { background:var(--accent); color:#fff; box-shadow:0 2px 12px #FF5C0044; }
  .tab:hover:not(.active) { color:var(--text); background:var(--surface); }

  .nav { position:sticky; top:0; z-index:100; background:#0C0D0Fee; backdrop-filter:blur(12px); border-bottom:1px solid var(--border); }
  .toast {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background:var(--surface2); border:1px solid var(--border); border-radius:12px;
    padding:14px 20px; font-size:14px; box-shadow:0 8px 32px #00000088;
    animation: slideIn 0.3s ease;
    display:flex; align-items:center; gap:10px; max-width:320px;
  }
  .modal-overlay {
    position:fixed; inset:0; background:#00000099; z-index:200;
    display:flex; align-items:center; justify-content:center;
    animation: fadeIn .2s ease;
  }
  .modal {
    background:var(--surface); border:1px solid var(--border); border-radius:20px;
    padding:32px; width:min(480px,90vw); max-height:85vh; overflow-y:auto;
    animation: pop .25s ease;
  }
  .qty-btn {
    width:30px; height:30px; border-radius:8px; border:1px solid var(--border);
    background:var(--surface2); color:var(--text); font-size:16px; font-weight:700;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .qty-btn:hover { background:var(--accent); border-color:var(--accent); }

  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--card-r); padding:22px; }
  .progress-bar { height:6px; background:var(--surface2); border-radius:3px; overflow:hidden; margin-top:6px; }
  .progress-fill { height:100%; border-radius:3px; transition:width .5s ease; }

  .food-img {
    width:100%; height:160px; object-fit:cover; border-radius:12px;
    background: linear-gradient(135deg, #1C1E24 0%, #2A2D35 100%);
    display:flex; align-items:center; justify-content:center; font-size:52px;
  }

  .sidebar { width:240px; background:var(--surface); border-right:1px solid var(--border); height:100vh; position:sticky; top:0; flex-shrink:0; }
  .sidebar-item {
    display:flex; align-items:center; gap:12px; padding:13px 20px;
    color:var(--muted); font-weight:500; font-size:14px; cursor:pointer;
    border-left:3px solid transparent; transition:all .18s;
  }
  .sidebar-item.active { color:var(--accent); background:#FF5C0011; border-left-color:var(--accent); }
  .sidebar-item:hover:not(.active) { color:var(--text); background:var(--surface2); }

  .order-row { background:var(--surface2); border-radius:12px; padding:16px 20px; border:1px solid var(--border); transition:border-color .2s; }
  .order-row:hover { border-color: var(--accent)44; }

  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:10px 14px; color:var(--muted); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.8px; border-bottom:1px solid var(--border); }
  td { padding:13px 14px; font-size:14px; border-bottom:1px solid var(--border)88; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#ffffff04; }

  .hero-bg {
    background: radial-gradient(ellipse 80% 60% at 50% -10%, #FF5C0022 0%, transparent 70%),
                linear-gradient(180deg, #141518 0%, #0C0D0F 100%);
  }

  select.input option { background: var(--surface2); }
`;
const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

// ─── DATA ──────────────────────────────────────────────────
const MENU = [
  { id:1, name:"Idli Sambar", category:"Breakfast", price:20, qty:100, veg:true, emoji:"🍛", prep:5, rating:4.5, desc:"Soft steamed idlis with spiced sambar & chutneys" },
  { id:2, name:"Poha", category:"Breakfast", price:25, qty:80, veg:true, emoji:"🍚", prep:7, rating:4.2, desc:"Flattened rice with onions, mustard seeds & coriander" },
  { id:3, name:"Masala Dosa", category:"Breakfast", price:35, qty:60, veg:true, emoji:"🫓", prep:10, rating:4.8, desc:"Crispy dosa filled with spiced potato masala" },
  { id:4, name:"Veg Thali", category:"Lunch", price:60, qty:50, veg:true, emoji:"🍱", prep:15, rating:4.6, desc:"Complete meal: rice, dal, sabzi, roti, pickle & papad" },
  { id:5, name:"Chicken Curry Rice", category:"Lunch", price:80, qty:40, veg:false, emoji:"🍗", prep:20, rating:4.7, desc:"Spiced chicken curry served over steamed basmati rice" },
  { id:6, name:"Paneer Butter Masala + Roti", category:"Lunch", price:70, qty:45, veg:true, emoji:"🧆", prep:18, rating:4.5, desc:"Creamy paneer in tomato-butter gravy with 2 rotis" },
  { id:7, name:"Samosa", category:"Snacks", price:10, qty:200, veg:true, emoji:"🥟", prep:3, rating:4.3, desc:"Crispy pastry filled with spiced potato & peas" },
  { id:8, name:"Bread Omelette", category:"Snacks", price:30, qty:60, veg:false, emoji:"🍳", prep:5, rating:4.1, desc:"Fluffy egg omelette with toast, veggies & cheese" },
  { id:9, name:"Veg Sandwich", category:"Snacks", price:25, qty:90, veg:true, emoji:"🥪", prep:5, rating:4.0, desc:"Grilled sandwich with cucumber, tomato & mint chutney" },
  { id:10, name:"Tea", category:"Beverages", price:8, qty:300, veg:true, emoji:"☕", prep:2, rating:4.4, desc:"Masala chai brewed with ginger, cardamom & milk" },
  { id:11, name:"Cold Coffee", category:"Beverages", price:35, qty:100, veg:true, emoji:"🧋", prep:5, rating:4.6, desc:"Blended cold coffee with milk, sugar & ice" },
  { id:12, name:"Lassi", category:"Beverages", price:25, qty:120, veg:true, emoji:"🥛", prep:3, rating:4.5, desc:"Sweet chilled yogurt drink, plain or with rose" },
];

const CATEGORIES = ["All", "Breakfast", "Lunch", "Snacks", "Beverages"];

const STATUS_FLOW = ["PENDING","CONFIRMED","PREPARING","READY","COMPLETED"];
const STATUS_META = {
  PENDING:   { label:"Pending",   cls:"badge-pending",   icon:"⏳" },
  CONFIRMED: { label:"Confirmed", cls:"badge-confirmed", icon:"✅" },
  PREPARING: { label:"Preparing", cls:"badge-preparing", icon:"🍳" },
  READY:     { label:"Ready",     cls:"badge-ready",     icon:"🔔" },
  COMPLETED: { label:"Completed", cls:"badge-completed", icon:"✔" },
  CANCELLED: { label:"Cancelled", cls:"badge-cancelled", icon:"✖" },
};

let ORDER_ID = 1001;
const genId = () => ORDER_ID++;
const now = () => new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const today = () => new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});

// ─── HELPERS ───────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return ()=>clearTimeout(t); }, []);
  const icons = { success:"✅", error:"❌", info:"ℹ️", warning:"⚠️" };
  return (
    <div className="toast">
      <span style={{fontSize:18}}>{icons[type]||"ℹ️"}</span>
      <span>{msg}</span>
      <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",color:"var(--muted)",fontSize:18,lineHeight:1}}>×</button>
    </div>
  );
}

function Badge({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return <span className={`badge ${m.cls}`}>{m.icon} {m.label}</span>;
}

function StarRating({ rating }) {
  return (
    <span style={{fontSize:12, color:"#EAB308"}}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5-Math.round(rating))}
      <span style={{color:"var(--muted)",marginLeft:4}}>{rating}</span>
    </span>
  );
}

// ─── FIELD — must be top-level so React never remounts on re-render ──
function Field({ label, fieldKey, type="text", placeholder, icon, value, onChange, error, showPass, onTogglePass }) {
  return (
    <div>
      <label style={{fontSize:11,color:"var(--muted)",fontWeight:700,marginBottom:6,display:"block",letterSpacing:.8}}>{label}</label>
      <div style={{position:"relative"}}>
        {icon && <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none"}}>{icon}</span>}
        <input
          className="input"
          type={type==="password" ? (showPass?"text":"password") : type}
          placeholder={placeholder}
          value={value}
          onChange={e=>onChange(e.target.value)}
          style={{paddingLeft: icon?"38px":"14px", borderColor: error?"var(--red)":undefined}}
          autoComplete={type==="password"?"current-password":"off"}
        />
        {type==="password" && onTogglePass && (
          <button type="button" onClick={onTogglePass}
            style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--muted)",fontSize:15,cursor:"pointer"}}>
            {showPass?"🙈":"👁"}
          </button>
        )}
      </div>
      {error && <div style={{marginTop:5,fontSize:12,color:"var(--red)",display:"flex",alignItems:"center",gap:4}}>⚠ {error}</div>}
    </div>
  );
}

// ─── USER STORE (in-memory "database") ────────────────────
const API = "http://localhost:5000";

const USER_DB = [
  { name:"Rahul Vasant Pujar", email:"rahulpujar1908@gmail.com", password:"mental@1908",  phone:"9000000001", role:"admin"   },
  { name:"Staff One",          email:"staff@qc.com",             password:"staff123",   phone:"9000000002", role:"staff"   },
  { name:"Demo Student",       email:"student@qc.com",           password:"student123", phone:"9000000003", role:"student" },
];

// ─── AUTH SCREENS ──────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"", phone:"" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); setSuccess(""); };

  const validate = () => {
    const e = {};
    if (mode === "register") {
      if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
      if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit Indian mobile number";
      if (form.password !== form.confirm) e.confirm = "Passwords do not match";
      if (form.password.length < 6) e.password = "Password must be at least 6 characters";
      if (USER_DB.find(u => u.email === form.email.toLowerCase())) e.email = "This email is already registered";
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = e.email || "Enter a valid email address";
    if (!form.password) e.password = e.password || "Password is required";
    return e;
  };

  const handle = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    if (mode === "login") {
      try {
        const res = await fetch(`${API}/api/login`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ email: form.email.toLowerCase(), password: form.password })
        });
        const data = await res.json();
        if (data.success) { onLogin(data.user); return; }
        setErrors({ email:" ", password: data.message || "Incorrect email or password." });
      } catch {
        // Server offline → fallback to in-memory
        const found = USER_DB.find(u => u.email===form.email.toLowerCase() && u.password===form.password);
        if (found) { onLogin(found); }
        else { setErrors({ email:" ", password:"Incorrect email or password." }); }
      }
    } else {
      try {
        const res = await fetch(`${API}/api/register`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name:form.name.trim(), email:form.email.toLowerCase(), password:form.password, phone:form.phone, role })
        });
        const data = await res.json();
        if (data.success) {
          const u = { name:form.name.trim(), email:form.email.toLowerCase(), role, phone:form.phone };
          setSuccess("Account created! Signing you in…");
          setTimeout(()=>onLogin(u), 900);
        } else {
          setErrors({ email: data.error || "Registration failed" });
        }
      } catch {
        // Server offline → fallback to in-memory
        if (USER_DB.find(u=>u.email===form.email.toLowerCase())) { setErrors({ email:"Email already registered" }); return; }
        const newUser = { name:form.name.trim(), email:form.email.toLowerCase(), password:form.password, phone:form.phone, role };
        USER_DB.push(newUser);
        setSuccess("Account created! Signing you in…");
        setTimeout(()=>onLogin(newUser), 900);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:20 }} className="hero-bg">
      <div className="fade-up" style={{ width:"min(440px,100%)" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:8 }}>🍽️</div>
          <h1 style={{ fontSize:30, fontWeight:800, background:"linear-gradient(135deg,#FF5C00,#FFB347)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>QuickCanteen</h1>
          <p style={{ color:"var(--muted)", marginTop:6, fontSize:13 }}>Pre-order your food. Skip the queue.</p>
        </div>

        <div className="card" style={{ padding:30 }}>
          <div className="tab-bar" style={{ marginBottom:24 }}>
            <button type="button" className={`tab ${mode==="login"?"active":""}`} onClick={()=>{setMode("login");setErrors({});setSuccess("");}} style={{flex:1}}>Sign In</button>
            <button type="button" className={`tab ${mode==="register"?"active":""}`} onClick={()=>{setMode("register");setErrors({});setSuccess("");}} style={{flex:1}}>Register</button>
          </div>

          {success && (
            <div style={{background:"#22C55E22",border:"1px solid #22C55E44",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"var(--green)",display:"flex",alignItems:"center",gap:8}}>
              ✅ {success}
            </div>
          )}

          {errors.password && mode==="login" && (
            <div style={{background:"#EF444422",border:"1px solid #EF444444",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"var(--red)"}}>
              ⚠ {errors.password}
            </div>
          )}

          <form onSubmit={handle} style={{ display:"flex", flexDirection:"column", gap:14 }} noValidate>
            {mode==="register" && <>
              <Field label="FULL NAME" fieldKey="name" placeholder="Ravi Kumar" icon="👤" value={form.name} onChange={v=>set("name",v)} error={errors.name} />
              <Field label="PHONE (optional)" fieldKey="phone" placeholder="9XXXXXXXXX" icon="📱" value={form.phone} onChange={v=>set("phone",v)} error={errors.phone} />
              <div>
                <label style={{fontSize:11,color:"var(--muted)",fontWeight:700,marginBottom:6,display:"block",letterSpacing:.8}}>ROLE</label>
                <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
                  <option value="student">🎒 Student</option>
                  <option value="staff">👨‍🍳 Canteen Staff</option>
                  <option value="admin">🛡 Admin</option>
                </select>
              </div>
            </>}
            <Field label="EMAIL ADDRESS" fieldKey="email" type="email" placeholder="you@college.edu" icon="✉️" value={form.email} onChange={v=>set("email",v)} error={errors.email} />
            <Field label="PASSWORD" fieldKey="password" type="password" placeholder={mode==="register"?"Min. 6 characters":"••••••••"} icon="🔑" value={form.password} onChange={v=>set("password",v)} error={errors.password} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)} />
            {mode==="register" && (
              <Field label="CONFIRM PASSWORD" fieldKey="confirm" type="password" placeholder="Re-enter password" icon="🔒" value={form.confirm} onChange={v=>set("confirm",v)} error={errors.confirm} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)} />
            )}

            <button type="submit" className="btn-primary" style={{ marginTop:4, width:"100%", padding:14, fontSize:15 }}>
              {mode==="login" ? "Sign In →" : "Create My Account →"}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{marginTop:20, padding:"14px 16px", background:"var(--surface2)", borderRadius:12, border:"1px solid var(--border)"}}>
            <div style={{fontSize:11,color:"var(--muted)",fontWeight:700,marginBottom:10,letterSpacing:.8}}>
              {mode==="login" ? "🧪 DEMO ACCOUNTS — CLICK TO FILL" : "ℹ️ ALREADY HAVE AN ACCOUNT?"}
            </div>
            {mode==="login" ? (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[
                  {label:"Student", email:"student@qc.com",            pass:"student123",  icon:"🎒"},
                  {label:"Admin",   email:"rahulpujar1908@gmail.com",   pass:"mental@1908", icon:"🛡"},
                  {label:"Staff",   email:"staff@qc.com",               pass:"staff123",    icon:"👨‍🍳"},
                ].map(d=>(
                  <button key={d.label} className="btn-secondary" style={{flex:1,padding:"8px 10px",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}
                    onClick={()=>{setForm({...form,email:d.email,password:d.pass});setErrors({});setSuccess("");}}>
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" className="btn-secondary" style={{width:"100%",fontSize:13}}
                onClick={()=>{setMode("login");setErrors({});setSuccess("");}}>
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>

        <p style={{textAlign:"center",color:"var(--muted)",marginTop:20,fontSize:12}}>
          🔒 BCrypt encrypted · MySQL powered · Made for students
        </p>
      </div>
    </div>
  );
}

// ─── STUDENT APP ───────────────────────────────────────────
function StudentApp({ user, onLogout, orders, setOrders, addToast, onMutate }) {
  const [page, setPage] = useState("menu");
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [payMethod, setPayMethod] = useState("UPI");
  const [showCheckout, setShowCheckout] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [filter, setFilter] = useState("all");

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c=>c.id===item.id);
      if (ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c);
      return [...prev, {...item, qty:1}];
    });
    addToast(`${item.emoji} Added to cart`, "success");
  };

  const updateCart = (id, delta) => {
    setCart(prev => prev.map(c=>c.id===id?{...c,qty:Math.max(0,c.qty+delta)}:c).filter(c=>c.qty>0));
  };

  const placeOrder = () => {
    if (!pickupTime) { addToast("Please select a pickup time", "warning"); return; }
    const order = {
      id: genId(), items: cart, total: cartTotal, status: "PENDING",
      pickup: pickupTime, payment: payMethod, time: now(), date: today(),
      user: user.name, token: Math.floor(Math.random()*90)+10,
    };
    onMutate(); // pause poll so local order shows immediately
    setOrders(prev => [order, ...prev]);
    setCart([]); setShowCheckout(false); setPickupTime(""); setPage("orders");
    addToast(`🎉 Order #${order.id} placed! Token: ${order.token}`, "success");
    fetch(`${API}/api/orders`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        id: order.id, user_name: order.user, items: order.items,
        total: order.total, status: order.status, pickup_time: order.pickup,
        payment_method: order.payment, token: order.token,
        order_date: order.date, order_time: order.time
      })
    }).catch(()=>{});
  };

  const filtered = MENU.filter(item => {
    const catOk = category==="All" || item.category===category;
    const searchOk = item.name.toLowerCase().includes(search.toLowerCase());
    const vegOk = filter==="all" || (filter==="veg" && item.veg) || (filter==="nonveg" && !item.veg);
    return catOk && searchOk && vegOk;
  });

  const myOrders = orders.filter(o=>o.user===user.name);

  return (
    <div style={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>
      {/* Nav */}
      <nav className="nav" style={{padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:20}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <span style={{fontSize:24}}>🍽️</span>
          <span style={{fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, background:"linear-gradient(135deg,#FF5C00,#FFB347)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>QuickCanteen</span>
        </div>
        <div style={{display:"flex", gap:4, marginLeft:"auto"}}>
          {[{id:"menu",icon:"🍱",label:"Menu"},{id:"orders",icon:"📋",label:"My Orders"},{id:"history",icon:"🕐",label:"History"}].map(p=>(
            <button key={p.id} className={`tab ${page===p.id?"active":""}`} onClick={()=>setPage(p.id)} style={{padding:"7px 14px"}}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <button onClick={()=>setPage("cart")} className="btn-secondary" style={{position:"relative",padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
          🛒 Cart
          {cartCount>0 && <span style={{background:"var(--accent)",color:"#fff",borderRadius:"50%",width:20,height:20,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
        </button>
        <div style={{width:1,height:24,background:"var(--border)"}}/>
        <span style={{fontSize:13,color:"var(--muted)"}}>👋 {user.name}</span>
        <button className="btn-secondary" style={{padding:"7px 14px",fontSize:12}} onClick={onLogout}>Logout</button>
      </nav>

      <div style={{flex:1, padding:"28px 24px", maxWidth:1200, margin:"0 auto", width:"100%"}}>

        {/* ── MENU ── */}
        {page==="menu" && (
          <div className="fade-up">
            {/* Hero */}
            <div className="hero-bg" style={{borderRadius:20,padding:"32px 36px",marginBottom:28,border:"1px solid var(--border)"}}>
              <div style={{fontSize:13,color:"var(--accent)",fontWeight:700,marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>Main Canteen • Open Now</div>
              <h2 style={{fontSize:28,fontWeight:800,marginBottom:8}}>What would you like today?</h2>
              <p style={{color:"var(--muted)",fontSize:14,marginBottom:20}}>Order ahead, pick up fresh. No waiting in queues.</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <input className="input" placeholder="🔍 Search food…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:280}} />
                <div className="tab-bar">
                  {["all","veg","nonveg"].map(f=>(
                    <button key={f} className={`tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{padding:"7px 14px",fontSize:12}}>
                      {f==="all"?"All":f==="veg"?"🟢 Veg":"🔴 Non-Veg"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div className="tab-bar" style={{marginBottom:24,display:"inline-flex"}}>
              {CATEGORIES.map(c=>(
                <button key={c} className={`tab ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</button>
              ))}
            </div>

            {/* Grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:18}}>
              {filtered.map((item,i)=>{
                const inCart = cart.find(c=>c.id===item.id);
                return (
                  <div key={item.id} className="card fade-up" style={{padding:0,overflow:"hidden",animationDelay:`${i*0.04}s`}}>
                    <div className="food-img" onClick={()=>setDetailItem(item)} style={{cursor:"pointer"}}>
                      {item.emoji}
                    </div>
                    <div style={{padding:"14px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                        <span className={item.veg?"tag-veg":"tag-nonveg"}>{item.veg?"VEG":"NON-VEG"}</span>
                        <span style={{fontSize:11,color:"var(--muted)"}}>⏱ {item.prep} min</span>
                      </div>
                      <h4 style={{fontWeight:700,marginTop:8,marginBottom:3,fontSize:15}}>{item.name}</h4>
                      <div style={{marginBottom:8}}><StarRating rating={item.rating}/></div>
                      <p style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.5}}>{item.desc}</p>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontWeight:800,fontSize:18,color:"var(--accent)",fontFamily:"'Syne',sans-serif"}}>₹{item.price}</span>
                        {inCart ? (
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <button className="qty-btn" onClick={()=>updateCart(item.id,-1)}>-</button>
                            <span style={{fontWeight:700,minWidth:20,textAlign:"center"}}>{inCart.qty}</span>
                            <button className="qty-btn" onClick={()=>updateCart(item.id,+1)}>+</button>
                          </div>
                        ) : (
                          <button className="btn-primary" style={{padding:"8px 18px",fontSize:13}} onClick={()=>addToCart(item)}>Add +</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length===0 && (
                <div style={{gridColumn:"1/-1",textAlign:"center",padding:60,color:"var(--muted)"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🔍</div>
                  <div>No items found</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CART ── */}
        {page==="cart" && (
          <div className="fade-up" style={{maxWidth:680,margin:"0 auto"}}>
            <h2 style={{marginBottom:24,fontWeight:800}}>🛒 Your Cart</h2>
            {cart.length===0 ? (
              <div className="card" style={{padding:60,textAlign:"center",color:"var(--muted)"}}>
                <div style={{fontSize:56,marginBottom:16}}>🛒</div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:8,color:"var(--text)"}}>Cart is empty</div>
                <div style={{marginBottom:20}}>Add some delicious items from the menu!</div>
                <button className="btn-primary" onClick={()=>setPage("menu")}>Browse Menu →</button>
              </div>
            ) : (
              <>
                <div className="card" style={{marginBottom:18}}>
                  {cart.map((item,i)=>(
                    <div key={item.id} style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",borderBottom:i<cart.length-1?"1px solid var(--border)":"none"}}>
                      <div style={{fontSize:36}}>{item.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700}}>{item.name}</div>
                        <div style={{fontSize:13,color:"var(--muted)"}}>₹{item.price} each</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button className="qty-btn" onClick={()=>updateCart(item.id,-1)}>-</button>
                        <span style={{fontWeight:700,minWidth:24,textAlign:"center"}}>{item.qty}</span>
                        <button className="qty-btn" onClick={()=>updateCart(item.id,+1)}>+</button>
                      </div>
                      <div style={{fontWeight:800,color:"var(--accent)",minWidth:60,textAlign:"right",fontFamily:"'Syne',sans-serif"}}>₹{item.price*item.qty}</div>
                    </div>
                  ))}
                </div>

                {/* Order details */}
                <div className="card" style={{padding:24,marginBottom:18}}>
                  <h4 style={{marginBottom:16,fontWeight:700}}>Order Details</h4>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div>
                      <label style={{fontSize:12,color:"var(--muted)",fontWeight:600,marginBottom:6,display:"block"}}>PICKUP TIME</label>
                      <input type="time" className="input" value={pickupTime} onChange={e=>setPickupTime(e.target.value)} />
                    </div>
                    <div>
                      <label style={{fontSize:12,color:"var(--muted)",fontWeight:600,marginBottom:6,display:"block"}}>PAYMENT METHOD</label>
                      <div style={{display:"flex",gap:8}}>
                        {["UPI","Cash","Card"].map(m=>(
                          <button key={m} className={`tab ${payMethod===m?"active":""}`} onClick={()=>setPayMethod(m)} style={{flex:1}}>{m}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,padding:"14px 0",borderTop:"1px solid var(--border)"}}>
                      {[["Subtotal",`₹${cartTotal}`],["Platform Fee","₹0"],["Total",`₹${cartTotal}`]].map(([k,v])=>(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",color:k==="Total"?"var(--text)":"var(--muted)",fontWeight:k==="Total"?800:400,fontSize:k==="Total"?17:14}}>
                          <span>{k}</span><span style={k==="Total"?{color:"var(--accent)",fontFamily:"'Syne',sans-serif"}:{}}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn-primary" style={{width:"100%",padding:15,fontSize:16}} onClick={placeOrder}>
                      Place Order · ₹{cartTotal}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {page==="orders" && (
          <div className="fade-up">
            <h2 style={{marginBottom:24,fontWeight:800}}>📋 My Orders</h2>
            {myOrders.length===0 ? (
              <div className="card" style={{padding:60,textAlign:"center",color:"var(--muted)"}}>
                <div style={{fontSize:56,marginBottom:12}}>📋</div>
                <div style={{fontWeight:700,color:"var(--text)",fontSize:18,marginBottom:8}}>No active orders</div>
                <button className="btn-primary" onClick={()=>setPage("menu")}>Order something →</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {myOrders.filter(o=>o.status!=="COMPLETED"&&o.status!=="CANCELLED").map(order=>(
                  <div key={order.id} className="order-row">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <div>
                        <span style={{fontWeight:700,fontFamily:"'Syne',sans-serif"}}>Order #{order.id}</span>
                        <span style={{marginLeft:10,fontSize:13,color:"var(--muted)"}}>Token: <strong style={{color:"var(--accent)"}}>{order.token}</strong></span>
                      </div>
                      <Badge status={order.status}/>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                      {order.items.map(i=>(
                        <span key={i.id} style={{background:"var(--surface)",border:"1px solid var(--border)",padding:"4px 10px",borderRadius:8,fontSize:13}}>{i.emoji} {i.name} ×{i.qty}</span>
                      ))}
                    </div>
                    {/* Status bar */}
                    <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:10}}>
                      {STATUS_FLOW.slice(0,4).map((s,i)=>{
                        const idx = STATUS_FLOW.indexOf(order.status);
                        const done = i<=idx;
                        return (
                          <div key={s} style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:done?"var(--accent)":"var(--surface2)",border:`2px solid ${done?"var(--accent)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,transition:"all .4s",flexShrink:0}}>
                              {done?"✓":""}
                            </div>
                            {i<3&&<div style={{height:3,flex:1,background:done&&i<idx?"var(--accent)":"var(--border)",borderRadius:2,transition:"all .4s"}}/>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,color:"var(--muted)"}}>🕐 Pickup: {order.pickup} · {order.payment}</span>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontWeight:800,color:"var(--accent)",fontFamily:"'Syne',sans-serif"}}>₹{order.total}</span>
                        {order.status==="READY" && (
                          <button className="btn-primary" style={{padding:"7px 16px",fontSize:12,background:"var(--green)",boxShadow:"0 4px 14px #22C55E44"}}
                            onClick={()=>{
                              onMutate();
                              setOrders(prev=>prev.map(o=>o.id===order.id?{...o,status:"COMPLETED"}:o));
                              fetch(`${API}/api/orders/${order.id}/status`,{
                                method:"PATCH", headers:{"Content-Type":"application/json"},
                                body: JSON.stringify({status:"COMPLETED"})
                              }).catch(()=>{});
                              addToast("✅ Marked as picked up! Check your History.","success");
                            }}>
                            ✔ Picked Up
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {page==="history" && (
          <div className="fade-up">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h2 style={{fontWeight:800}}>🕐 Order History</h2>
              <span style={{fontSize:13,color:"var(--muted)"}}>{myOrders.filter(o=>o.status==="COMPLETED"||o.status==="CANCELLED").length} orders</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {myOrders.filter(o=>o.status==="COMPLETED"||o.status==="CANCELLED").map(order=>(
                <div key={order.id} className="card" style={{padding:"18px 22px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <span style={{fontWeight:700,fontFamily:"'Syne',sans-serif",fontSize:15}}>Order #{order.id}</span>
                      <span style={{marginLeft:10,fontSize:12,color:"var(--muted)"}}>Token {order.token}</span>
                    </div>
                    <Badge status={order.status}/>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                    {order.items.map(i=>(
                      <span key={i.id} style={{background:"var(--surface2)",border:"1px solid var(--border)",padding:"3px 10px",borderRadius:8,fontSize:12}}>
                        {i.emoji} {i.name} ×{i.qty}
                      </span>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                    <div>
                      <span style={{fontSize:12,color:"var(--muted)"}}>📅 {order.date} · {order.time}</span>
                      <span style={{marginLeft:10,fontSize:12,color:"var(--muted)"}}>💳 {order.payment}</span>
                    </div>
                    <span style={{fontWeight:800,color:"var(--accent)",fontFamily:"'Syne',sans-serif",fontSize:16}}>₹{order.total}</span>
                  </div>
                </div>
              ))}
              {myOrders.filter(o=>o.status==="COMPLETED"||o.status==="CANCELLED").length===0 && (
                <div className="card" style={{padding:60,textAlign:"center",color:"var(--muted)"}}>
                  <div style={{fontSize:48,marginBottom:12}}>📭</div>No completed orders yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Item detail modal */}
      {detailItem && (
        <div className="modal-overlay" onClick={()=>setDetailItem(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:72,textAlign:"center",marginBottom:16}}>{detailItem.emoji}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span className={detailItem.veg?"tag-veg":"tag-nonveg"}>{detailItem.veg?"VEG":"NON-VEG"}</span>
              <span style={{fontSize:12,color:"var(--muted)"}}>⏱ {detailItem.prep} min</span>
              <span style={{marginLeft:"auto"}}><StarRating rating={detailItem.rating}/></span>
            </div>
            <h3 style={{fontSize:22,fontWeight:800,marginBottom:6}}>{detailItem.name}</h3>
            <p style={{color:"var(--muted)",marginBottom:16,lineHeight:1.6}}>{detailItem.desc}</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:24,fontWeight:800,color:"var(--accent)",fontFamily:"'Syne',sans-serif"}}>₹{detailItem.price}</span>
              <button className="btn-primary" onClick={()=>{addToCart(detailItem);setDetailItem(null);}}>Add to Cart</button>
            </div>
            <button onClick={()=>setDetailItem(null)} style={{marginTop:14,width:"100%",background:"none",border:"1px solid var(--border)",color:"var(--muted)",padding:10,borderRadius:10,fontSize:14}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN / STAFF APP ─────────────────────────────────────
function AdminApp({ user, onLogout, orders, setOrders, addToast, onMutate }) {
  const [page, setPage] = useState("orders");
  const [menu, setMenu] = useState(MENU.map(m=>({...m})));
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name:"", category:"Snacks", price:"", qty:"", veg:true, emoji:"🍽️", desc:"", prep:5 });

  const advanceStatus = (orderId) => {
    // Read current status directly from the orders prop — no updater side-effects
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const idx   = STATUS_FLOW.indexOf(order.status);
    const next  = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    if (next === order.status) return; // already at end

    onMutate();                        // pause poll for 5s
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: next } : o));
    addToast(`Order #${orderId} → ${next}`, "info");

    fetch(`${API}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => {});
  };

  const cancelOrder = (orderId) => {
    onMutate();
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
    addToast("Order cancelled", "error");
    fetch(`${API}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    }).catch(() => {});
  };

  const saveItem = () => {
    if (editItem) {
      setMenu(prev=>prev.map(m=>m.id===editItem.id?editItem:m));
      setEditItem(null);
      addToast("Item updated", "success");
      fetch(`${API}/api/menu/${editItem.id}`,{
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...editItem, description:editItem.desc})
      }).catch(()=>{});
    } else {
      const item = {...newItem, id: Date.now(), price:+newItem.price, qty:+newItem.qty, rating:4.0};
      setMenu(prev=>[...prev,item]);
      setShowAdd(false);
      setNewItem({ name:"",category:"Snacks",price:"",qty:"",veg:true,emoji:"🍽️",desc:"",prep:5 });
      addToast("Item added to menu", "success");
      fetch(`${API}/api/menu`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...item, description:item.desc})
      }).catch(()=>{});
    }
  };

  const deleteItem = (id) => {
    setMenu(prev=>prev.filter(m=>m.id!==id));
    addToast("Item removed", "error");
    fetch(`${API}/api/menu/${id}`,{ method:"DELETE" }).catch(()=>{});
  };

  const activeOrders = orders.filter(o=>o.status!=="COMPLETED"&&o.status!=="CANCELLED");
  const completedOrders = orders.filter(o=>o.status==="COMPLETED");
  const totalRevenue = completedOrders.reduce((s,o)=>s+o.total,0);
  const categoryBreakdown = CATEGORIES.slice(1).map(c=>({
    name:c, count: menu.filter(m=>m.category===c).length,
    revenue: completedOrders.reduce((s,o)=>s+o.items.filter(i=>i.category===c).reduce((ss,i)=>ss+i.price*i.qty,0),0)
  }));

  const navItems = user.role==="admin"
    ? [{id:"orders",icon:"📋",label:"Orders"},{id:"menu",icon:"🍱",label:"Menu"},{id:"sales",icon:"📊",label:"Sales"},{id:"stock",icon:"📦",label:"Stock"}]
    : [{id:"orders",icon:"📋",label:"Orders"},{id:"stock",icon:"📦",label:"Stock"}];

  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{padding:"24px 20px 20px",borderBottom:"1px solid var(--border)"}}>
          <div style={{fontSize:22,marginBottom:4}}>🍽️</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,background:"linear-gradient(135deg,#FF5C00,#FFB347)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>QuickCanteen</div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:3,textTransform:"uppercase",letterSpacing:1}}>{user.role} Panel</div>
        </div>
        <div style={{padding:"12px 0"}}>
          {navItems.map(n=>(
            <div key={n.id} className={`sidebar-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span style={{fontSize:18}}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id==="orders" && activeOrders.length>0 && (
                <span style={{marginLeft:"auto",background:"var(--accent)",color:"#fff",borderRadius:10,padding:"1px 8px",fontSize:11,fontWeight:800}}>{activeOrders.length}</span>
              )}
            </div>
          ))}
        </div>
        <div style={{marginTop:"auto",padding:16,borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:13,color:"var(--text)",fontWeight:600,marginBottom:4}}>👤 {user.name}</div>
          <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>{user.email}</div>
          <button className="btn-secondary" style={{width:"100%",padding:"8px 12px",fontSize:12}} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"28px 28px"}}>

        {/* ── ORDERS ── */}
        {page==="orders" && (
          <div className="fade-up">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h2 style={{fontWeight:800}}>Live Orders</h2>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"var(--green)",display:"inline-block",animation:"pulse 2s infinite"}}/>
                <span style={{fontSize:13,color:"var(--muted)"}}>{activeOrders.length} active</span>
              </div>
            </div>

            {activeOrders.length===0 ? (
              <div className="card" style={{padding:60,textAlign:"center",color:"var(--muted)"}}>
                <div style={{fontSize:48,marginBottom:12}}>✅</div>
                <div style={{fontWeight:700,color:"var(--text)",fontSize:18}}>All caught up!</div>
                <div>No pending orders right now.</div>
              </div>
            ) : (
              <div style={{display:"grid",gap:14}}>
                {activeOrders.map(order=>(
                  <div key={order.id} className="card" style={{padding:20}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{background:"var(--accent)22",border:"1px solid var(--accent)44",borderRadius:10,padding:"8px 14px"}}>
                          <div style={{fontSize:11,color:"var(--muted)"}}>TOKEN</div>
                          <div style={{fontWeight:800,color:"var(--accent)",fontFamily:"'Syne',sans-serif",fontSize:18}}>{order.token}</div>
                        </div>
                        <div>
                          <div style={{fontWeight:700}}>Order #{order.id} · <span style={{color:"var(--muted)",fontWeight:400}}>{order.user}</span></div>
                          <div style={{fontSize:12,color:"var(--muted)"}}>📅 {order.date} · 🕐 {order.time} · 🚶 Pickup: {order.pickup}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <Badge status={order.status}/>
                        <span style={{fontWeight:800,color:"var(--accent)",fontFamily:"'Syne',sans-serif"}}>₹{order.total}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                      {order.items.map(i=>(
                        <span key={i.id} style={{background:"var(--surface2)",border:"1px solid var(--border)",padding:"5px 12px",borderRadius:8,fontSize:13}}>
                          {i.emoji} {i.name} <strong>×{i.qty}</strong>
                        </span>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {order.status!=="READY" && (
                        <button className="btn-primary" style={{padding:"9px 20px",fontSize:13}} onClick={()=>advanceStatus(order.id)}>
                          {order.status==="PENDING"?"✅ Confirm":order.status==="CONFIRMED"?"🍳 Start Preparing":order.status==="PREPARING"?"🔔 Mark Ready":"→ Next"}
                        </button>
                      )}
                      {order.status==="READY" && (
                        <button className="btn-primary" style={{padding:"9px 20px",fontSize:13,background:"var(--green)"}} onClick={()=>advanceStatus(order.id)}>
                          ✔ Mark Completed
                        </button>
                      )}
                      <button className="btn-danger" onClick={()=>cancelOrder(order.id)}>Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent completed */}
            {completedOrders.length>0 && (
              <div style={{marginTop:32}}>
                <h3 style={{marginBottom:16,fontWeight:700,color:"var(--muted)",fontSize:14,textTransform:"uppercase",letterSpacing:1}}>Completed Today</h3>
                <div className="card">
                  <table>
                    <thead>
                      <tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {completedOrders.slice(0,5).map(o=>(
                        <tr key={o.id}>
                          <td style={{fontWeight:700}}>#{o.id}</td>
                          <td style={{color:"var(--muted)"}}>{o.user}</td>
                          <td style={{color:"var(--muted)",fontSize:12}}>{o.items.map(i=>`${i.name}`).join(", ")}</td>
                          <td style={{fontWeight:700,color:"var(--accent)"}}>₹{o.total}</td>
                          <td><Badge status={o.status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MENU MANAGEMENT ── */}
        {page==="menu" && (
          <div className="fade-up">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <h2 style={{fontWeight:800}}>Menu Management</h2>
              <button className="btn-primary" onClick={()=>setShowAdd(true)}>+ Add Item</button>
            </div>
            <div className="card">
              <table>
                <thead>
                  <tr><th>Item</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {menu.map(item=>(
                    <tr key={item.id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:24}}>{item.emoji}</span>
                          <div>
                            <div style={{fontWeight:600}}>{item.name}</div>
                            <span className={item.veg?"tag-veg":"tag-nonveg"}>{item.veg?"VEG":"NON-VEG"}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{color:"var(--muted)"}}>{item.category}</td>
                      <td style={{fontWeight:700,color:"var(--accent)"}}>₹{item.price}</td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontWeight:600}}>{item.qty}</span>
                          <div style={{width:60}}>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{width:`${Math.min(item.qty,100)}%`,background:item.qty<20?"var(--red)":item.qty<50?"var(--yellow)":"var(--green)"}}/>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{color:item.is_available!==false?"var(--green)":"var(--red)",fontSize:13,fontWeight:600}}>
                          {item.is_available!==false?"● Available":"○ Unavailable"}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn-secondary" style={{padding:"6px 12px",fontSize:12}} onClick={()=>setEditItem({...item})}>Edit</button>
                          <button className="btn-danger" onClick={()=>deleteItem(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SALES DASHBOARD ── */}
        {page==="sales" && (
          <div className="fade-up">
            <h2 style={{marginBottom:24,fontWeight:800}}>Sales Dashboard</h2>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              {[
                {label:"Total Revenue",val:`₹${totalRevenue}`,icon:"💰",color:"var(--accent)"},
                {label:"Completed Orders",val:completedOrders.length,icon:"✅",color:"var(--green)"},
                {label:"Active Orders",val:activeOrders.length,icon:"🍳",color:"var(--yellow)"},
                {label:"Menu Items",val:menu.length,icon:"🍱",color:"var(--blue)"},
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div style={{fontSize:26,marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:28,fontWeight:800,color:s.color,fontFamily:"'Syne',sans-serif"}}>{s.val}</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            <div className="card" style={{padding:24,marginBottom:20}}>
              <h4 style={{marginBottom:20,fontWeight:700}}>Revenue by Category</h4>
              {categoryBreakdown.map(c=>(
                <div key={c.name} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:600}}>{c.name}</span>
                    <span style={{fontSize:14,color:"var(--accent)",fontWeight:700}}>₹{c.revenue}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width:totalRevenue?`${(c.revenue/totalRevenue)*100}%`:"0%",background:"var(--accent)"}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Order table */}
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
                <h4 style={{fontWeight:700}}>All Orders</h4>
              </div>
              <table>
                <thead>
                  <tr><th>#</th><th>Customer</th><th>Items</th><th>Payment</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.map(o=>(
                    <tr key={o.id}>
                      <td style={{fontWeight:700,color:"var(--muted)"}}>#{o.id}</td>
                      <td>{o.user}</td>
                      <td style={{color:"var(--muted)",fontSize:12,maxWidth:200}}>{o.items.map(i=>i.name).join(", ")}</td>
                      <td style={{fontSize:12}}>{o.payment}</td>
                      <td style={{fontWeight:700,color:"var(--accent)"}}>₹{o.total}</td>
                      <td><Badge status={o.status}/></td>
                    </tr>
                  ))}
                  {orders.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:40,color:"var(--muted)"}}>No orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STOCK ── */}
        {page==="stock" && (
          <div className="fade-up">
            <h2 style={{marginBottom:24,fontWeight:800}}>📦 Stock Management</h2>
            <div className="card">
              <table>
                <thead>
                  <tr><th>Item</th><th>Category</th><th>Current Stock</th><th>Level</th><th>Adjust</th></tr>
                </thead>
                <tbody>
                  {[...menu].sort((a,b)=>a.qty-b.qty).map(item=>(
                    <tr key={item.id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:22}}>{item.emoji}</span>
                          <span style={{fontWeight:600}}>{item.name}</span>
                        </div>
                      </td>
                      <td style={{color:"var(--muted)"}}>{item.category}</td>
                      <td>
                        <span style={{fontWeight:700,color:item.qty<20?"var(--red)":item.qty<50?"var(--yellow)":"var(--green)"}}>{item.qty}</span>
                        {item.qty<20&&<span style={{marginLeft:8,fontSize:11,color:"var(--red)",fontWeight:600}}>LOW</span>}
                      </td>
                      <td style={{width:120}}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width:`${Math.min((item.qty/200)*100,100)}%`,background:item.qty<20?"var(--red)":item.qty<50?"var(--yellow)":"var(--green)"}}/>
                        </div>
                      </td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <button className="qty-btn" onClick={()=>{
                            const newQty = Math.max(0, item.qty-10);
                            setMenu(prev=>prev.map(m=>m.id===item.id?{...m,qty:newQty}:m));
                            addToast(`-10 ${item.name}`,"warning");
                            fetch(`${API}/api/menu/${item.id}/stock`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({qty:newQty})}).catch(()=>{});
                          }}>-10</button>
                          <button className="qty-btn" style={{background:"var(--green)22",borderColor:"var(--green)44",color:"var(--green)"}} onClick={()=>{
                            const newQty = item.qty+50;
                            setMenu(prev=>prev.map(m=>m.id===item.id?{...m,qty:newQty}:m));
                            addToast(`+50 ${item.name} restocked`,"success");
                            fetch(`${API}/api/menu/${item.id}/stock`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({qty:newQty})}).catch(()=>{});
                          }}>+50</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {(editItem||showAdd) && (
        <div className="modal-overlay" onClick={()=>{setEditItem(null);setShowAdd(false);}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3 style={{marginBottom:20,fontWeight:800}}>{editItem?"Edit Item":"Add New Item"}</h3>
            {[
              {label:"Name",key:"name",type:"text",ph:"e.g. Masala Dosa"},
              {label:"Emoji",key:"emoji",type:"text",ph:"🍽️"},
              {label:"Price (₹)",key:"price",type:"number",ph:"e.g. 45"},
              {label:"Stock Qty",key:"qty",type:"number",ph:"e.g. 100"},
              {label:"Prep Time (min)",key:"prep",type:"number",ph:"e.g. 10"},
              {label:"Description",key:"desc",type:"text",ph:"Short description"},
            ].map(f=>{
              const val = editItem ? (editItem[f.key] ?? "") : (newItem[f.key] ?? "");
              return (
              <div key={f.key} style={{marginBottom:14}}>
                <label style={{fontSize:12,color:"var(--muted)",fontWeight:600,marginBottom:5,display:"block"}}>{f.label.toUpperCase()}</label>
                <input className="input" type={f.type} placeholder={f.ph}
                  value={val}
                  onChange={e=>editItem?setEditItem({...editItem,[f.key]:f.type==="number"?+e.target.value:e.target.value}):setNewItem({...newItem,[f.key]:f.type==="number"?+e.target.value:e.target.value})} />
              </div>
            );
            })}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"var(--muted)",fontWeight:600,marginBottom:5,display:"block"}}>CATEGORY</label>
              <select className="input" value={editItem?editItem.category:newItem.category}
                onChange={e=>editItem?setEditItem({...editItem,category:e.target.value}):setNewItem({...newItem,category:e.target.value})}>
                {CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"var(--muted)",fontWeight:600,marginBottom:5,display:"block"}}>TYPE</label>
              <div style={{display:"flex",gap:8}}>
                {[true,false].map(v=>(
                  <button key={String(v)} className={`tab ${(editItem?editItem.veg:newItem.veg)===v?"active":""}`}
                    onClick={()=>editItem?setEditItem({...editItem,veg:v}):setNewItem({...newItem,veg:v})}
                    style={{flex:1}}>{v?"🟢 Veg":"🔴 Non-Veg"}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-primary" style={{flex:1}} onClick={saveItem}>{editItem?"Save Changes":"Add Item"}</button>
              <button className="btn-secondary" onClick={()=>{setEditItem(null);setShowAdd(false);}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────
export default function App() {
  const [user, setUser]     = useState(null);
  const [orders, setOrders] = useState([]);
  const [toasts, setToasts] = useState([]);

  // ── BroadcastChannel: instant cross-tab sync ──────────────
  const bcRef       = useRef(null);
  const skipPollRef = useRef(0);

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel("quickcanteen_orders");
      bcRef.current.onmessage = ({ data }) => {
        const { type, payload } = data;
        if (type === "NEW_ORDER") {
          setOrders(prev =>
            prev.find(o => o.id === payload.id) ? prev : [payload, ...prev]
          );
        }
        if (type === "ORDER_STATUS") {
          setOrders(prev =>
            prev.map(o => o.id === payload.id ? { ...o, status: payload.status } : o)
          );
        }
      };
    } catch (e) { /* BroadcastChannel not supported */ }
    return () => { try { bcRef.current?.close(); } catch(e){} };
  }, []);

  const broadcast = (msg) => {
    try { bcRef.current?.postMessage(msg); } catch(e) {}
  };

  const addToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const handleLogin  = (u) => { setUser(u); addToast(`Welcome back, ${u.name}! 👋`, "success"); };
  const handleLogout = ()  => { setUser(null); setOrders([]); addToast("Signed out", "info"); };

  // ── MySQL poll (backup sync, every 5s) ──────────────────
  useEffect(() => {
    if (!user) return;

    const mapOrder = (o) => ({
      id:      o.id,
      user:    o.user_name,
      items:   typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
      total:   +o.total,
      status:  o.status,
      pickup:  o.pickup_time,
      payment: o.payment_method,
      token:   o.token,
      date:    o.order_date,
      time:    o.order_time,
    });

    const poll = () => {
      if (Date.now() - skipPollRef.current < 5000) return;
      fetch(`${API}/api/orders`)
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          const dbOrders = data.map(mapOrder);
          if (user.role === "student") {
            const myDb = dbOrders.filter(o => o.user === user.name);
            setOrders(prev => {
              const dbIds   = new Set(myDb.map(o => o.id));
              const localOnly = prev.filter(o => !dbIds.has(o.id));
              return [...myDb, ...localOnly];
            });
          } else {
            setOrders(dbOrders);
          }
        })
        .catch(() => {});
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const onMutate = () => { skipPollRef.current = Date.now(); };

  return (
    <>
      {!user && <AuthScreen onLogin={handleLogin}/>}
      {user && user.role === "student"
        && <StudentApp user={user} onLogout={handleLogout} orders={orders}
             setOrders={setOrders} addToast={addToast} onMutate={onMutate} broadcast={broadcast}/>}
      {user && (user.role === "admin" || user.role === "staff")
        && <AdminApp user={user} onLogout={handleLogout} orders={orders}
             setOrders={setOrders} addToast={addToast} onMutate={onMutate} broadcast={broadcast}/>}

      {/* Toasts */}
      <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
        {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>removeToast(t.id)}/>)}
      </div>
    </>
  );
}
