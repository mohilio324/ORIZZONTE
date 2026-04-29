import { useState, useEffect } from "react";

// ── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  yellow:   "#FFAD01",
  darkYellow:"#D2940C",
  darkGrey: "#544E51",
  lightGrey:"#B8B8B8",
  black:    "#111111",
  white:    "#FFFFFF",
  bg:       "#F5F4F2",
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_EMPLOYEES = ["Ahmed Cherbi", "Mehdi Lariane", "Lyamine Zerrouki", "El Amine Chekirou"];

const INITIAL_MISSIONS = [
  { id: 1, title: "Residential Move – Hydra", client: "Karim B.", from: "Hydra, Algiers", to: "Bab Ezzouar", date: "2026-05-03", time: "09:00", type: "Résidentiel", truck: "Fourgon", status: "available", assignedTo: null, urgent: true  },
  { id: 2, title: "Corporate Relocation – Kouba", client: "SARL TechNova", from: "Kouba, Algiers", to: "Cheraga Business Park", date: "2026-05-03", time: "11:00", type: "Commercial", truck: "Camion", status: "available", assignedTo: null, urgent: false },
  { id: 3, title: "Freight Shipping – Port Area", client: "Express Cargo DZ", from: "Algiers Port", to: "Blida Zone Industrielle", date: "2026-05-04", time: "07:30", type: "Marchandises", truck: "Harbina", status: "available", assignedTo: null, urgent: true  },
  { id: 4, title: "Student Apartment – Ben Aknoun", client: "Rania M.", from: "Ben Aknoun", to: "Cité Universitaire Bab Ezzouar", date: "2026-05-04", time: "14:00", type: "Résidentiel", truck: "Commercial", status: "available", assignedTo: null, urgent: false },
  { id: 5, title: "Vehicle Transport – Oran", client: "DriveTrack SPA", from: "Algiers Ouest", to: "Oran Port", date: "2026-05-05", time: "06:00", type: "Transport", truck: "Camion", status: "available", assignedTo: null, urgent: false },
];

// ── Truck icon map ────────────────────────────────────────────────────────────
const TruckIcon = ({ type }) => {
  const icons = { Fourgon:"🚐", Camion:"🚛", Harbina:"🚚", Commercial:"🚗" };
  return <span style={{fontSize:20}}>{icons[type] || "🚛"}</span>;
};

// ── Type badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const colors = {
    Résidentiel: { bg:"#FFF3CC", color:"#D2940C" },
    Commercial:  { bg:"#E8F0FE", color:"#1A56E8" },
    Marchandises:{ bg:"#F0FBF0", color:"#188A18" },
    Transport:   { bg:"#FDE8E8", color:"#D32F2F" },
  };
  const s = colors[type] || { bg:"#eee", color:"#333" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: "3px 10px",
      borderRadius: 20, fontFamily: "Poppins, sans-serif", letterSpacing: 0.5,
    }}>{type}</span>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    available:   { label:"DISPONIBLE",  bg: C.yellow,    color: C.black },
    inprogress:  { label:"EN COURS",    bg: "#1A56E8",   color: C.white },
    completed:   { label:"TERMINÉE",    bg: "#188A18",   color: C.white },
    accepted:    { label:"ACCEPTÉE",    bg: C.darkGrey,  color: C.white },
  };
  const s = map[status] || map.available;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 800, padding: "4px 12px",
      borderRadius: 20, fontFamily: "Poppins, sans-serif", letterSpacing: 1,
    }}>{s.label}</span>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent }) => (
  <div style={{
    background: C.white, borderRadius: 16, padding: "20px 24px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    borderLeft: `4px solid ${accent || C.yellow}`,
    display: "flex", alignItems: "center", gap: 16,
    transition: "transform 0.2s", cursor: "default",
  }}
  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
  >
    <span style={{fontSize:32}}>{icon}</span>
    <div>
      <div style={{ fontSize:28, fontWeight:800, color:C.black, fontFamily:"Poppins,sans-serif", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:C.lightGrey, fontFamily:"Poppins,sans-serif", fontWeight:600, marginTop:2 }}>{label}</div>
    </div>
  </div>
);

// ── Mission Card ──────────────────────────────────────────────────────────────
const MissionCard = ({ mission, currentUser, onAccept, onStart, onComplete }) => {
  const isAvailable  = mission.status === "available";
  const isAccepted   = mission.status === "accepted"   && mission.assignedTo === currentUser;
  const isInProgress = mission.status === "inprogress" && mission.assignedTo === currentUser;
  const isMine       = mission.assignedTo === currentUser;

  const cardBg =
    isAvailable   ? "#FFFBF0" :
    isInProgress  ? "#F0F5FF" :
    "#FAFAFA";

  const borderColor =
    isAvailable   ? C.yellow :
    isInProgress  ? "#1A56E8" :
    "#E0E0E0";

  return (
    <div style={{
      background: cardBg,
      border: `2px solid ${borderColor}`,
      borderRadius: 16,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: isAvailable ? `0 4px 24px rgba(255,173,1,0.18)` : "0 2px 12px rgba(0,0,0,0.06)",
      transition: "all 0.25s",
      transform: "translateY(0)",
    }}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
    >
      {/* Urgent ribbon */}
      {mission.urgent && isAvailable && (
        <div style={{
          position:"absolute", top:0, right:0,
          background: C.yellow, color: C.black,
          fontSize:10, fontWeight:800, padding:"4px 14px",
          borderBottomLeftRadius:12, fontFamily:"Poppins,sans-serif", letterSpacing:1,
        }}>⚡ URGENT</div>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:C.black, fontFamily:"Poppins,sans-serif", marginBottom:4 }}>
            {mission.title}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <TypeBadge type={mission.type} />
            <StatusBadge status={mission.status} />
          </div>
        </div>
        <TruckIcon type={mission.truck} />
      </div>

      {/* Info grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px", marginBottom:16 }}>
        <InfoRow icon="👤" label="Client" value={mission.client} />
        <InfoRow icon="🚚" label="Véhicule" value={mission.truck} />
        <InfoRow icon="📍" label="Départ" value={mission.from} />
        <InfoRow icon="🏁" label="Arrivée" value={mission.to} />
        <InfoRow icon="📅" label="Date" value={mission.date} />
        <InfoRow icon="⏰" label="Heure" value={mission.time} />
      </div>

      {/* Assigned to */}
      {mission.assignedTo && (
        <div style={{ fontSize:12, color:C.darkGrey, fontFamily:"Poppins,sans-serif", marginBottom:12, fontWeight:600 }}>
          👷 Assigné à : <span style={{color:C.darkYellow}}>{mission.assignedTo}</span>
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display:"flex", gap:10 }}>
        {isAvailable && (
          <ActionBtn color={C.yellow} textColor={C.black} onClick={()=>onAccept(mission.id)}>
            ✅ Accepter la mission
          </ActionBtn>
        )}
        {isAccepted && isMine && (
          <ActionBtn color="#1A56E8" textColor={C.white} onClick={()=>onStart(mission.id)}>
            ▶ Démarrer
          </ActionBtn>
        )}
        {isInProgress && isMine && (
          <ActionBtn color="#188A18" textColor={C.white} onClick={()=>onComplete(mission.id)}>
            🏁 Terminer
          </ActionBtn>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display:"flex", gap:6, alignItems:"flex-start" }}>
    <span style={{fontSize:13}}>{icon}</span>
    <div>
      <div style={{fontSize:10, color:C.lightGrey, fontFamily:"Poppins,sans-serif", fontWeight:600}}>{label}</div>
      <div style={{fontSize:12, color:C.darkGrey, fontFamily:"Poppins,sans-serif", fontWeight:500}}>{value}</div>
    </div>
  </div>
);

const ActionBtn = ({ children, color, textColor, onClick }) => (
  <button onClick={onClick} style={{
    background: color, color: textColor,
    border: "none", borderRadius: 10,
    padding: "10px 20px", fontSize:13, fontWeight:800,
    fontFamily:"Poppins,sans-serif", cursor:"pointer",
    letterSpacing:0.5, transition:"all 0.2s",
    boxShadow:`0 4px 14px ${color}55`,
  }}
  onMouseEnter={e=>{e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="scale(1.03)";}}
  onMouseLeave={e=>{e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="scale(1)";}}
  >{children}</button>
);

// ── Login Screen ───────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!selected) { setError("Veuillez sélectionner votre nom."); return; }
    onLogin(selected);
  };

  return (
    <div style={{
      minHeight:"100vh", background:`linear-gradient(135deg, ${C.darkGrey} 0%, ${C.black} 60%)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Poppins, sans-serif", position:"relative", overflow:"hidden",
    }}>
      {/* Decorative circles */}
      {[...Array(3)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width: [400,250,180][i], height: [400,250,180][i],
          borderRadius:"50%",
          border:`2px solid ${C.yellow}${["18","22","30"][i]}`,
          top: ["-100px","60%","20%"][i], left: ["-80px","70%","-40px"][i],
          pointerEvents:"none",
        }}/>
      ))}

      <div style={{
        background:`rgba(255,255,255,0.04)`, backdropFilter:"blur(20px)",
        border:`1px solid rgba(255,173,1,0.25)`,
        borderRadius:24, padding:"48px 44px", width:420, maxWidth:"90vw",
        boxShadow:"0 32px 80px rgba(0,0,0,0.5)", position:"relative",
      }}>
        {/* Logo area */}
        <div style={{textAlign:"center", marginBottom:32}}>
          <div style={{
            display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:64, height:64, background:C.yellow, borderRadius:16, marginBottom:12,
            fontSize:28,
          }}>🚛</div>
          <div style={{fontSize:26, fontWeight:900, color:C.white, letterSpacing:-0.5}}>
            ORIZZONTE
          </div>
          <div style={{fontSize:12, color:C.yellow, fontWeight:700, letterSpacing:3, marginTop:4}}>
            ESPACE EMPLOYÉ
          </div>
        </div>

        <div style={{
          width:"100%", height:1,
          background:`linear-gradient(90deg, transparent, ${C.yellow}, transparent)`,
          marginBottom:32,
        }}/>

        <div style={{marginBottom:8}}>
          <label style={{fontSize:12, color:C.lightGrey, fontWeight:700, letterSpacing:1, display:"block", marginBottom:8}}>
            VOTRE NOM
          </label>
          <select
            value={selected}
            onChange={e=>{ setSelected(e.target.value); setError(""); }}
            style={{
              width:"100%", padding:"14px 16px",
              background:"rgba(255,255,255,0.08)", border:`1px solid rgba(255,173,1,0.35)`,
              borderRadius:10, color:C.white, fontSize:14, fontFamily:"Poppins,sans-serif",
              outline:"none", cursor:"pointer", appearance:"none",
            }}
          >
            <option value="" style={{background:C.darkGrey}}>-- Sélectionnez votre nom --</option>
            {MOCK_EMPLOYEES.map(e=>(
              <option key={e} value={e} style={{background:C.darkGrey}}>{e}</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{fontSize:12, color:"#FF6B6B", marginBottom:12, fontWeight:600}}>⚠ {error}</div>
        )}

        <button
          onClick={handleLogin}
          style={{
            width:"100%", marginTop:20, padding:"15px",
            background:`linear-gradient(135deg, ${C.yellow}, ${C.darkYellow})`,
            border:"none", borderRadius:12, color:C.black,
            fontSize:15, fontWeight:900, fontFamily:"Poppins,sans-serif",
            cursor:"pointer", letterSpacing:1,
            boxShadow:`0 8px 24px ${C.yellow}44`, transition:"all 0.2s",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
        >
          ACCÉDER AU DASHBOARD →
        </button>

        <div style={{textAlign:"center", marginTop:20, fontSize:11, color:"rgba(184,184,184,0.6)"}}>
          © 2026 ORIZZONTE Global Services Inc.
        </div>
      </div>
    </div>
  );
};

// ── History Panel ──────────────────────────────────────────────────────────────
const HistoryPanel = ({ items }) => {
  if (!items.length) return (
    <div style={{textAlign:"center", color:C.lightGrey, padding:"40px 0", fontFamily:"Poppins,sans-serif"}}>
      Aucune mission terminée pour l'instant.
    </div>
  );
  return (
    <div style={{display:"flex", flexDirection:"column", gap:12}}>
      {items.map(m=>(
        <div key={m.id} style={{
          background:C.white, borderRadius:12, padding:"16px 20px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          boxShadow:"0 2px 8px rgba(0,0,0,0.05)", opacity:0.85,
        }}>
          <div>
            <div style={{fontSize:14, fontWeight:700, color:C.darkGrey, fontFamily:"Poppins,sans-serif"}}>{m.title}</div>
            <div style={{fontSize:12, color:C.lightGrey, fontFamily:"Poppins,sans-serif"}}>{m.date} • {m.client}</div>
          </div>
          <span style={{
            background:"#E8F5E9", color:"#188A18",
            fontSize:11, fontWeight:700, padding:"4px 12px",
            borderRadius:20, fontFamily:"Poppins,sans-serif",
          }}>✓ TERMINÉE</span>
        </div>
      ))}
    </div>
  );
};

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
const Dashboard = ({ currentUser, onLogout }) => {
  const [missions, setMissions]   = useState(INITIAL_MISSIONS);
  const [completed, setCompleted] = useState([]);
  const [tab, setTab]             = useState("available"); // available | mine | history
  const [notification, setNotif]  = useState(null);

  const showNotif = (msg, color=C.yellow) => {
    setNotif({ msg, color });
    setTimeout(()=>setNotif(null), 3000);
  };

  const handleAccept = (id) => {
    setMissions(prev=>prev.map(m=>
      m.id===id ? {...m, status:"accepted", assignedTo:currentUser} : m
    ));
    showNotif("✅ Mission acceptée ! Elle vous est maintenant assignée.", C.darkYellow);
    setTab("mine");
  };

  const handleStart = (id) => {
    setMissions(prev=>prev.map(m=>
      m.id===id ? {...m, status:"inprogress"} : m
    ));
    showNotif("▶ Mission démarrée — bonne route !", "#1A56E8");
  };

  const handleComplete = (id) => {
    const mission = missions.find(m=>m.id===id);
    setMissions(prev=>prev.filter(m=>m.id!==id));
    setCompleted(prev=>[{...mission, status:"completed"}, ...prev]);
    showNotif("🏁 Mission terminée avec succès !", "#188A18");
    setTab("history");
  };

  // Filtered views
  const availableMissions  = missions.filter(m=>m.status==="available");
  const myMissions         = missions.filter(m=>m.assignedTo===currentUser);
  const urgentCount        = availableMissions.filter(m=>m.urgent).length;
  const inProgressCount    = myMissions.filter(m=>m.status==="inprogress").length;

  const displayList =
    tab==="available" ? availableMissions :
    tab==="mine"      ? myMissions :
    [];

  const TabBtn = ({ id, label, count }) => (
    <button onClick={()=>setTab(id)} style={{
      padding:"10px 22px", borderRadius:10, border:"none",
      background: tab===id ? C.yellow : "rgba(255,255,255,0.7)",
      color: tab===id ? C.black : C.darkGrey,
      fontFamily:"Poppins,sans-serif", fontWeight:800, fontSize:13,
      cursor:"pointer", transition:"all 0.2s",
      boxShadow: tab===id ? `0 4px 14px ${C.yellow}44` : "none",
      position:"relative",
    }}>
      {label}
      {count>0 && (
        <span style={{
          position:"absolute", top:-6, right:-6,
          background:"#D32F2F", color:C.white,
          fontSize:10, fontWeight:800, width:18, height:18,
          borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"Poppins,sans-serif",
        }}>{count}</span>
      )}
    </button>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Poppins, sans-serif" }}>

      {/* ── Notification toast ── */}
      {notification && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:9999,
          background:notification.color, color:C.black,
          padding:"14px 24px", borderRadius:12,
          fontFamily:"Poppins,sans-serif", fontWeight:700, fontSize:14,
          boxShadow:"0 8px 32px rgba(0,0,0,0.2)",
          animation:"slideIn 0.3s ease",
        }}>
          {notification.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        background:`linear-gradient(135deg, ${C.darkGrey} 0%, ${C.black} 100%)`,
        padding:"0 32px", display:"flex", alignItems:"center",
        justifyContent:"space-between", height:68,
        boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <div style={{
            width:40, height:40, background:C.yellow, borderRadius:10,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          }}>🚛</div>
          <div>
            <div style={{fontSize:18, fontWeight:900, color:C.white, letterSpacing:-0.5}}>ORIZZONTE</div>
            <div style={{fontSize:10, color:C.yellow, fontWeight:700, letterSpacing:2}}>ESPACE EMPLOYÉ</div>
          </div>
        </div>

        <div style={{display:"flex", alignItems:"center", gap:16}}>
          {urgentCount>0 && (
            <div style={{
              background:C.yellow, color:C.black, padding:"6px 14px",
              borderRadius:20, fontSize:12, fontWeight:800,
              animation:"pulse 1.5s infinite",
            }}>
              ⚡ {urgentCount} mission(s) urgente(s)
            </div>
          )}
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.08)", borderRadius:10,
            padding:"8px 14px",
          }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:`linear-gradient(135deg, ${C.yellow}, ${C.darkYellow})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, fontWeight:900, color:C.black,
            }}>
              {currentUser.split(" ").map(w=>w[0]).join("").slice(0,2)}
            </div>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:C.white}}>{currentUser}</div>
              <div style={{fontSize:10, color:C.lightGrey}}>Employé</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            background:"transparent", border:`1px solid rgba(255,255,255,0.2)`,
            color:C.lightGrey, padding:"8px 16px", borderRadius:8,
            fontSize:12, fontWeight:600, cursor:"pointer",
            fontFamily:"Poppins,sans-serif", transition:"all 0.2s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.yellow; e.currentTarget.style.color=C.yellow;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"; e.currentTarget.style.color=C.lightGrey;}}
          >Déconnexion</button>
        </div>
      </header>

      <main style={{maxWidth:1200, margin:"0 auto", padding:"32px 24px"}}>

        {/* ── Welcome banner ── */}
        <div style={{
          background:`linear-gradient(135deg, ${C.yellow} 0%, ${C.darkYellow} 100%)`,
          borderRadius:20, padding:"28px 36px", marginBottom:32,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          boxShadow:`0 8px 32px ${C.yellow}44`,
          overflow:"hidden", position:"relative",
        }}>
          <div style={{
            position:"absolute", right:-40, top:-40,
            width:200, height:200, borderRadius:"50%",
            background:"rgba(255,255,255,0.12)",
          }}/>
          <div>
            <div style={{fontSize:24, fontWeight:900, color:C.black}}>
              Bienvenue, {currentUser.split(" ")[0]} 👋
            </div>
            <div style={{fontSize:14, color:"rgba(0,0,0,0.65)", fontWeight:600, marginTop:4}}>
              Moving your world with care and precision.
            </div>
          </div>
          <div style={{fontSize:48}}>🚛</div>
        </div>

        {/* ── Stats ── */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32}}>
          <StatCard label="Missions disponibles" value={availableMissions.length} icon="📋" accent={C.yellow} />
          <StatCard label="Mes missions" value={myMissions.length} icon="👷" accent={C.darkYellow} />
          <StatCard label="En cours" value={inProgressCount} icon="▶" accent="#1A56E8" />
          <StatCard label="Terminées" value={completed.length} icon="✅" accent="#188A18" />
        </div>

        {/* ── Tabs ── */}
        <div style={{display:"flex", gap:10, marginBottom:24, flexWrap:"wrap"}}>
          <TabBtn id="available" label="🟡 Disponibles" count={availableMissions.length} />
          <TabBtn id="mine"      label="👷 Mes Missions" count={myMissions.length} />
          <TabBtn id="history"   label="📂 Historique" count={completed.length} />
        </div>

        {/* ── Content ── */}
        {tab==="history" ? (
          <HistoryPanel items={completed} />
        ) : displayList.length===0 ? (
          <div style={{
            textAlign:"center", padding:"60px 0",
            color:C.lightGrey, fontFamily:"Poppins,sans-serif",
          }}>
            <div style={{fontSize:48, marginBottom:12}}>
              {tab==="available" ? "🎉" : "📭"}
            </div>
            <div style={{fontSize:16, fontWeight:700}}>
              {tab==="available"
                ? "Aucune mission disponible pour l'instant."
                : "Vous n'avez aucune mission assignée."}
            </div>
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))",
            gap:20,
          }}>
            {displayList.map(m=>(
              <MissionCard
                key={m.id}
                mission={m}
                currentUser={currentUser}
                onAccept={handleAccept}
                onStart={handleStart}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background:C.darkGrey, color:C.lightGrey,
        textAlign:"center", padding:"20px",
        fontSize:11, fontFamily:"Poppins,sans-serif", marginTop:60,
      }}>
        © 2026 ORIZZONTE Global Services Inc. All rights reserved. &nbsp;|&nbsp; Algiers, Algeria
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        select option { background: #544E51; color: white; }
      `}</style>
    </div>
  );
};

// ── Root App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginScreen onLogin={setUser} />;
  return <Dashboard currentUser={user} onLogout={()=>setUser(null)} />;
}
