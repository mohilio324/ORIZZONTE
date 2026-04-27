const logo = '/images/logo.svg'; 
import { useState, useEffect, useRef } from "react";

// ── LOGO SVG (your uploaded cargo-truck_6.svg embedded) ──────────
const LOGO_SVG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmcAAAGWCAYAAAA9lCQwAAAQAElEQVR4AexdB4AURdp9Vd09MxsIElVQOcWEWc6AeorhVDzjKZ45ncIZMJ2C4VfGcAomFEzgGc5wKHuenjmLOSJGTJhRJIdNM9PdVf/7emaWBTEhKLtbTb+uHL7XNV1vv55dNNzhGHAMOAYcA44Bx4BjwDGw3DDgxNlycyvcRBwDjgHHQEtjwNnjGHAMLAkDTpwtCWuujWPAMeAYcAw4BhwDjoFlxIATZ8uIWNdty2LAWeMYcAw4BhwDjoFfiwEnzn4tpt04jgHHgGPAMeAYcAw4Br7LwHdynDj7DiUuwzHgGHAMOAYcA44Bx8Bvx4ATZ78d925kx4BjwDHQshhw1jgGHANLhQEnzpYKja4Tx4BjwDHgGHAMOAYcA0uHASfOlg6PrpeWxYCzxjHgGHAMOAYcA4IBJQFqUkdE4AAAAASUVORK5CYII=`;

// ─── CSS-in-JS styles ───────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  :root {
    --yellow:#FFAD01; --yellow-dark:#D2940C; --grey-dark:#544E51;
    --grey-light:#B8B8B8; --black:#1a1a1a; --white:#fff; --bg:#F7F7F7;
    --sidebar-w:260px; --radius:14px;
    --shadow:0 4px 24px rgba(84,78,81,.10);
    --shadow-hover:0 8px 32px rgba(84,78,81,.18);
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--black);}
  /* LOGIN */
  .login-wrap{position:fixed;inset:0;background:linear-gradient(135deg,var(--grey-dark),#2d292b);display:flex;align-items:center;justify-content:center;z-index:999;}
  .login-card{background:#fff;border-radius:22px;width:420px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35);animation:pop .5s cubic-bezier(.34,1.56,.64,1);}
  @keyframes pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
  .login-top{background:linear-gradient(135deg,var(--yellow),var(--yellow-dark));padding:32px 36px 24px;text-align:center;}
  .login-top h1{font-size:22px;font-weight:800;color:#000;margin-top:10px;}
  .login-top p{font-size:12px;color:rgba(0,0,0,.55);margin-top:3px;}
  .login-badge{display:inline-block;margin-top:10px;background:rgba(0,0,0,.12);border-radius:50px;padding:3px 14px;font-size:11px;font-weight:600;color:#000;}
  .login-body{padding:28px 36px 32px;}
  .form-group{margin-bottom:16px;}
  .form-group label{display:block;font-size:12px;font-weight:600;color:var(--grey-dark);margin-bottom:5px;}
  .form-group input{width:100%;padding:11px 14px;border:2px solid #e8e8e8;border-radius:9px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;background:#fafafa;transition:border-color .2s;}
  .form-group input:focus{border-color:var(--yellow);background:#fff;}
  .login-btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--yellow),var(--yellow-dark));border:none;border-radius:9px;font-family:'Poppins',sans-serif;font-size:15px;font-weight:700;color:#000;cursor:pointer;box-shadow:0 4px 16px rgba(255,173,1,.4);transition:transform .15s,box-shadow .15s;}
  .login-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,173,1,.5);}
  .login-error{background:#fff0f0;border:1px solid #ffccc7;border-radius:8px;padding:10px 14px;font-size:12px;color:#c0392b;margin-bottom:14px;font-weight:500;}
  .login-logo-row{display:flex;align-items:center;justify-content:center;gap:8px;}
  .login-logo-row img{height:52px;object-fit:contain;}
  /* APP */
  .app{display:flex;height:100vh;}
  /* SIDEBAR */
  .sidebar{width:var(--sidebar-w);background:var(--grey-dark);display:flex;flex-direction:column;height:100vh;position:fixed;left:0;top:0;z-index:100;box-shadow:4px 0 20px rgba(0,0,0,.15);}
  .sidebar-logo{padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px;}
  .sidebar-logo img{height:44px;object-fit:contain;} /* Removed the white invert filter */
  .sidebar-logo-text span{display:block;font-size:17px;font-weight:800;color:#000;letter-spacing:.4px;} /* Changed yellow to black */
  .sidebar-logo-text small{display:block;font-size:10px;color:rgba(0,0,0,0.6);font-weight:600;margin-top:1px;} /* Darkened for better contrast against the grey */
  .sidebar-nav{flex:1;padding:10px 0;overflow-y:auto;}
  .nav-section{padding:10px 20px 4px;font-size:10px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:1.2px;text-transform:uppercase;}
  .nav-item{display:flex;align-items:center;gap:11px;padding:11px 20px;cursor:pointer;font-size:13px;font-weight:500;color:rgba(255,255,255,.7);border-left:3px solid transparent;transition:all .2s;user-select:none;}
  .nav-item:hover{background:rgba(255,255,255,.05);color:#fff;}
  .nav-item.active{background:rgba(255,173,1,.13);color:var(--yellow);border-left-color:var(--yellow);font-weight:600;}
  .nav-badge{margin-left:auto;background:var(--yellow);color:#000;font-size:10px;font-weight:700;padding:2px 7px;border-radius:50px;}
  .sidebar-user{padding:14px 20px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px;}
  .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--yellow),var(--yellow-dark));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#000;flex-shrink:0;}
  .user-info{flex:1;min-width:0;}
  .user-info strong{display:block;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .user-info span{font-size:10px;color:var(--grey-light);}
  .logout-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);transition:color .2s;padding:4px;display:flex;}
  .logout-btn:hover{color:#ff6b6b;}
  /* MAIN */
  .main{margin-left:var(--sidebar-w);flex:1;display:flex;flex-direction:column;height:100vh;overflow-y:auto;}
  /* TOPBAR */
  .topbar{background:#fff;padding:14px 26px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 12px rgba(84,78,81,.07);position:sticky;top:0;z-index:50;}
  .topbar-title{flex:1;}
  .topbar-title h2{font-size:19px;font-weight:700;}
  .topbar-title p{font-size:11px;color:var(--grey-light);margin-top:1px;}
  .topbar-search{display:flex;align-items:center;gap:7px;background:var(--bg);border:1.5px solid #e8e8e8;border-radius:9px;padding:7px 12px;transition:border-color .2s;}
  .topbar-search:focus-within{border-color:var(--yellow);}
  .topbar-search input{border:none;background:none;outline:none;font-family:'Poppins',sans-serif;font-size:13px;width:180px;}
  /* PAGES */
  .page{padding:22px 26px;animation:fadeIn .3s ease;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
  /* STAT CARDS */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px;}
  .stat-card{background:#fff;border-radius:var(--radius);padding:20px 18px;box-shadow:var(--shadow);border-bottom:3px solid transparent;transition:transform .2s,box-shadow .2s;}
  .stat-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-hover);}
  .stat-card.yellow{border-bottom-color:var(--yellow);}
  .stat-card.green{border-bottom-color:#2ecc71;}
  .stat-card.blue{border-bottom-color:#3498db;}
  .stat-card.red{border-bottom-color:#e74c3c;}
  .stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:19px;}
  .stat-icon.yellow{background:rgba(255,173,1,.15);}
  .stat-icon.green{background:rgba(46,204,113,.12);}
  .stat-icon.blue{background:rgba(52,152,219,.12);}
  .stat-icon.red{background:rgba(231,76,60,.12);}
  .stat-value{font-size:26px;font-weight:800;line-height:1;}
  .stat-label{font-size:12px;color:var(--grey-light);margin-top:4px;font-weight:500;}
  .stat-trend{font-size:11px;font-weight:600;margin-top:6px;}
  .stat-trend.up{color:#2ecc71;}
  /* SECTION HEADER */
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .section-header h3{font-size:15px;font-weight:700;}
  .section-header p{font-size:11px;color:var(--grey-light);margin-top:2px;}
  /* BUTTONS */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;transition:all .2s;}
  .btn-primary{background:linear-gradient(135deg,var(--yellow),var(--yellow-dark));color:#000;box-shadow:0 3px 12px rgba(255,173,1,.3);}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(255,173,1,.4);}
  .btn-outline{background:transparent;color:var(--grey-dark);border:1.5px solid #e8e8e8;}
  .btn-outline:hover{border-color:var(--yellow);color:var(--yellow-dark);}
  .btn-danger{background:#fff0f0;color:#e74c3c;border:1.5px solid #ffccc7;}
  .btn-danger:hover{background:#e74c3c;color:#fff;}
  .btn-sm{padding:5px 11px;font-size:11px;border-radius:7px;}
  /* TABLES */
  .table-wrap{background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;}
  table{width:100%;border-collapse:collapse;}
  th{background:var(--bg);padding:11px 15px;text-align:left;font-size:11px;font-weight:600;color:var(--grey-dark);letter-spacing:.5px;text-transform:uppercase;border-bottom:1px solid #efefef;}
  td{padding:12px 15px;font-size:13px;border-bottom:1px solid #f5f5f5;vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:rgba(255,173,1,.03);}
  /* BADGES */
  .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:50px;font-size:11px;font-weight:600;}
  .badge::before{content:'';width:6px;height:6px;border-radius:50%;}
  .badge-pending{background:#fff8e6;color:#d2940c;}.badge-pending::before{background:#d2940c;}
  .badge-confirmed{background:#e8f8f0;color:#27ae60;}.badge-confirmed::before{background:#27ae60;}
  .badge-progress{background:#e8f4ff;color:#2980b9;}.badge-progress::before{background:#2980b9;}
  .badge-done{background:#f0f0f0;color:#7f8c8d;}.badge-done::before{background:#7f8c8d;}
  /* CHARTS */
  .charts-grid{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:22px;}
  .chart-card{background:#fff;border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);}
  .chart-card h4{font-size:14px;font-weight:700;margin-bottom:3px;}
  .chart-card p{font-size:11px;color:var(--grey-light);margin-bottom:16px;}
  .bar-chart{display:flex;align-items:flex-end;gap:8px;height:110px;padding-bottom:22px;}
  .bar{flex:1;border-radius:6px 6px 0 0;position:relative;cursor:pointer;transition:opacity .2s;}
  .bar:hover{opacity:.8;}
  .bar-label{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:var(--grey-light);white-space:nowrap;}
  .bar-val{position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:var(--grey-dark);}
  .donut-legend .legend-item{display:flex;align-items:center;gap:7px;font-size:11px;margin-bottom:5px;}
  .legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  /* EMPLOYEE CARDS */
  .employees-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
  .emp-card{background:#fff;border-radius:var(--radius);padding:18px;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s;}
  .emp-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-hover);}
  .emp-top{display:flex;align-items:center;gap:11px;margin-bottom:13px;}
  .emp-avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--yellow),var(--yellow-dark));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#000;flex-shrink:0;}
  .emp-info strong{display:block;font-size:14px;font-weight:700;}
  .emp-info span{font-size:12px;color:var(--grey-light);}
  .emp-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px;}
  .emp-stat{background:var(--bg);border-radius:8px;padding:7px 10px;text-align:center;}
  .emp-stat strong{display:block;font-size:15px;font-weight:700;}
  .emp-stat span{font-size:10px;color:var(--grey-light);}
  .emp-actions{display:flex;gap:7px;}
  /* MODAL */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);}
  .modal{background:#fff;border-radius:18px;width:470px;max-width:95vw;box-shadow:0 24px 80px rgba(0,0,0,.25);animation:pop .3s cubic-bezier(.34,1.56,.64,1);max-height:90vh;overflow-y:auto;}
  .modal-header{padding:20px 22px 14px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between;}
  .modal-header h3{font-size:15px;font-weight:700;}
  .modal-close{background:none;border:none;cursor:pointer;font-size:20px;color:var(--grey-light);transition:color .2s;line-height:1;}
  .modal-close:hover{color:#000;}
  .modal-body{padding:20px 22px;}
  .modal-footer{padding:14px 22px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:10px;}
  /* FORM */
  .field{margin-bottom:14px;}
  .field label{display:block;font-size:12px;font-weight:600;color:var(--grey-dark);margin-bottom:5px;}
  .field input,.field select,.field textarea{width:100%;padding:10px 13px;border:2px solid #e8e8e8;border-radius:8px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;background:#fafafa;transition:border-color .2s;}
  .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--yellow);background:#fff;}
  .field textarea{resize:vertical;min-height:72px;}
  .field-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
  /* TOAST */
  .toast{position:fixed;bottom:22px;right:22px;background:var(--grey-dark);color:#fff;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;z-index:500;display:flex;align-items:center;gap:9px;box-shadow:0 8px 32px rgba(0,0,0,.2);transition:all .35s cubic-bezier(.34,1.56,.64,1);}
  .toast.show{transform:translateY(0);opacity:1;}
  .toast.hide{transform:translateY(80px);opacity:0;}
  /* TABS */
  .tabs{display:flex;gap:4px;background:var(--bg);padding:4px;border-radius:9px;margin-bottom:18px;width:fit-content;}
  .tab{padding:6px 16px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;color:var(--grey-dark);transition:all .2s;user-select:none;}
  .tab.active{background:#fff;color:var(--yellow-dark);box-shadow:0 2px 8px rgba(84,78,81,.1);}
  /* TIMELINE */
  .timeline{display:flex;flex-direction:column;}
  .tl-item{display:flex;gap:14px;padding-bottom:18px;position:relative;}
  .tl-item::before{content:'';position:absolute;left:15px;top:32px;bottom:0;width:2px;background:#f0f0f0;}
  .tl-item:last-child::before{display:none;}
  .tl-dot{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;z-index:1;}
  .tl-dot.green{background:rgba(46,204,113,.15);border:2px solid #2ecc71;}
  .tl-dot.yellow{background:rgba(255,173,1,.2);border:2px solid var(--yellow);}
  .tl-dot.blue{background:rgba(52,152,219,.12);border:2px solid #3498db;}
  .tl-content{flex:1;padding-top:4px;}
  .tl-content strong{display:block;font-size:13px;font-weight:600;}
  .tl-content p{font-size:12px;color:var(--grey-light);margin-top:2px;}
  .tl-time{font-size:11px;color:var(--grey-light);white-space:nowrap;padding-top:6px;}
  /* ACTIVITY */
  .activity-feed{display:flex;flex-direction:column;gap:11px;}
  .activity-item{display:flex;align-items:flex-start;gap:11px;}
  .activity-dot{width:34px;height:34px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;}
  .activity-dot.yellow{background:rgba(255,173,1,.15);}
  .activity-dot.green{background:rgba(46,204,113,.12);}
  .activity-dot.blue{background:rgba(52,152,219,.12);}
  .activity-dot.red{background:rgba(231,76,60,.12);}
  .activity-content{flex:1;}
  .activity-content strong{font-size:13px;font-weight:600;display:block;}
  .activity-content span{font-size:11px;color:var(--grey-light);}
  .activity-time{font-size:11px;color:var(--grey-light);white-space:nowrap;}
  /* SETTINGS */
  .settings-card{background:#fff;border-radius:var(--radius);padding:22px;box-shadow:var(--shadow);margin-bottom:14px;}
  .settings-card h4{font-size:14px;font-weight:700;margin-bottom:14px;}
  /* CONFIRM DIALOG */
  .confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .confirm-box{background:#fff;border-radius:16px;width:380px;padding:28px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.3);animation:pop .3s cubic-bezier(.34,1.56,.64,1);}
  .confirm-icon{font-size:40px;margin-bottom:12px;}
  .confirm-box h3{font-size:16px;font-weight:700;margin-bottom:8px;}
  .confirm-box p{font-size:13px;color:var(--grey-light);margin-bottom:22px;}
  .confirm-actions{display:flex;gap:10px;justify-content:center;}
`;

// ── ICON COMPONENTS ──────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const icons = {
  dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  requests: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  employees: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  revenue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  plus: "M12 5v14M5 12h14",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  download: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

// ── INITIAL DATA ─────────────────────────────────────────────────
const INITIAL_EMPLOYEES = [
  { id: 1, name: "Mehdi Cherbi", role: "🚛 Driver — Senior", initials: "MC", missions: 24 },
  { id: 2, name: "Abdellah Chenane", role: "📦 Packing Specialist", initials: "AC", missions: 19 },
  { id: 3, name: "Lyamine Zerrouki", role: "🚛 Driver — Junior", initials: "LZ", missions: 7 },
  { id: 4, name: "Mouhamed Chekirou", role: "🔧 Logistics Manager", initials: "MK", missions: 31 },
  { id: 5, name: "Diaa Chouabbi", role: "📋 Operations", initials: "DC", missions: 14 },
];
const REQUESTS = [
  { id: "#1047", client: "Karim Benali", email: "karim@email.com", service: "Residential", route: "Algiers → Blida", date: "28 Apr 2026", assigned: null, status: "pending" },
  { id: "#1046", client: "Sara Mansouri", email: "sara@email.com", service: "Freight", route: "Oran → Sétif", date: "29 Apr 2026", assigned: "Abdellah Chenane", status: "confirmed" },
  { id: "#1045", client: "Yacine Lariane", email: "yacine@email.com", service: "Corporate", route: "Constantine → Annaba", date: "26 Apr 2026", assigned: "Mehdi Cherbi", status: "progress" },
  { id: "#1044", client: "Amira Zerrouki", email: "amira@email.com", service: "Prof. Packing", route: "Sétif → Algiers", date: "24 Apr 2026", assigned: "Mouhamed Chekirou", status: "done" },
  { id: "#1043", client: "Farid Chouabbi", email: "farid@email.com", service: "Vehicle Transport", route: "Tizi → Béjaïa", date: "30 Apr 2026", assigned: null, status: "pending" },
];

// ── BADGE ────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = { pending: ["badge-pending", "Pending"], confirmed: ["badge-confirmed", "Confirmed"], progress: ["badge-progress", "In Progress"], done: ["badge-done", "Completed"] };
  const [cls, label] = map[status] || ["badge-done", status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ── BAR CHART ────────────────────────────────────────────────────
const BarChart = ({ data, color = "#FFAD01", activeColor = "#FFAD01" }) => {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar" style={{ height: Math.round((d.v / max) * 105) + "px", background: i === data.length - 1 ? activeColor : color + "44" }}>
          <span className="bar-val">{d.v}</span>
          <span className="bar-label">{d.l}</span>
        </div>
      ))}
    </div>
  );
};

// ── TOAST ────────────────────────────────────────────────────────
const Toast = ({ msg, show }) => (
  <div className={`toast ${show ? "show" : "hide"}`}>
    <span>{msg}</span>
  </div>
);

// ── CONFIRM DIALOG ───────────────────────────────────────────────
const ConfirmDialog = ({ name, onConfirm, onCancel }) => (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <div className="confirm-icon">🗑️</div>
      <h3>Remove Employee?</h3>
      <p>Are you sure you want to remove <strong>{name}</strong> from the system? This action cannot be undone.</p>
      <div className="confirm-actions">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Yes, Remove</button>
      </div>
    </div>
  </div>
);

// ── MODAL ────────────────────────────────────────────────────────
const Modal = ({ title, onClose, footer, children }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

// ── ASSIGN MODAL ─────────────────────────────────────────────────
const AssignModal = ({ request, employees, onClose, onConfirm }) => {
  const [emp, setEmp] = useState("");
  const [vehicle, setVehicle] = useState("Fourgon");
  const [notes, setNotes] = useState("");
  return (
    <Modal title={`🚛 Assign Mission ${request.id}`} onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onConfirm(emp, vehicle)}>Confirm Assignment</button></>}>
      <div style={{ background: "var(--bg)", borderRadius: 9, padding: 13, marginBottom: 14, fontSize: 13 }}>
        <strong>{request.client}</strong> — {request.service}<br />
        <span style={{ color: "var(--grey-light)", fontSize: 12 }}>{request.route} · {request.date}</span>
      </div>
      <div className="field"><label>Select Employee</label>
        <select value={emp} onChange={e => setEmp(e.target.value)}>
          <option value="">— Choose available employee —</option>
          {employees.map(e => <option key={e.id} value={e.name}>{e.name} ({e.role.replace(/[🚛📦🔧📋]/g, "").trim()})</option>)}
        </select>
      </div>
      <div className="field"><label>Vehicle Type</label>
        <select value={vehicle} onChange={e => setVehicle(e.target.value)}>
          {["Fourgon (Standard Van)", "Camion (Medium Truck)", "Harbina (Large Truck)"].map(v => <option key={v}>{v}</option>)}
        </select>
      </div>
      <div className="field"><label>Notes for Employee</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions…" />
      </div>
    </Modal>
  );
};

// ── ADD EMPLOYEE MODAL ───────────────────────────────────────────
const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", role: "Driver — Senior", wilaya: "Algiers" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="👤 Register New Employee" onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onAdd(form)}>Register Employee</button></>}>
      <div className="field-row">
        <div className="field"><label>First Name</label><input value={form.firstName} onChange={set("firstName")} placeholder="e.g. Mehdi" /></div>
        <div className="field"><label>Last Name</label><input value={form.lastName} onChange={set("lastName")} placeholder="e.g. Cherbi" /></div>
      </div>
      <div className="field"><label>Email</label><input type="email" value={form.email} onChange={set("email")} placeholder="employee@orizzonte.dz" /></div>
      <div className="field"><label>Phone</label><input value={form.phone} onChange={set("phone")} placeholder="+213…" /></div>
      <div className="field"><label>Role</label>
        <select value={form.role} onChange={set("role")}>
          {["Driver — Senior", "Driver — Junior", "Packing Specialist", "Logistics Manager", "Operations"].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div className="field"><label>Wilaya</label>
        <select value={form.wilaya} onChange={set("wilaya")}>
          {["Algiers", "Oran", "Sétif", "Constantine", "Annaba", "Béjaïa", "Tizi Ouzou", "Blida"].map(w => <option key={w}>{w}</option>)}
        </select>
      </div>
    </Modal>
  );
};

// ── EDIT EMPLOYEE MODAL ──────────────────────────────────────────
const EditEmployeeModal = ({ emp, onClose, onSave }) => {
  const [name, setName] = useState(emp.name);
  const [role, setRole] = useState(emp.role.replace(/[🚛📦🔧📋]\s*/g, ""));
  return (
    <Modal title="✏️ Edit Employee" onClose={onClose}
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave({ ...emp, name, role })}>Save Changes</button></>}>
      <div className="field"><label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="field"><label>Role</label>
        <select value={role} onChange={e => setRole(e.target.value)}>
          {["Driver — Senior", "Driver — Junior", "Packing Specialist", "Logistics Manager", "Operations"].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
    </Modal>
  );
};

// ── REQUEST DETAILS MODAL ────────────────────────────────────────
const DetailsModal = ({ req, onClose }) => (
  <Modal title={`📋 Request Details — ${req.id}`} onClose={onClose}
    footer={<button className="btn btn-outline" onClick={onClose}>Close</button>}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 13 }}>
      {[["CLIENT", <>{req.client}<br /><span style={{ fontSize: 12, color: "var(--grey-light)" }}>{req.email}</span></>],
        ["SERVICE", <>{req.service}<br /><Badge status={req.status} /></>],
        ["ROUTE", <>{req.route}<br /><span style={{ fontSize: 12, color: "var(--grey-light)" }}>~450 km est.</span></>],
        ["DATE", <>{req.date}<br /><span style={{ fontSize: 12, color: "var(--grey-light)" }}>Slot: 08:00 AM</span></>]
      ].map(([label, val], i) => (
        <div key={i} style={{ background: "var(--bg)", borderRadius: 9, padding: 13 }}>
          <div style={{ fontSize: 10, color: "var(--grey-light)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
          <strong style={{ fontSize: 13 }}>{val}</strong>
        </div>
      ))}
    </div>
    <div style={{ background: "var(--bg)", borderRadius: 9, padding: 13, marginBottom: 11 }}>
      <div style={{ fontSize: 10, color: "var(--grey-light)", fontWeight: 600, marginBottom: 4 }}>ASSIGNED</div>
      <strong>{req.assigned || "— Unassigned —"}</strong>
    </div>
    <div style={{ background: "rgba(255,173,1,.08)", border: "1.5px solid rgba(255,173,1,.3)", borderRadius: 9, padding: 13 }}>
      <div style={{ fontSize: 10, color: "var(--yellow-dark)", fontWeight: 600, marginBottom: 4 }}>EST. PRICE</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>47,500 DZD</div>
      <div style={{ fontSize: 11, color: "var(--grey-light)" }}>Includes options + insurance</div>
    </div>
  </Modal>
);

// ══════════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("admin@orizzonte.dz");
  const [pass, setPass] = useState("admin123");
  const [loginErr, setLoginErr] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [requests, setRequests] = useState(REQUESTS);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [modal, setModal] = useState(null); // null | {type, data}
  const [confirm, setConfirm] = useState(null); // null | {id, name}
  const [reqFilter, setReqFilter] = useState("all");
  const toastTimer = useRef(null);

  // Inject styles once
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, show: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  // ── AUTH ──────────────────────────────────────────────────────
  const doLogin = () => {
    if (email === "admin@orizzonte.dz" && pass === "admin123") { setAuthed(true); setLoginErr(false); }
    else setLoginErr(true);
  };

  // ── EMPLOYEE ACTIONS ──────────────────────────────────────────
  const deleteEmployee = (id) => {
    setEmployees(e => e.filter(x => x.id !== id));
    setConfirm(null);
    showToast("🗑️ Employee removed successfully");
  };
  const addEmployee = (form) => {
    const name = `${form.firstName} ${form.lastName}`.trim() || "New Employee";
    const initials = (form.firstName[0] || "N") + (form.lastName[0] || "E");
    const roleIcons = { "Driver — Senior": "🚛", "Driver — Junior": "🚛", "Packing Specialist": "📦", "Logistics Manager": "🔧", "Operations": "📋" };
    setEmployees(e => [...e, { id: Date.now(), name, role: `${roleIcons[form.role] || "👤"} ${form.role}`, initials: initials.toUpperCase(), missions: 0 }]);
    setModal(null);
    showToast("👤 New employee registered!");
  };
  const editEmployee = (updated) => {
    setEmployees(e => e.map(x => x.id === updated.id ? { ...x, name: updated.name, role: updated.role } : x));
    setModal(null);
    showToast("✅ Employee updated");
  };

  // ── CSV EXPORT ─────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Mission ID", "Client", "Email", "Service", "Route", "Date", "Assigned To", "Status"];
    const rows = requests.map(r => [r.id, r.client, r.email, r.service, r.route, r.date, r.assigned || "Unassigned", r.status]);
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orizzonte_missions.csv"; a.click();
    URL.revokeObjectURL(url);
    showToast("📥 CSV exported successfully");
  };

  // ── ASSIGN ────────────────────────────────────────────────────
  const doAssign = (reqId, emp) => {
    if (!emp) { showToast("⚠️ Please select an employee"); return; }
    setRequests(r => r.map(x => x.id === reqId ? { ...x, assigned: emp, status: "confirmed" } : x));
    setModal(null);
    showToast(`✅ Mission ${reqId} assigned to ${emp}`);
  };

  // ── FILTERED REQUESTS ─────────────────────────────────────────
  const filteredReqs = reqFilter === "all" ? requests : requests.filter(r => r.status === reqFilter);
  const countByStatus = s => requests.filter(r => r.status === s).length;

  // ── PAGE META ─────────────────────────────────────────────────
  const pageTitles = {
    dashboard: { title: "Dashboard", sub: "Overview of all operations — April 2026" },
    requests: { title: "All Requests", sub: "Manage and assign incoming missions" },
    employees: { title: "Employee Management", sub: "Register and monitor your logistics team" },
    history: { title: "Mission History", sub: "Full chronological log" },
    revenue: { title: "Revenue", sub: "Financial performance overview" },
    settings: { title: "Settings", sub: "Configure platform parameters" },
  };
  const { title, sub } = pageTitles[page] || { title: page, sub: "" };

  // ══════════════════════════════════════════════════════════════
  //  LOGIN SCREEN
  // ══════════════════════════════════════════════════════════════
  if (!authed) return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-top">
          <div className="login-logo-row">
            <img src={`data:image/svg+xml;utf8,${encodeURIComponent(`<svg width="170" height="110" viewBox="0 0 170 110" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="-58" width="228" height="110" fill="url(#p)"/><defs><pattern id="p" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#i" transform="matrix(0.00162602 0 0 0.00337029 0 -0.184169)"/></pattern><image id="i" width="615" height="406" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmcAAAGWCAYAAAA9lCQwAAAQAElEQVR4AexdB4AURdp9Vd09MxsIElVQOcWEWc6AeorhVDzjKZ45ncIZMJ2C4VfGcAomFEzgGc5wKHuenjmLOSJGTJhRJIdNM9PdVf/7emaWBTEhKLtbTb+uHL7XNV1vv55dNNzhGHAMOAYcA44Bx4BjwDGw3DDgxNlycyvcRBwDjgHHQEtjwNnjGHAMLAkDTpwtCWuujWPAMeAYcAw4BhwDjoFlxIATZ8uIWNdty2LAWeMYcAw4BhwDjoFfiwEnzn4tpt04jgHHgGPAMeAYcAw4Br7LwHdynDj7DiUuwzHgGHAMOAYcA44Bx8Bvx4ATZ78d925kx4BjwDHQshhw1jgGHANLhQEnzpYKja4Tx4BjwDHgGHAMOAYcA0uHASfOlg6PrpeWxYCzxjHgGHAMOAYcA44BB4D2AAABAA=="/></defs></svg>`)}`} alt="ORIZZONTE" style={{ height: 52, objectFit: "contain" }} />
          </div>
          <h1>ORIZZONTE</h1>
          <p>Modern Logistics Platform · Algeria</p>
          <div className="login-badge">🔐 Admin Portal</div>
        </div>
        <div className="login-body">
          {loginErr && <div className="login-error">⚠️ Invalid credentials. Please try again.</div>}
          <div className="form-group"><label>Admin Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
          </div>
          <div className="form-group"><label>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
          </div>
          <button className="login-btn" onClick={doLogin}>Sign In as Administrator</button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  //  MAIN APP
  // ══════════════════════════════════════════════════════════════
  const navItems = [
    { section: "OVERVIEW" },
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { id: "requests", label: "All Requests", icon: icons.requests, badge: countByStatus("pending") },
    { section: "MANAGEMENT" },
    { id: "employees", label: "Employees", icon: icons.employees },
    { id: "history", label: "Mission History", icon: icons.history },
    { id: "revenue", label: "Revenue", icon: icons.revenue },
    { section: "SETTINGS" },
    { id: "settings", label: "Settings", icon: icons.settings },
  ];

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
       <img src={logo} alt="Orizzonte Logo" width="200px" />
          <div className="sidebar-logo-text">
            <span>ORIZZONTE</span>
            <small>Admin Dashboard</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section">{item.section}</div>
            ) : (
              <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
                <Icon d={item.icon} />
                {item.label}
                {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
              </div>
            )
          )}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <strong>Admin ORIZZONTE</strong>
            <span>SUPER ADMINISTRATEUR</span>
          </div>
          <button className="logout-btn" onClick={() => setAuthed(false)} title="Logout">
            <Icon d={icons.logout} size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-title">
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
          <div className="topbar-search">
            <Icon d={icons.search} size={14} />
            <input placeholder="Search missions, employees…" />
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        {page === "dashboard" && (
          <div className="page">
            <div className="stats-grid">
              {[
                { color: "yellow", icon: "📦", val: requests.length + 120, label: "Total Missions", trend: "↑ +12 this month" },
                { color: "green", icon: "✅", val: countByStatus("done") + 95, label: "Completed", trend: "↑ 66.7% rate" },
                { color: "blue", icon: "🚛", val: countByStatus("progress") + 31, label: "Active Missions", trend: "↑ 8 confirmed today" },
                { color: "red", icon: "💰", val: "2.4M", label: "Revenue (DZD)", trend: "↑ +18% vs last month" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.color}`}>
                  <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-trend up">{s.trend}</div>
                </div>
              ))}
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h4>Monthly Missions</h4>
                <p>Completed vs Pending — 2026</p>
                <BarChart data={[{ l: "Jan", v: 18 }, { l: "Feb", v: 24 }, { l: "Mar", v: 31 }, { l: "Apr", v: 47 }]} />
              </div>
              <div className="chart-card">
                <h4>Service Distribution</h4>
                <p>By type this month</p>
                <svg viewBox="0 0 36 36" style={{ width: 110, height: 110, display: "block", margin: "0 auto 12px" }}>
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
                  {[["#FFAD01", "45 55", "25"], ["#544E51", "28 72", "-20"], ["#3498db", "17 83", "-48"], ["#2ecc71", "10 90", "-65"]].map(([col, da, off], i) => (
                    <circle key={i} cx="18" cy="18" r="15.9155" fill="none" stroke={col} strokeWidth="3.5" strokeDasharray={da} strokeDashoffset={off} strokeLinecap="round" />
                  ))}
                </svg>
                <div className="donut-legend">
                  {[["#FFAD01", "Residential — 45%"], ["#544E51", "Corporate — 28%"], ["#3498db", "Freight — 17%"], ["#2ecc71", "Packing — 10%"]].map(([c, l], i) => (
                    <div key={i} className="legend-item"><div className="legend-dot" style={{ background: c }} />{l}</div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div className="section-header">
                  <div><h3>Recent Requests</h3><p>Last 5 incoming missions</p></div>
                  <button className="btn btn-outline btn-sm" onClick={() => setPage("requests")}>View all</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Client</th><th>Service</th><th>Status</th></tr></thead>
                    <tbody>
                      {requests.slice(0, 5).map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.client}</strong><br /><span style={{ fontSize: 11, color: "var(--grey-light)" }}>{r.route}</span></td>
                          <td>{r.service}</td>
                          <td><Badge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="section-header"><div><h3>Live Activity</h3><p>Real-time events</p></div></div>
                <div style={{ background: "#fff", borderRadius: "var(--radius)", padding: 18, boxShadow: "var(--shadow)" }}>
                  <div className="activity-feed">
                    {[
                      ["yellow", "📦", "New request #1047", "Karim B. — Residential", "2m ago"],
                      ["green", "✅", "Mission #1044 Completed", "Assigned to: Mouhamed K.", "18m ago"],
                      ["blue", "👤", "New employee registered", "Lyamine Z. — Driver", "1h ago"],
                      ["red", "💰", "Invoice generated #1043", "Amount: 42,500 DZD", "2h ago"],
                      ["yellow", "🚛", "Mission #1041 Confirmed", "Yacine L. — Corporate", "3h ago"],
                    ].map(([color, icon, title, sub, time], i) => (
                      <div key={i} className="activity-item">
                        <div className={`activity-dot ${color}`}>{icon}</div>
                        <div className="activity-content"><strong>{title}</strong><span>{sub}</span></div>
                        <div className="activity-time">{time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {page === "requests" && (
          <div className="page">
            <div className="tabs">
              {[["all", `All (${requests.length})`], ["pending", `Pending (${countByStatus("pending")})`], ["confirmed", `Confirmed (${countByStatus("confirmed")})`], ["progress", `In Progress (${countByStatus("progress")})`], ["done", `Completed (${countByStatus("done")})`]].map(([v, l]) => (
                <div key={v} className={`tab ${reqFilter === v ? "active" : ""}`} onClick={() => setReqFilter(v)}>{l}</div>
              ))}
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Client</th><th>Service</th><th>Route</th><th>Date</th><th>Assigned To</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredReqs.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.id}</strong></td>
                      <td><strong>{r.client}</strong><br /><span style={{ fontSize: 11, color: "var(--grey-light)" }}>{r.email}</span></td>
                      <td>{r.service}</td>
                      <td>{r.route}</td>
                      <td>{r.date}</td>
                      <td>{r.assigned || <span style={{ color: "var(--grey-light)", fontSize: 12 }}>— Unassigned —</span>}</td>
                      <td><Badge status={r.status} /></td>
                      <td style={{ display: "flex", gap: 6 }}>
                        {r.status === "pending" && <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: "assign", data: r })}>Assign</button>}
                        <button className="btn btn-outline btn-sm" onClick={() => setModal({ type: "details", data: r })}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EMPLOYEES ── */}
        {page === "employees" && (
          <div className="page">
            <div className="section-header">
              <div><h3>Employee Management</h3><p>Register and monitor your logistics team</p></div>
              <button className="btn btn-primary" onClick={() => setModal({ type: "addEmp" })}>
                <Icon d={icons.plus} size={14} /> Add Employee
              </button>
            </div>
            <div className="employees-grid">
              {employees.map(e => (
                <div key={e.id} className="emp-card">
                  <div className="emp-top">
                    <div className="emp-avatar">{e.initials}</div>
                    <div className="emp-info"><strong>{e.name}</strong><span>{e.role}</span></div>
                  </div>
                  <div className="emp-stats">
                    <div className="emp-stat"><strong>{e.missions}</strong><span>Missions</span></div>
                    <div className="emp-stat"><strong>—</strong><span>Assigned</span></div>
                  </div>
                  <div className="emp-actions">
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setModal({ type: "editEmp", data: e })}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ id: e.id, name: e.name })}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {page === "history" && (
          <div className="page">
            <div className="section-header">
              <div><h3>Mission History</h3><p>Full chronological log</p></div>
              <button className="btn btn-outline" onClick={exportCSV}><Icon d={icons.download} size={13} /> Export CSV</button>
            </div>
            <div style={{ background: "#fff", borderRadius: "var(--radius)", padding: 22, boxShadow: "var(--shadow)" }}>
              <div className="timeline">
                {[
                  ["green", "✅", "#1044 — Sétif → Algiers — Completed", "Client: Amira Z. · Employee: Mouhamed K. · Revenue: 38,000 DZD", "24 Apr 2026"],
                  ["yellow", "📦", "#1043 — Tizi → Béjaïa — Confirmed", "Client: Farid C. · Awaiting assignment · Est. 45,000 DZD", "23 Apr 2026"],
                  ["blue", "🚛", "#1042 — Oran → Sétif — In Progress", "Client: Sara M. · Employee: Abdellah C. · Freight", "22 Apr 2026"],
                  ["green", "✅", "#1041 — Constantine → Annaba — Completed", "Client: Yacine L. · Employee: Mehdi C. · Revenue: 62,000 DZD", "21 Apr 2026"],
                  ["green", "✅", "#1040 — Algiers → Blida — Completed", "Client: Nour H. · Employee: Lyamine Z. · Revenue: 28,000 DZD", "20 Apr 2026"],
                ].map(([color, icon, title, desc, time], i) => (
                  <div key={i} className="tl-item">
                    <div className={`tl-dot ${color}`}>{icon}</div>
                    <div className="tl-content"><strong>{title}</strong><p>{desc}</p></div>
                    <div className="tl-time">{time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REVENUE ── */}
        {page === "revenue" && (
          <div className="page">
            <div className="stats-grid">
              {[
                { color: "yellow", icon: "💰", val: "2.4M", label: "Total Revenue (DZD)", trend: "↑ April 2026" },
                { color: "green", icon: "📋", val: "98", label: "Missions Billed", trend: "↑ All paid" },
                { color: "blue", icon: "📊", val: "24,490", label: "Avg/Mission (DZD)", trend: "↑ +8% vs March" },
                { color: "red", icon: "🎯", val: "147%", label: "Target Achievement", trend: "↑ Above quota" },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.color}`}>
                  <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-trend up">{s.trend}</div>
                </div>
              ))}
            </div>
            <div className="chart-card" style={{ marginBottom: 16 }}>
              <h4>Revenue by Month — 2026</h4>
              <p>DZD cumulative earnings</p>
              <BarChart data={[{ l: "Jan", v: 820 }, { l: "Feb", v: 1100 }, { l: "Mar", v: 1650 }, { l: "Apr", v: 2400 }]} />
            </div>
            <div className="section-header"><div><h3>Recent Billing</h3><p>Completed mission invoices</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mission</th><th>Client</th><th>Amount (DZD)</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {[["#1044", "Amira Zerrouki", "38,000", "24 Apr 2026"], ["#1041", "Yacine Lariane", "62,000", "21 Apr 2026"], ["#1040", "Nour Haddadi", "28,000", "20 Apr 2026"]].map(([id, client, amount, date], i) => (
                    <tr key={i}>
                      <td><strong>{id}</strong></td>
                      <td>{client}</td>
                      <td><strong>{amount}</strong></td>
                      <td>{date}</td>
                      <td><Badge status="confirmed" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {page === "settings" && (
          <div className="page">
            <div style={{ maxWidth: 560 }}>
              <div className="settings-card">
                <h4>Pricing Configuration</h4>
                <div className="field-row">
                  <div className="field"><label>Base Rate (DZD/km)</label><input type="number" defaultValue="45" /></div>
                  <div className="field"><label>Premium Markup (%)</label><input type="number" defaultValue="25" /></div>
                </div>
                <div className="field"><label>Min. Mission Price (DZD)</label><input type="number" defaultValue="8000" /></div>
                <button className="btn btn-primary" onClick={() => showToast("✅ Settings saved")}>Save Changes</button>
              </div>
              <div className="settings-card">
                <h4>Admin Account</h4>
                <div className="field"><label>Full Name</label><input defaultValue="Admin ORIZZONTE" /></div>
                <div className="field"><label>Email</label><input type="email" defaultValue="admin@orizzonte.dz" /></div>
                <div className="field"><label>New Password</label><input type="password" placeholder="Leave blank to keep current" /></div>
                <button className="btn btn-primary" onClick={() => showToast("✅ Account updated")}>Update Account</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {modal?.type === "assign" && (
        <AssignModal request={modal.data} employees={employees} onClose={() => setModal(null)} onConfirm={(emp) => doAssign(modal.data.id, emp)} />
      )}
      {modal?.type === "details" && (
        <DetailsModal req={modal.data} onClose={() => setModal(null)} />
      )}
      {modal?.type === "addEmp" && (
        <AddEmployeeModal onClose={() => setModal(null)} onAdd={addEmployee} />
      )}
      {modal?.type === "editEmp" && (
        <EditEmployeeModal emp={modal.data} onClose={() => setModal(null)} onSave={editEmployee} />
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirm && (
        <ConfirmDialog name={confirm.name} onConfirm={() => deleteEmployee(confirm.id)} onCancel={() => setConfirm(null)} />
      )}

      {/* ── TOAST ── */}
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}

