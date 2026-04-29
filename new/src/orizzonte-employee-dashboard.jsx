import { useState, useEffect } from "react";
import api from "./api.js";
import { useAuth } from "./context/AuthContext.jsx";

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
    taken:       { label:"OCCUPÉE",    bg: C.darkGrey,  color: C.white },
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
  const isAvailable  = mission.display_status === "available";
  const isTaken      = mission.display_status === "taken";
  const isInProgress = mission.display_status === "in_progress";
  const isMine       = mission.taken_by === currentUser;

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
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:800, color:C.black, fontFamily:"Poppins,sans-serif", marginBottom:4, textTransform: "uppercase" }}>
            {mission.shipment_type.replace(/_/g, ' ')}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <TypeBadge type={mission.category === 'residential' ? 'Résidentiel' : 'Commercial'} />
            <StatusBadge status={mission.display_status} />
          </div>
        </div>
        <TruckIcon type={mission.truck_type} />
      </div>

      {/* Info grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px", marginBottom:16 }}>
        <InfoRow icon="👤" label="Contact" value={mission.phone_number} />
        <InfoRow icon="🚚" label="Véhicule" value={`${mission.truck_type} (${mission.size})`} />
        <InfoRow icon="📍" label="Départ" value="Algiers Area" />
        <InfoRow icon="🏁" label="Arrivée" value={`Dist: ${mission.distance} km`} />
        <InfoRow icon="📅" label="Date" value={mission.date} />
        <InfoRow icon="⏰" label="Heure" value={mission.time} />
      </div>

      {/* Price */}
      <div style={{ fontSize:16, fontWeight:900, color:C.darkYellow, marginBottom:12, fontFamily:"Poppins,sans-serif" }}>
        {mission.price} DZD
      </div>

      {/* Assigned to */}
      {mission.taken_by && (
        <div style={{ fontSize:12, color:C.darkGrey, fontFamily:"Poppins,sans-serif", marginBottom:12, fontWeight:600 }}>
          👷 {isMine ? "Assigné à : VOUS" : `Assigné à : ${mission.taken_by}`}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display:"flex", gap:10 }}>
        {isAvailable && (
          <ActionBtn color={C.yellow} textColor={C.black} onClick={()=>onAccept(mission.id)}>
            ✅ Accepter la mission
          </ActionBtn>
        )}
        {isMine && mission.status === 'accepted' && (
          <ActionBtn color="#1A56E8" textColor={C.white} onClick={()=>onStart(mission.id)}>
            ▶ Démarrer
          </ActionBtn>
        )}
        {isMine && mission.status === 'in_progress' && (
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
            <div style={{fontSize:14, fontWeight:700, color:C.darkGrey, fontFamily:"Poppins,sans-serif", textTransform: "uppercase"}}>
                {m.shipment_type.replace(/_/g, ' ')}
            </div>
            <div style={{fontSize:12, color:C.lightGrey, fontFamily:"Poppins,sans-serif"}}>{m.date} • {m.phone_number}</div>
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
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [missions, setMissions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("available"); // available | mine | history
  const [notification, setNotif]  = useState(null);

  const currentUserFullName = user ? `${user.username}` : "Employé"; // Fallback to username

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        api.get("/missions/available/"),
        api.get("/missions/my/")
      ]);
      
      // Merge: available missions + my full history
      // Note: available missions might include missions I already accepted but aren't completed yet
      // To avoid duplicates, we can use a Map by ID
      const allMissionsMap = new Map();
      availRes.data.forEach(m => allMissionsMap.set(m.id, m));
      myRes.data.forEach(m => allMissionsMap.set(m.id, m));
      
      setMissions(Array.from(allMissionsMap.values()));
    } catch (err) {
      console.error("Failed to fetch missions:", err);
      showNotif("❌ Erreur lors du chargement des missions.", "#FF6B6B");
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (msg, color=C.yellow) => {
    setNotif({ msg, color });
    setTimeout(()=>setNotif(null), 3000);
  };

  const handleAccept = async (id) => {
    try {
      await api.post(`/missions/${id}/accept/`);
      showNotif("✅ Mission acceptée ! Elle vous est maintenant assignée.", C.darkYellow);
      fetchMissions();
      setTab("mine");
    } catch (err) {
      showNotif("❌ Impossible d'accepter cette mission.", "#FF6B6B");
    }
  };

  const handleStart = async (id) => {
    try {
      await api.post(`/missions/${id}/start/`);
      showNotif("▶ Mission démarrée — bonne route !", "#1A56E8");
      fetchMissions();
    } catch (err) {
      showNotif("❌ Impossible de démarrer la mission.", "#FF6B6B");
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.post(`/missions/${id}/complete/`);
      showNotif("🏁 Mission terminée avec succès !", "#188A18");
      fetchMissions();
      setTab("history");
    } catch (err) {
      showNotif("❌ Erreur lors de la clôture de la mission.", "#FF6B6B");
    }
  };

  // Filtered views
  const availableMissions  = missions.filter(m=>m.display_status==="available");
  const myMissions         = missions.filter(m=>m.taken_by && (m.taken_by === user?.username || m.taken_by.includes(user?.username))); // Flexible check
  const completedMissions  = missions.filter(m=>m.display_status==="completed"); // Backend might exclude these from /available/
  
  const displayList =
    tab==="available" ? availableMissions :
    tab==="mine"      ? myMissions :
    tab==="history"   ? completedMissions :
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

  if (loading && missions.length === 0) {
      return <div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:C.bg}}>
          <div style={{fontSize:20, fontWeight:700, color:C.darkGrey}}>Chargement...</div>
      </div>;
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Poppins, sans-serif" }}>

      {/* ── Notification toast ── */}
      {notification && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:9999,
          background:notification.color, color:notification.color === "#FF6B6B" ? C.white : C.black,
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
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:C.white}}>{user?.username}</div>
              <div style={{fontSize:10, color:C.lightGrey}}>Employé</div>
            </div>
          </div>
          <button onClick={logout} style={{
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
              Bienvenue, {user?.username} 👋
            </div>
            <div style={{fontSize:14, color:"rgba(0,0,0,0.65)", fontWeight:600, marginTop:4}}>
              Prêt pour une nouvelle mission aujourd'hui ?
            </div>
          </div>
          <div style={{fontSize:48}}>🚛</div>
        </div>

        {/* ── Stats ── */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32}}>
          <StatCard label="Disponibles" value={availableMissions.length} icon="📋" accent={C.yellow} />
          <StatCard label="Mes missions" value={myMissions.length} icon="👷" accent={C.darkYellow} />
          <StatCard label="Terminées" value={completedMissions.length} icon="✅" accent="#188A18" />
        </div>

        {/* ── Tabs ── */}
        <div style={{display:"flex", gap:10, marginBottom:24, flexWrap:"wrap"}}>
          <TabBtn id="available" label="🟡 Disponibles" count={availableMissions.length} />
          <TabBtn id="mine"      label="👷 Mes Missions" count={myMissions.length} />
          <TabBtn id="history"   label="📂 Historique" count={completedMissions.length} />
        </div>

        {/* ── Content ── */}
        {tab==="history" ? (
          <HistoryPanel items={completedMissions} />
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
                : "Vous n'avez aucune mission active."}
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
                currentUser={user?.username}
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
      `}</style>
    </div>
  );
};

export default Dashboard;
