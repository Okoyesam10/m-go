// Connects M.Go to Firebase: anonymous sign-in for player ids, Firestore for live shared tables.
(function(){
  var cfg = window.MGO_FIREBASE;
  if (!cfg || !cfg.apiKey || /^PASTE/.test(cfg.apiKey) || !window.firebase) {
    window.MGO_SETUP_MISSING = true;
    window.claude = { use: async function(){ return null; } };
    return;
  }
  firebase.initializeApp(cfg);
  var fs = firebase.firestore(), auth = firebase.auth();
  var ready = new Promise(function(res){
    auth.onAuthStateChanged(function(u){ if (u) res(u); });
    auth.signInAnonymously().catch(function(e){ console.error(e); res(null); });
  });
  function wrap(s){ return { id: s.id, exists: s.exists, data: function(){ return s.exists ? s.data() : undefined; }, metadata: { fromCache: s.metadata.fromCache, hasPendingWrites: s.metadata.hasPendingWrites } }; }
  function err(e){ return { code: e && e.code === 'permission-denied' ? 'invalid_argument' : 'unavailable', message: String(e && e.message || e) }; }
  function doc(path){
    var r = fs.doc(path);
    return {
      id: r.id, path: path,
      get: async function(){ return wrap(await r.get()); },
      set: async function(d){ try { await r.set(d); } catch(e){ throw err(e); } },
      update: async function(d){ try { await r.update(d); } catch(e){ throw err(e); } },
      delete: async function(){ await r.delete(); },
      acquire: async function(){ return { acquired: true }; },
      onSnapshot: function(n, er){ return r.onSnapshot(function(s){ n(wrap(s)); }, function(e){ er && er(err(e)); }); }
    };
  }
  function query(q){
    return {
      where: function(a,b,c){ return query(q.where(a,b,c)); },
      orderBy: function(a,d){ return query(q.orderBy(a,d)); },
      limit: function(n){ return query(q.limit(n)); },
      get: async function(){ var s = await q.get(); return { docs: s.docs.map(wrap), size: s.size, empty: s.empty }; },
      onSnapshot: function(n, er){ return q.onSnapshot(function(s){ n({ docs: s.docs.map(wrap), size: s.size, empty: s.empty }); }, function(e){ er && er(err(e)); }); }
    };
  }
  var db = {
    doc: doc,
    collection: function(p){ return query(fs.collection(p)); },
    // Atomic read-modify-write so two phones can't overwrite each other's moves.
    transact: async function(path, fn){
      var r = fs.doc(path), out;
      try {
        await fs.runTransaction(async function(t){
          var s = await t.get(r); out = undefined;
          if (!s.exists) { out = 'This table no longer exists.'; return; }
          var d = JSON.parse(JSON.stringify(s.data()));
          var e = fn(d); if (e) { out = e; return; }
          t.set(r, d);
        });
      } catch(e){ throw err(e); }
      return out;
    }
  };
  var user = {
    isOwner: async function(){ return false; },
    canEdit: async function(){ return true; },
    can: async function(){ return true; },
    id: async function(){ var u = await ready; return u ? u.uid : null; },
    me: async function(){ var u = await ready; return { id: u ? u.uid : null, name: '', email: null, avatarUrl: '', color: '#888', isOwner: false, canEdit: true }; },
    profiles: async function(ids){ var o = {}; [].concat(ids).forEach(function(i){ o[i] = { id: i, name: '', avatarUrl: '', color: '#888', email: null, isMe: false, guest: false }; }); return o; }
  };
  window.claude = { use: async function(n){ await ready; return n === 'db' ? db : n === 'user' ? user : null; } };
})();
