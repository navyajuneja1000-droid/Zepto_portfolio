/* zepto × navya — app logic (vanilla JS, hash routing) */
(function () {
  "use strict";
  var D = window.NJ, P = D.person;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var byId = {}; D.products.forEach(function (p) { byId[p.id] = p; if (p.links.length && p.cats.indexOf("live") < 0) p.cats.push("live"); });
  function host(u) { return u.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]; }

  /* product-shot images for cases that have a real pack to show */
  var SHOT = { wowworld: "assets/work/wow-packshot.jpg", prolectro: "assets/work/prolectro-pack.jpg" };
  var CATSHORT = { all: "All", payments: "Payments", build: "0→1", seller: "D2C", gtm: "Pricing", process: "Process", live: "Live", mall: "PhonePe" };

  /* ---------------- storage (per-viewer convenience only) ---------------- */
  function load(k, d) { try { var v = localStorage.getItem("zxn_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem("zxn_" + k, JSON.stringify(v)); } catch (e) {} }
  var S = {
    cart: load("cart", []).filter(function (id) { return byId[id]; }),
    f: { sort: "rel", seller: [], prov: [], q: "" },
    mv: "all", role: "Product Manager", rounds: 2, fltOpen: false
  };

  /* ---------------- icons ---------------- */
  function ic(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>"; }
  var I = {
    search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/>'),
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M13.5 2L4.5 13.5H11L9.5 22l9-11.5H12z"/></svg>',
    cart: ic('<path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>'),
    user: ic('<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="10" r="3.2"/><path d="M6.2 18.6a7 7 0 0 1 11.6 0" stroke-linecap="round"/>'),
    doc: ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke-linejoin="round"/><path d="M14 3v5h5M9 13h6M9 17h4" stroke-linecap="round"/>'),
    chev: ic('<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>'),
    chevD: ic('<path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>'),
    back: ic('<path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>'),
    x: ic('<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>'),
    check: ic('<path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/>'),
    share: ic('<path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7" stroke-linecap="round"/>'),
    mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" stroke-linejoin="round"/>'),
    phone: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke-linejoin="round"/>'),
    linkedin: ic('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2.5 2.5 0 0 1 5 0v4M12 10v7" stroke-linecap="round"/>'),
    ext: ic('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke-linecap="round" stroke-linejoin="round"/>'),
    globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    pin: ic('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.5"/>'),
    filter: ic('<path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round"/>'),
    home: ic('<path d="M3.5 10.5L12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" stroke-linejoin="round"/>'),
    grid: ic('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
    bag: ic('<path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke-linecap="round"/>'),
    star: '<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1-4.5-4.3 6.1-.8z"/></svg>',
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/>'),
    shield: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" stroke-linejoin="round"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke-linecap="round" stroke-linejoin="round"/>'),
    play: ic('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" stroke-linejoin="round"/>'),
    tag: ic('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" stroke-linejoin="round"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7z" fill="#7B2CBF"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" fill="#FF3269"/></svg>'
  };

  /* little outline icons for the category tab strip */
  var TI = {
    all: ic('<path d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8M10 13.5l1.6 1.6 2.9-3" stroke-linecap="round" stroke-linejoin="round"/>'),
    mall: ic('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 8h4a2 2 0 0 1 0 4H9V8zm0 4v5" stroke-linecap="round" stroke-linejoin="round"/>'),
    payments: ic('<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6 15h4" stroke-linecap="round"/>'),
    build: ic('<path d="M12 3c3.2 1.8 4.6 5 4.6 8.6L14.8 14H9.2l-1.8-2.4C7.4 8 8.8 4.8 12 3z" stroke-linejoin="round"/><circle cx="12" cy="9" r="1.6"/><path d="M10 17.5l2 3.5 2-3.5" stroke-linejoin="round"/>'),
    seller: ic('<path d="M4 10v10h16V10M3 10l2-6h14l2 6" stroke-linejoin="round"/><path d="M10 20v-5h4v5" stroke-linejoin="round"/>'),
    gtm: ic('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" stroke-linejoin="round"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
    process: ic('<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M6.5 10v4a3 3 0 0 0 3 3H14" stroke-linecap="round"/>'),
    live: ic('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M6.5 13l3-3 2.5 2.5 4-4.5" stroke-linecap="round" stroke-linejoin="round"/>')
  };

  /* illustrated category tiles (grey squares, like the store) */
  var CT = {
    all: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="26" width="52" height="40" rx="8" fill="#7B2CBF"/><path d="M28 26v-4a12 12 0 0 1 24 0v4" fill="none" stroke="#5A189A" stroke-width="5" stroke-linecap="round"/><rect x="22" y="36" width="16" height="10" rx="3" fill="#FFD43B"/><rect x="42" y="36" width="16" height="10" rx="3" fill="#FF3269"/><rect x="22" y="50" width="16" height="10" rx="3" fill="#2BB673"/><rect x="42" y="50" width="16" height="10" rx="3" fill="#E9D5FF"/></svg>',
    payments: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="22" width="48" height="32" rx="6" fill="#2BB673"/><rect x="10" y="30" width="48" height="6" fill="#1A8B4E"/><rect x="22" y="30" width="48" height="32" rx="6" fill="#7B2CBF"/><rect x="28" y="38" width="12" height="9" rx="2" fill="#FFD43B"/><path d="M30 55h20" stroke="#E9D5FF" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="54" r="4" fill="#FF3269"/><circle cx="54" cy="54" r="4" fill="#FFB020" opacity=".9"/></svg>',
    build: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 10c11 6 16 17 16 29l-6 8H30l-6-8c0-12 5-23 16-29z" fill="#7B2CBF"/><circle cx="40" cy="31" r="7" fill="#fff"/><circle cx="40" cy="31" r="4" fill="#FF3269"/><path d="M24 39l-8 10 10-1zM56 39l8 10-10-1z" fill="#5A189A"/><path d="M33 52l7 16 7-16z" fill="#FFB020"/><path d="M36 52l4 9 4-9z" fill="#FFD43B"/></svg>',
    seller: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="16" y="34" width="48" height="34" rx="3" fill="#E9D5FF"/><path d="M12 34l6-18h44l6 18z" fill="#FF3269"/><path d="M12 34h14v3a7 7 0 0 1-14 0zM26 34h14v3a7 7 0 0 1-14 0zM40 34h14v3a7 7 0 0 1-14 0zM54 34h14v3a7 7 0 0 1-14 0z" fill="#fff"/><path d="M26 34h14v3a7 7 0 0 1-14 0zM54 34h14v3a7 7 0 0 1-14 0z" fill="#FFC2D3"/><rect x="34" y="48" width="12" height="20" rx="2" fill="#7B2CBF"/><rect x="20" y="46" width="10" height="9" rx="2" fill="#2BB673"/></svg>',
    gtm: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M14 40V18a4 4 0 0 1 4-4h22l28 28-26 26z" fill="#FFD43B"/><circle cx="26" cy="26" r="5" fill="#fff"/><path d="M34 46l10-10M36 36h.01M44 46h.01" stroke="#7B2CBF" stroke-width="5" stroke-linecap="round"/></svg>',
    process: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="12" width="26" height="20" rx="5" fill="#7B2CBF"/><rect x="44" y="48" width="26" height="20" rx="5" fill="#2BB673"/><rect x="44" y="12" width="26" height="20" rx="5" fill="#FF3269"/><path d="M23 32v14a8 8 0 0 0 8 8h13M36 22h8" fill="none" stroke="#5A189A" stroke-width="4" stroke-linecap="round"/><path d="M40 50l5 4-5 4" fill="none" stroke="#5A189A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    live: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="8" y="14" width="64" height="42" rx="6" fill="#1F1235"/><rect x="13" y="19" width="54" height="32" rx="3" fill="#F3E8FF"/><path d="M18 43l10-10 8 8 12-13 12 10" fill="none" stroke="#7B2CBF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="60" cy="27" r="4" fill="#FF3269"/><rect x="30" y="58" width="20" height="5" rx="2" fill="#1F1235"/><rect x="22" y="63" width="36" height="5" rx="2.5" fill="#1F1235"/></svg>',
    mall: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="18" y="8" width="44" height="64" rx="10" fill="#5F259F"/><rect x="23" y="16" width="34" height="46" rx="4" fill="#fff"/><path d="M33 26h10a6 6 0 0 1 0 12H33V26zm0 12v14" fill="none" stroke="#5F259F" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="67" r="2.5" fill="#C9A8FF"/></svg>',
    orders: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="16" y="10" width="48" height="60" rx="6" fill="#fff" stroke="#E5E7EB" stroke-width="2"/><rect x="16" y="10" width="48" height="14" rx="6" fill="#7B2CBF"/><path d="M26 36h28M26 46h28M26 56h16" stroke="#C9CDD6" stroke-width="4" stroke-linecap="round"/><circle cx="58" cy="58" r="12" fill="#2BB673"/><path d="M52.5 58l4 4 7-8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    resume: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M20 8h28l14 14v46a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fff" stroke="#E5E7EB" stroke-width="2"/><path d="M48 8v14h14" fill="#E9D5FF"/><circle cx="32" cy="30" r="7" fill="#7B2CBF"/><path d="M24 44h32M24 52h32M24 60h20" stroke="#C9CDD6" stroke-width="4" stroke-linecap="round"/><rect x="40" y="56" width="26" height="14" rx="7" fill="#FF3269"/><path d="M47 63h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    chat: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M10 16h46a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H30L16 64V52h-6a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z" fill="#7B2CBF"/><path d="M38 30h30a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6h-4v10l-10-10H38a6 6 0 0 1-6-6V36a6 6 0 0 1 6-6z" fill="#FFD43B"/><circle cx="44" cy="45" r="3" fill="#7B2CBF"/><circle cx="53" cy="45" r="3" fill="#7B2CBF"/><circle cx="62" cy="45" r="3" fill="#7B2CBF"/></svg>',
    cafe: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M18 26h36l-4 40a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" fill="#F2E6D8"/><path d="M20 42h32l-2 24a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" fill="#8B5A2B"/><rect x="14" y="20" width="44" height="8" rx="4" fill="#7B2CBF"/><path d="M38 20l4-12" stroke="#FF3269" stroke-width="4" stroke-linecap="round"/><path d="M54 36h4a7 7 0 0 1 0 14h-6" fill="none" stroke="#7B2CBF" stroke-width="4"/></svg>'
  };

  function wordmark(sm) { return '<span class="wm' + (sm ? " sm" : "") + '">zepto</span>'; }
  function logo() { return '<a class="logo" href="#/" aria-label="zepto × navya — home">' + wordmark() + '<small>× navya</small></a>'; }

  /* ---------------- shared bits ---------------- */
  var PCLS = { result: "", built: "", modelled: "amber", target: "blue", sourced: "grey" };
  function provChip(p) {
    var x = D.prov[p]; if (!x) return "";
    return '<span class="chip ' + PCLS[p] + '" title="' + esc(x.tip) + '">' + (p === "result" || p === "built" ? I.check : "") + esc(x.label) + "</span>";
  }
  function inCart(id) { return S.cart.indexOf(id) > -1; }
  function seller(p) { return D.sellers[p.seller]; }

  /* the "product shot": a real pack where there is one, otherwise a poster */
  function art(p, big) {
    if (SHOT[p.id]) return '<span class="art img"><img src="' + SHOT[p.id] + '" alt="" loading="lazy"></span>';
    var o = p.poster, pp = p.seller === "phonepe";
    return '<span class="art pst" style="background:' + o.bg + ";color:" + o.fg + '">' +
      (pp ? '<img class="pl" src="assets/logos/phonepe.svg" alt="">' : '<em style="color:' + o.accent + '">' + esc(p.code) + "</em>") +
      '<b' + (o.big.length > 7 ? ' class="lng"' : "") + ">" + esc(o.big) + "</b>" + (big ? "<small>" + esc(o.small) + "</small>" : "") +
      '<i style="background:' + o.accent + '"></i></span>';
  }
  function addBtn(p, cls) {
    if (inCart(p.id)) return '<span class="stp ' + (cls || "") + '" data-stp="' + p.id + '"><button data-act="rm" data-id="' + p.id + '" aria-label="Remove ' + esc(p.short) + ' from cart">−</button><b>1</b><button data-act="more" data-id="' + p.id + '" aria-label="Add one more">+</button></span>';
    return '<button class="add ' + (cls || "") + '" data-act="add" data-id="' + p.id + '" aria-label="Add ' + esc(p.short) + ' to cart">ADD</button>';
  }
  function card(p) {
    return '<div class="pc" data-card="' + p.id + '"><div class="pc-i"><a class="pc-a" href="#/pn/' + p.id + '" aria-label="' + esc(p.short) + '" tabindex="-1">' + art(p) +
      (p.badge ? '<span class="bdg">' + esc(p.badge) + "</span>" : "") + "</a>" +
      '<div class="pc-add">' + addBtn(p) + "</div></div>" +
      '<a class="pc-b" href="#/pn/' + p.id + '"><span class="pr"><b class="gp">' + esc(p.price.v) + "</b>" + (p.price.strike ? "<s>" + esc(p.price.strike) + "</s>" : "") + "</span>" +
      '<span class="off">' + esc(p.price.off) + "</span>" +
      '<span class="nm">' + esc(p.short + " — " + p.kind.split("·")[0].trim()) + "</span>" +
      '<span class="un">' + esc(p.price.u) + "</span>" +
      '<span class="pv">' + provChip(p.price.prov) + "</span></a></div>";
  }
  function rail(id, title, list, more) {
    return '<section class="sec"><div class="sec-h"><h2>' + esc(title) + "</h2>" + (more ? '<a class="see" href="' + more + '">See All ' + I.chev + "</a>" : "") + "</div>" +
      '<div class="rail-w"><div class="rail" id="' + id + '">' + list.map(card).join("") + '</div><button class="rnav" data-act="rail" data-k="' + id + '" aria-label="Scroll ' + esc(title) + '">' + I.chev + "</button></div></section>";
  }

  /* ---------------- calculator: bill details, follow the money ---------------- */
  function moneyBlock() {
    return '<section class="sec" aria-labelledby="ftm-h"><div class="sec-h"><div><h2 id="ftm-h">Bill details · follow the money</h2><p>A customer pays online for a basket. What actually reaches the bank? This is the arithmetic I spent two years inside.</p></div></div>' +
      '<div class="calc"><div class="calc-t"><div class="seg" role="tablist"><button class="on" data-act="seg" data-v="500" role="tab">₹500 basket</button><button data-act="seg" data-v="2000" role="tab">₹2,000 stock-up</button></div>' +
      '<small>Order value</small><output id="ovOut">₹500</output><input id="ovR" type="range" min="100" max="10000" step="50" value="500" data-act="money" aria-label="Order value"></div>' +
      '<div class="calc-b"><div class="calc-r"><span>Order value</span><b id="m1">₹500.00</b></div>' +
      '<div class="calc-r neg"><span>Gateway fee (MDR) <small id="mRate">2.00%</small></span><b id="m2">− ₹10.00</b></div>' +
      '<div class="calc-r neg"><span>18% GST on the fee</span><b id="m3">− ₹1.80</b></div>' +
      '<div class="calc-r tot"><span>Lands in the bank</span><b id="m4">₹488.20</b></div>' +
      '<div class="calc-r var" id="mVarRow"><span>Variance vs contract</span><b id="m5">₹0.00</b></div>' +
      '<div class="calc-r var" id="mYrRow"><span>Same error on ₹100 Cr of orders a year</span><b id="m6">₹0</b></div>' +
      '<label class="sw"><input type="checkbox" id="brk" data-act="money"><i></i><span>The silent break: charged <b>2.35%</b> instead of the contracted <b>2.00%</b></span></label>' +
      '<p class="fine">GST-on-MDR deduction is how Indian settlement works (Sourced). Rates are illustrative (Modelled). Silent breaks like this are what <a href="#/pn/reconos">ReconOS</a> catches.</p></div></div></section>';
  }
  function inr(n, dp) { return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function updMoney() {
    var ov = $("#ovR"); if (!ov) return;
    var v = +ov.value, br = $("#brk").checked, rate = br ? 0.0235 : 0.02;
    var fee = v * rate, gst = fee * 0.18, net = v - fee - gst;
    var cNet = v - v * 0.02 * 1.18, varc = cNet - net;
    ov.style.setProperty("--p", ((v - ov.min) / (ov.max - ov.min) * 100) + "%");
    $("#ovOut").textContent = inr(v, 0);
    $("#m1").textContent = inr(v, 2); $("#mRate").textContent = (rate * 100).toFixed(2) + "%";
    $("#m2").textContent = "− " + inr(fee, 2); $("#m3").textContent = "− " + inr(gst, 2);
    $("#m4").textContent = inr(net, 2); $("#m5").textContent = (varc > 0.004 ? "− " : "") + inr(varc, 2);
    var yr = 1e9 * (br ? 0.0035 * 1.18 : 0);
    $("#m6").textContent = yr ? "≈ ₹" + (yr / 1e5).toFixed(1) + " L lost" : "₹0";
    $("#mVarRow").classList.toggle("bad", br); $("#mYrRow").classList.toggle("bad", br);
  }
  function habitsBlock(h) {
    return '<section class="sec"><div class="sec-h"><div><h2>' + (h || "Why teams reorder") + '</h2><p>Four habits that show up in every case — a settlement file, a bank\'s reply email or the price of a masala sachet.</p></div></div><div class="habits">' +
      D.habits.map(function (x, i) { return '<div class="habit"><i>' + String.fromCharCode(65 + i) + "</i><div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div></div>"; }).join("") + "</div></section>";
  }

  /* ---------------- HOME ---------------- */
  function banner() {
    return '<section class="bnr"><div class="bnr-tx"><span class="bnr-k">' + I.bolt + "Now delivering · Product Manager</span>" +
      "<h1>HIRE A PM<br>IN 10 MINUTES<sup>*</sup></h1>" +
      '<p><b>Navya Juneja.</b> Two years in payments at PhonePe — routing, settlement, reconciliation — then 0→1 products with real users. Every number on this page says where it came from.</p>' +
      '<div class="bnr-cta"><button class="btn dk" data-act="hire">Order now ' + I.chev + '</button><a class="btn wt" href="#/cn/all">Browse ' + D.products.length + " cases</a></div>" +
      '<small class="tc">*10 minutes to read the portfolio. Joining is immediate.</small></div>' +
      '<div class="bnr-v" aria-hidden="true"><div class="pack"><div class="pack-top">' + wordmark(true) + '<span>FRESH · PM</span></div><img src="assets/portrait.jpg" alt=""><div class="pack-b"><b>Navya Juneja</b><span>Net qty: 1 PM · ~3 yrs exp.</span></div><span class="pack-tag">₹15 Cr+<small>recovered</small></span></div>' +
      '<div class="fl f1"><b>₹8 Cr / yr</b>saved via routing</div><div class="fl f2"><b>+4 pp</b>payment success</div>' +
      '<div class="fl qr"><img src="assets/qr-linkedin.svg" alt=""><span><b>Scan to connect</b>LinkedIn</span></div></div></section>';
  }
  function offers() {
    var O = [["pp-recon", "₹15 Cr+", "recovered from reconciliation", "#F3E8FF", "#5A189A"], ["pp-routing", "₹8 Cr / yr", "saved via payment routing", "#E7F8EE", "#13703A"], ["pp-golive", "−53%", "go-live time, Cards", "#FFF1E6", "#9A3D00"], ["h2h", "65 → 300", "sign-ups in two months", "#FFE8EF", "#B0103E"]];
    return '<div class="offers">' + O.map(function (o) { return '<a href="#/pn/' + o[0] + '" style="background:' + o[3] + ";color:" + o[4] + '"><b>' + o[1] + "</b><span>" + o[2] + "</span>" + I.chev + "</a>"; }).join("") + "</div>";
  }
  function catTiles() {
    var T = [["#/cn/all", "all", "All Cases"], ["#/cn/payments", "payments", "Payments & Fintech"], ["#/cn/build", "build", "0→1 Builds"], ["#/cn/seller", "seller", "D2C & Commerce"], ["#/cn/gtm", "gtm", "GTM & Pricing"], ["#/cn/process", "process", "Process Design"],
      ["#/cn/live", "live", "Live Builds"], ["#/brand/phonepe", "mall", "PhonePe Store"], ["#/orders", "orders", "Experience"], [P.resume, "resume", "Résumé (PDF)"], ["#/account", "chat", "Contact Navya"], ["#/account", "cafe", "Off the Clock"]];
    return '<section class="sec"><div class="sec-h"><h2>Shop by Category</h2><a class="see" href="#/cn/all">See All ' + I.chev + '</a></div><div class="tiles">' +
      T.map(function (t) { return '<a href="' + t[0] + '"' + (t[1] === "resume" ? " download" : "") + '><span class="tl">' + CT[t[1]] + "</span><span>" + t[2] + "</span>" + (t[1] === "live" ? '<em class="new">NEW</em>' : "") + "</a>"; }).join("") + "</div></section>";
  }
  function fresh() {
    var f = { all: function () { return true; }, result: function (p) { return p.price.prov === "result"; }, built: function (p) { return p.price.prov === "built" || p.cats.indexOf("live") > -1; }, model: function (p) { return /modelled|target|sourced/.test(p.price.prov); } };
    var list = D.products.filter(f[S.mv]).slice(0, 10);
    var tabs = [["all", "All"], ["result", "Results"], ["built", "Built & live"], ["model", "Modelled & targets"]];
    return '<section class="sec ss" id="fresh"><div class="ss-h"><div><span class="ss-k">SUPER SAVER</span><h2>Filter by evidence</h2><p>Every figure is labelled by where it came from — no hidden charges.</p></div></div>' +
      '<div class="chips" role="tablist">' + tabs.map(function (t) { return '<button class="fc' + (S.mv === t[0] ? " on" : "") + '" role="tab" aria-selected="' + (S.mv === t[0]) + '" data-act="mv" data-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>" +
      '<div class="rail-w"><div class="rail" id="r-fresh">' + list.map(card).join("") + '</div><button class="rnav" data-act="rail" data-k="r-fresh" aria-label="Scroll">' + I.chev + "</button></div></section>";
  }
  function vHome() {
    var best = ["reconos", "perfora", "mid", "wowworld", "routeiq", "foundit", "h2h", "prolectro"].map(function (id) { return byId[id]; });
    var pp = D.products.filter(function (p) { return p.seller === "phonepe"; });
    var live = D.products.filter(function (p) { return p.cats.indexOf("live") > -1 || p.deck; });
    return '<div class="wrap">' + banner() + offers() + catTiles() +
      rail("r-best", "Bestsellers", best, "#/cn/all") +
      rail("r-pp", "PhonePe Essentials", pp, "#/brand/phonepe") +
      fresh() +
      rail("r-live", "Open them yourself · live builds & decks", live, "#/cn/live") +
      moneyBlock() + habitsBlock() + hireStrip() + "</div>";
  }
  function hireStrip() {
    return '<section class="sec hs"><div><h2>Delivering to your product team?</h2><p>Open to Product Manager roles. The first call is free — no handling charge, no delivery fee.</p></div><div class="hs-b"><button class="btn pk lg" data-act="hire">Hire Navya</button><a class="btn ol lg" href="' + P.resume + '" download>' + I.doc + "Résumé</a></div></section>";
  }

  /* ---------------- CATEGORY (left rail + grid) ---------------- */
  function catName(id) { var c = D.cats.filter(function (c) { return c.id === id; })[0]; return c ? c.name : "All"; }
  function filtered(cat) {
    var q = S.f.q.trim().toLowerCase();
    var l = D.products.filter(function (p) {
      if (cat !== "all" && p.cats.indexOf(cat) < 0) return false;
      if (S.f.seller.length && S.f.seller.indexOf(p.seller) < 0) return false;
      if (S.f.prov.length && S.f.prov.indexOf(p.price.prov) < 0) return false;
      if (q && (p.name + " " + p.short + " " + p.code + " " + p.kind + " " + p.hook + " " + p.cats.join(" ") + " " + seller(p).name).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (S.f.sort === "new") l.sort(function (a, b) { return b.sort - a.sort; });
    if (S.f.sort === "old") l.sort(function (a, b) { return a.sort - b.sort; });
    if (S.f.sort === "az") l.sort(function (a, b) { return a.short.localeCompare(b.short); });
    return l;
  }
  function chk(k, v, label) { var on = S.f[k].indexOf(v) > -1; return '<label><input type="checkbox" data-act="chk" data-k="' + k + '" value="' + v + '"' + (on ? " checked" : "") + ">" + esc(label) + "</label>"; }
  function vCat(cat) {
    var l = filtered(cat), n = S.f.seller.length + S.f.prov.length + (S.f.q ? 1 : 0);
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>' + I.chev + "<span>" + esc(catName(cat)) + "</span></nav>" +
      '<div class="cl"><nav class="side" aria-label="Categories">' + D.cats.map(function (c) {
        return '<a href="#/cn/' + c.id + '" class="' + (c.id === cat ? "on" : "") + '"' + (c.id === cat ? ' aria-current="page"' : "") + '><span class="sti">' + CT[c.id] + "</span><span>" + esc(c.name) + "</span></a>";
      }).join("") + '<a href="#/orders"><span class="sti">' + CT.orders + "</span><span>Experience</span></a></nav>" +
      '<div class="cl-m"><div class="cl-top"><h1>' + esc(catName(cat)) + ' <small>' + l.length + " item" + (l.length === 1 ? "" : "s") + "</small></h1>" +
      '<div class="cl-ctl"><button class="fc' + (S.fltOpen || n ? " on" : "") + '" data-act="flt" aria-expanded="' + S.fltOpen + '">' + I.filter + "Filters" + (n ? " (" + n + ")" : "") + '</button><label class="sel"><span class="sr">Sort</span><select data-act="sort"><option value="rel"' + (S.f.sort === "rel" ? " selected" : "") + '>Relevance</option><option value="new"' + (S.f.sort === "new" ? " selected" : "") + '>Newest first</option><option value="old"' + (S.f.sort === "old" ? " selected" : "") + '>Oldest first</option><option value="az"' + (S.f.sort === "az" ? " selected" : "") + ">A → Z</option></select></label></div></div>" +
      '<div class="flt' + (S.fltOpen ? " on" : "") + '"><div><h4>Company</h4>' + Object.keys(D.sellers).map(function (k) { return chk("seller", k, D.sellers[k].name); }).join("") + "</div>" +
      "<div><h4>Evidence</h4>" + Object.keys(D.prov).map(function (k) { return chk("prov", k, D.prov[k].label + " — " + D.prov[k].tip); }).join("") + "</div>" + (n ? '<button class="clr" data-act="clr">Clear all</button>' : "") + "</div>" +
      (S.f.q ? '<p class="qline">Results for “<b>' + esc(S.f.q) + '</b>” <button class="chip grey" data-act="clrq">Clear ×</button></p>' : "") +
      (l.length ? '<div class="grid">' + l.map(card).join("") + "</div>" : emptyState(CT.all, "Nothing on this shelf", "Try a different filter or search term.", null, "Reset filters", "clr")) +
      "</div></div></div>";
  }

  /* ---------------- PRODUCT PAGE (case detail) ---------------- */
  function secBody(s) {
    var h = "";
    if (s.p && !s.compare && !s.tiers && !s.steps) h += "<p>" + esc(s.p) + "</p>";
    if (s.list) h += "<ul>" + s.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    if (s.steps) h += '<div class="steps">' + s.steps.map(function (x, i) { return '<div class="step"><i>' + (i + 1) + "</i><div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div></div>"; }).join("") + "</div>";
    if (s.compare) h += '<div class="cmp">' + s.compare.map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div>"; }).join("") + "</div>";
    if (s.tiers) h += '<div class="tiers">' + s.tiers.map(function (x) { return "<div><small>" + esc(x[0]) + "</small><b>" + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></div>"; }).join("") + "</div>";
    if (s.p && (s.compare || s.tiers || s.steps)) h += "<p>" + esc(s.p) + "</p>";
    return h;
  }
  var GI = {};
  function gallery(p) {
    var items = [];
    if (SHOT[p.id]) items.push({ type: "img", src: SHOT[p.id], alt: p.short + " pack shot" });
    p.media.forEach(function (m) { if (!SHOT[p.id] || m.src !== SHOT[p.id]) items.push(m); });
    if (!items.length) items.push({ type: "poster" });
    var cur = Math.min(GI[p.id] || 0, items.length - 1), m = items[cur];
    var main = m.type === "poster" ? art(p, true) : m.type === "video" ? '<video controls preload="none" playsinline poster="' + m.poster + '" aria-label="' + esc(m.alt) + '"><source src="' + m.src + '" type="video/mp4"></video>'
      : '<button class="zoom" data-act="lb" data-id="' + p.id + '" data-k="' + cur + '" aria-label="Open image: ' + esc(m.alt) + '"><img src="' + m.src + '" alt="' + esc(m.alt) + '"></button>';
    var th = items.length > 1 ? '<div class="thumbs" role="tablist" aria-label="Media">' + items.map(function (x, i) {
      var t = x.type === "video" ? '<img src="' + x.poster + '" alt=""><span class="pl">' + I.play + "</span>" : x.type === "poster" ? art(p) : '<img src="' + x.src + '" alt="">';
      return '<button role="tab" aria-selected="' + (i === cur) + '" class="' + (i === cur ? "on" : "") + '" data-act="gi" data-id="' + p.id + '" data-k="' + i + '" aria-label="' + esc(x.alt || "Poster") + '">' + t + "</button>";
    }).join("") + "</div>" : "";
    return '<div class="gal' + (items.length > 1 ? "" : " one") + '" id="gal">' + th + '<div class="gmain">' + main + (items.length > 1 ? '<span class="gcount">' + (cur + 1) + " / " + items.length + "</span>" : "") + "</div></div>";
  }
  function galleryItems(p) { var items = []; if (SHOT[p.id]) items.push({ type: "img", src: SHOT[p.id], alt: p.short + " pack shot" }); p.media.forEach(function (m) { if (!SHOT[p.id] || m.src !== SHOT[p.id]) items.push(m); }); return items; }
  function vProduct(id) {
    var p = byId[id]; if (!p) return vNotFound();
    var s = seller(p), cat = p.cats[0];
    var sim = D.products.filter(function (x) { return x.id !== p.id && x.cats.some(function (c) { return c !== "live" && p.cats.indexOf(c) > -1; }); }).slice(0, 8);
    var links = (p.links || []).map(function (l) { return '<a class="lk" href="' + l.u + '" target="_blank" rel="noopener"><span class="lki">' + I.ext + '</span><span class="tx"><b>' + esc(l.t) + "</b><span>" + esc(host(l.u)) + "</span></span>" + I.chev + "</a>"; }).join("");
    if (p.deck) links += '<a class="lk" href="' + p.deck.u + '" target="_blank" rel="noopener"><span class="lki">' + I.doc + '</span><span class="tx"><b>Open the full deck</b><span>' + esc(p.deck.t) + " · PDF · " + p.deck.pages + " pages · " + p.deck.size + "</span></span>" + I.chev + "</a>";
    var sellerHref = p.seller === "phonepe" ? "#/brand/phonepe" : "#/orders?o=" + (p.seller === "cogent" ? "cogent" : p.seller === "mu" ? "mu" : "");
    var hl = [["Seller", s.name + " · " + s.sub]].concat(p.details);
    var badges = [[I.bolt, "Fast delivery", "Immediate joiner"], [I.shield, "Every number", "labelled"], p.links.length ? [I.ext, "Live build", "open it yourself"] : p.deck ? [I.doc, "Full deck", p.deck.pages + " pages"] : [I.star, D.prov[p.price.prov].label, "evidence"]];
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>' + I.chev + '<a href="#/cn/' + cat + '">' + esc(catName(cat)) + "</a>" + I.chev + "<span>" + esc(p.short) + "</span></nav>" +
      '<div class="pdp"><div class="pdp-l">' + gallery(p) + '<div class="pdp-cta desk">' + (inCart(p.id) ? '<a class="btn pk lg block" href="#/cart">Go to Cart ' + I.chev + "</a>" : '<button class="btn pk lg block" data-act="add" data-id="' + p.id + '">Add to Cart</button>') + "</div></div>" +
      '<div class="pdp-r"><a class="brand" href="' + sellerHref + '">' + esc(s.name) + " " + I.chev + "</a>" +
      '<div class="pdp-t"><h1>' + esc(p.name) + '</h1><button class="ib" data-act="share" aria-label="Share this case">' + I.share + "</button></div>" +
      '<div class="pdp-q">Net Qty: ' + esc(p.kind) + (p.date ? " · " + esc(p.date) : "") + ' <span class="dot">•</span> <span class="rt">' + I.star + esc(p.code) + "</span></div>" +
      '<div class="pdp-px"><b class="gp xl">' + esc(p.price.v) + "</b>" + provChip(p.price.prov) + "</div>" +
      '<div class="pdp-m">' + (p.price.strike ? "Was <s>" + esc(p.price.strike) + "</s> " : "") + "<span>(" + esc(p.price.u) + ')</span> <b class="g">' + esc(p.price.off) + "</b></div>" +
      '<div class="bdgs">' + badges.map(function (b) { return '<div><span>' + b[0] + "</span><b>" + esc(b[1]) + "</b><small>" + esc(b[2]) + "</small></div>"; }).join("") + "</div>" +
      (links ? '<div class="lks">' + links + "</div>" : "") +
      '<div class="box"><h2>Highlights</h2><dl class="hl">' + hl.map(function (d) { return "<dt>" + esc(d[0]) + "</dt><dd>" + esc(d[1]) + "</dd>"; }).join("") + "</dl></div></div></div>" +
      '<div class="pdp-d">' +
      '<section class="box"><h2>Product description</h2><div class="perf"><div><small>The problem</small><p>' + esc(p.summary.problem) + "</p></div><div><small>What I did</small><p>" + esc(p.summary.did) + '</p></div><div class="ld"><small>Where it landed</small><p>' + esc(p.summary.landed) + "</p></div></div></section>" +
      '<section class="box"><h2>Nutritional information <small>· the numbers, labelled</small></h2><div class="nut">' + p.metrics.map(function (m) { return "<div><b>" + esc(m.v) + "</b><span>" + esc(m.l) + "</span>" + provChip(m.p) + "</div>"; }).join("") + "</div></section>" +
      '<section class="box"><h2>How it was made</h2>' + (p.sections.length ? p.sections.map(function (x) { return '<div class="ap"><h3>' + esc(x.h) + "</h3>" + secBody(x) + "</div>"; }).join("") : '<div class="ap"><p>' + esc(p.hook) + " Underlying data and internal documents belong to " + esc(s.name) + " and are not reproduced here — figures are as stated on my CV.</p></div>") + "</section>" +
      '<section class="box why"><h2>' + I.spark + "Why this matters at Zepto</h2><p>" + esc(p.zepto) + "</p></section></div>" +
      (sim.length ? rail("r-sim", "Similar products", sim) : "") + "</div>" +
      '<div class="bbar"><div><b class="gp">' + esc(p.price.v) + "</b><small>" + esc(p.price.u) + "</small></div>" + (inCart(p.id) ? '<a class="btn pk lg" href="#/cart">Go to Cart</a>' : '<button class="btn pk lg" data-act="add" data-id="' + p.id + '">Add to Cart</button>') + "</div>";
  }

  /* ---------------- BRAND STORE (PhonePe) ---------------- */
  function vBrand() {
    var pp = D.products.filter(function (p) { return p.seller === "phonepe"; });
    var mgr = D.orders.filter(function (o) { return o.org === "PhonePe"; });
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>' + I.chev + "<span>PhonePe Store</span></nav>" +
      '<section class="bh"><img src="assets/logos/phonepe.svg" alt="PhonePe logo"><div><span class="bh-k">Brand store · 2 years</span><h1>PhonePe Payments Store</h1><p>Cards &amp; NetBanking · ₹500+ Cr TPV travel merchants · Jun 2023 – Jun 2025 · Bengaluru</p></div>' +
      '<div class="bh-s"><div><b>₹15 Cr+</b><span>recovered</span></div><div><b>₹8 Cr</b><span>saved a year</span></div><div><b>+4 pp</b><span>payment success</span></div><div><b>95%</b><span>traffic migrated in 3 mo</span></div></div></section>' +
      '<section class="sec"><div class="sec-h"><h2>All products (' + pp.length + ')</h2></div><div class="grid g5">' + pp.map(card).join("") + "</div></section>" +
      '<section class="sec"><div class="sec-h"><h2>Store managers</h2></div><div class="mgr">' + mgr.map(function (o) {
        return '<div class="box"><div class="mgr-h"><img src="' + o.logo + '" alt=""><div><b>' + esc(o.title) + "</b><span>" + esc(o.when) + " · " + esc(o.where) + '</span></div></div><p>' + esc(o.body) + '</p><div class="bul">' + o.bullets.map(function (b) { return "<div><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></div>"; }).join("") + "</div></div>";
      }).join("") + "</div></section>" + moneyBlock() +
      '<p class="fine" style="margin:0 0 40px">Figures are as stated on my CV. Underlying transaction data and internal documents are PhonePe\'s and are not reproduced.</p></div>';
  }

  /* ---------------- ORDERS (experience) ---------------- */
  function vOrders(qs) {
    var open = qs.o || "";
    return '<div class="wrap narrow"><h1 class="ph">Your orders</h1><p class="mut">Experience and education, most recent first.</p>' +
      '<div class="osum"><div class="big"><small>Total experience</small><b>~3 years</b><em>Jun 2023 – Jun 2026</em></div><div><small>PhonePe · payments</small><b>2 yrs</b><em>₹8 Cr + ₹15 Cr</em></div><div><small>Cogent · 0→1</small><b>10 mo</b><em>4.6× sign-ups</em></div><div><small>MU ventures</small><b>₹7.3 L</b><em>revenue, 2 ventures</em></div></div>' +
      '<div class="ol">' + D.orders.map(function (o) {
        return '<div class="oc' + (open === o.id ? " open" : "") + '" id="o-' + o.id + '"><button class="oc-r" data-act="otoggle" data-id="' + o.id + '" aria-expanded="' + (open === o.id) + '"><img src="' + o.logo + '" alt=""><span class="oc-t"><span class="st ' + (o.status === "ongoing" ? "on" : "") + '">' + (o.status === "ongoing" ? I.clock : I.check) + esc(o.statusText) + "</span><b>" + esc(o.org) + '</b><span class="t">' + esc(o.title) + '</span><span class="w">' + esc(o.when) + " · " + esc(o.where) + " · " + (o.type === "edu" ? "Education" : "Work") + "</span></span>" + I.chevD + "</button>" +
          '<div class="oc-b"><p>' + esc(o.body) + "</p>" +
          (o.bullets ? '<div class="bul">' + o.bullets.map(function (b) { return "<div><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></div>"; }).join("") + "</div>" : "") +
          (o.track ? '<div class="track">' + o.track.map(function (t) { return "<div><i></i><b>" + esc(t[0]) + "</b><span>" + esc(t[1]) + "</span></div>"; }).join("") + "</div>" : "") +
          (o.related ? '<div class="rel"><small>Order again</small>' + o.related.map(function (r) { return '<a class="fc" href="#/pn/' + r + '">' + esc(byId[r].short) + " " + I.chev + "</a>"; }).join("") + "</div>" : "") + "</div></div>";
      }).join("") + "</div>" +
      '<section class="sec"><div class="sec-h"><h2>Certifications</h2></div><div class="oc2">' + D.certs.map(function (c) { return "<div><b>" + esc(c[0]) + "</b><span>" + esc(c[1]) + "</span></div>"; }).join("") + "</div></section></div>";
  }

  /* ---------------- CART ---------------- */
  var ROLES = ["Product Manager", "Associate PM", "PM — Payments & Checkout", "PM — Growth & Retention", "PM — Supply & Brands"];
  function vCart() {
    var l = S.cart.map(function (id) { return byId[id]; });
    if (!l.length) return '<div class="wrap narrow"><h1 class="ph">Cart</h1>' + emptyState(CT.all, "Your cart is empty", "Add a few cases you'd like to talk about — then place one order for an interview.", "#/cn/all", "Browse cases") +
      rail("r-sug", "Popular right now", ["reconos", "perfora", "pp-routing", "wowworld", "mid"].map(function (id) { return byId[id]; })) + "</div>";
    var sug = D.products.filter(function (p) { return !inCart(p.id); }).slice(0, 8);
    return '<div class="wrap narrow"><h1 class="ph">Cart</h1><div class="ct">' +
      '<div><div class="box dlv"><span class="eta-i">' + I.bolt + '</span><div><b>Delivery in 10 minutes</b><span>Shipment of ' + l.length + " case" + (l.length > 1 ? "s" : "") + " · to your product team</span></div></div>" +
      '<div class="box items">' + l.map(function (p) {
        return '<div class="it"><a href="#/pn/' + p.id + '" class="it-a">' + art(p) + '</a><div class="it-t"><a href="#/pn/' + p.id + '"><b>' + esc(p.short) + "</b></a><span>" + esc(p.price.u) + "</span>" + provChip(p.price.prov) + "</div>" + addBtn(p, "sm") + '<div class="it-p"><b>' + esc(p.price.v) + "</b>" + (p.price.strike ? "<s>" + esc(p.price.strike) + "</s>" : "") + "</div></div>";
      }).join("") + '<a class="more" href="#/cn/all">+ Add more items</a></div>' +
      '<section class="sec" style="margin-top:22px"><div class="sec-h"><h2>Did you forget?</h2></div><div class="rail-w"><div class="rail" id="r-forgot">' + sug.map(card).join("") + "</div></div></section></div>" +
      '<aside><div class="box bill"><h2>Bill details</h2>' +
      '<div class="br"><span>Items total <small>' + l.length + " case" + (l.length > 1 ? "s" : "") + "</small></span><b>₹0</b></div>" +
      '<div class="br"><span>Handling charge</span><b><s>₹15</s> <em>FREE</em></b></div>' +
      '<div class="br"><span>Delivery fee</span><b><s>₹30</s> <em>FREE</em></b></div>' +
      '<div class="br"><label for="roleSel">Role</label><select id="roleSel" data-act="role">' + ROLES.map(function (r) { return "<option" + (r === S.role ? " selected" : "") + ">" + r + "</option>"; }).join("") + "</select></div>" +
      '<div class="br"><span>Interview rounds</span><span class="stp sm"><button data-act="rounds" data-k="-1" aria-label="Fewer rounds">−</button><b id="rOut">' + S.rounds + '</b><button data-act="rounds" data-k="1" aria-label="More rounds">+</button></span></div>' +
      '<div class="br tot"><span>To pay</span><b>₹0</b></div><p class="sv">' + I.tag + "You saved ₹45 — the first call is free</p></div>" +
      '<div class="box addr">' + I.pin + "<div><b>Navya is in Gurgaon</b><span>Open to relocating, including Bengaluru and Mumbai</span></div></div>" +
      '<button class="btn pk lg block place" data-act="place">Place Order · Hire Navya</button><p class="fine c">Opens an email with your cart attached. Nothing is sent until you hit send.</p></aside></div></div>';
  }

  /* ---------------- ACCOUNT ---------------- */
  function vAccount() {
    return '<div class="wrap acc"><aside class="box pcard"><div class="pimg"><img src="assets/portrait.jpg" alt="Navya Juneja"></div><h1>' + esc(P.name) + '</h1><p class="role">' + esc(P.role) + " · " + esc(P.location) + "</p>" +
      '<span class="kyc">' + I.shield + 'Every number labelled</span><div class="cls">' +
      '<a href="mailto:' + P.email + '">' + I.mail + "<span>" + esc(P.email) + "</span></a>" +
      '<a href="' + P.phoneHref + '">' + I.phone + "<span>" + esc(P.phone) + "</span></a>" +
      '<a href="' + P.linkedin + '" target="_blank" rel="noopener">' + I.linkedin + "<span>" + esc(P.linkedinShort) + "</span>" + I.ext + "</a>" +
      '<a href="' + P.resume + '" download>' + I.doc + "<span>Résumé (PDF)</span><small>Download</small></a>" +
      '<a href="' + P.portfolio + '" target="_blank" rel="noopener">' + I.globe + "<span>Main portfolio</span>" + I.ext + "</a></div>" +
      '<button class="btn pk block lg" style="margin-top:18px" data-act="hire">Hire Navya</button>' +
      '<div class="qa"><a href="#/orders">' + I.bag + "Your orders</a><a href=\"#/cart\">" + I.cart + "Cart</a><a href=\"#/brand/phonepe\">" + I.star + "PhonePe Store</a></div></aside><div>" +
      '<div class="cash"><div><small>Navya Cash</small><b>₹15 Cr+</b><span>recovered via reconciliation at PhonePe · Result</span></div><div><small>Zepto-style speed</small><b>95% in 3 mo</b><span>payment traffic migrated · Result</span></div></div>' +
      habitsBlock("How I work") +
      '<section class="sec"><div class="sec-h"><div><h2>Off the clock · Navya Cafe</h2><p>Freshly made, outside work.</p></div></div><div class="menu">' + D.offclock.map(function (o) { return "<div><b>" + esc(o[0]) + "</b><span>" + esc(o[1]) + "</span></div>"; }).join("") + "</div></section>" +
      '<section class="sec"><div class="sec-h"><h2>Help &amp; Support</h2></div><div class="faq">' + D.faq.map(function (f, i) { return "<details" + (i ? "" : " open") + "><summary>" + esc(f[0]) + I.chevD + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("") + "</div></section></div></div>";
  }
  function emptyState(icon, h, p, href, cta, act) {
    return '<div class="empty"><div class="ei">' + icon + "</div><h2>" + esc(h) + "</h2><p>" + esc(p) + "</p>" + (act ? '<button class="btn pk" data-act="' + act + '">' + esc(cta) + "</button>" : '<a class="btn pk" href="' + href + '">' + esc(cta) + "</a>") + "</div>";
  }
  function vNotFound() { return '<div class="wrap">' + emptyState(CT.all, "This aisle doesn't exist", "That link doesn't lead anywhere — let's get you back to the store.", "#/", "Go Home") + "</div>"; }

  /* ---------------- SHELL ---------------- */
  var NAV = [["#/", "Home", "home", ""], ["#/cn/all", "Categories", "grid", "cn"], ["#/orders", "Orders", "bag", "orders"], ["#/cart", "Cart", "cart", "cart"], ["#/account", "Account", "user", "account"]];
  var TABS = ["all", "mall", "payments", "build", "seller", "gtm", "process", "live"];
  function renderShell() {
    var cc = S.cart.length;
    var cnt = cc ? '<span class="cnt">' + cc + "</span>" : "";
    $("#hdr").innerHTML = '<div class="wrap hdr-in">' + logo() +
      '<button class="eta" data-act="loc"><b>' + I.bolt + 'Hired in 10 minutes*</b><span>Gurgaon, India ' + I.chevD + "</span></button>" +
      searchBox("q1") +
      '<a class="hl-a" href="#/account" data-nav="account">' + I.user + "<span>Account</span></a>" +
      '<a class="hl-a" href="' + P.resume + '" download>' + I.doc + "<span>Résumé</span></a>" +
      '<a class="hl-a" href="#/cart" data-nav="cart" aria-label="Cart (' + cc + ' items)">' + I.cart + cnt + "<span>Cart</span></a></div>" +
      '<div class="wrap hdr-m"><button class="ib bare back" data-act="back" aria-label="Back">' + I.back + "</button>" +
      '<button class="eta m" data-act="loc"><b>Hired in <em>10 minutes</em></b><span>' + I.pin + "Gurgaon, India " + I.chevD + "</span></button>" +
      '<span class="mt" id="mTitle"></span><span class="hsp"></span>' +
      '<button class="ib bare msb" data-act="msearch" aria-label="Search">' + I.search + "</button>" +
      '<a class="av" href="#/account" aria-label="Account"><img src="assets/portrait.jpg" alt=""></a></div>' +
      '<div class="wrap hdr-s">' + searchBox("q3") + "</div>" +
      '<nav class="tabs" aria-label="Category tabs"><div class="wrap tabs-in">' + TABS.map(function (k) {
        return '<a href="' + (k === "all" ? "#/" : k === "mall" ? "#/brand/phonepe" : "#/cn/" + k) + '" data-tab="' + k + '">' + TI[k] + "<span>" + CATSHORT[k] + "</span></a>";
      }).join("") + "</div></nav>";
    $("#bnav").innerHTML = NAV.map(function (n) { return '<a href="' + n[0] + '" data-nav="' + n[3] + '">' + I[n[2]] + (n[3] === "cart" && cc ? '<span class="cnt">' + cc + "</span>" : "") + "<span>" + n[1] + "</span></a>"; }).join("");
    markNav();
  }
  function searchBox(id) {
    return '<div class="srch"><form data-act="searchform" role="search"><span aria-hidden="true">' + I.search + '</span><input id="' + id + '" data-q type="search" autocomplete="off" placeholder="Search for “payments”" aria-label="Search case studies" aria-controls="' + id + 'd" value="' + esc(S.f.q) + '"></form><div class="sdrop" id="' + id + 'd" role="listbox"></div></div>';
  }
  function results(q) {
    q = q.trim().toLowerCase();
    var list = q ? D.products.filter(function (p) { return (p.name + " " + p.short + " " + p.code + " " + p.kind + " " + p.cats.join(" ") + " " + seller(p).name).toLowerCase().indexOf(q) > -1; }) : D.products.slice(0, 5);
    var cats = q ? D.cats.filter(function (c) { return c.name.toLowerCase().indexOf(q) > -1; }) : [];
    if (!list.length && !cats.length) return '<div class="sempty">No cases for “' + esc(q) + '”. Try “payments”, “pricing” or “PhonePe”.</div>';
    return (q ? "<h5>Cases</h5>" : "<h5>Trending searches</h5>") + list.slice(0, 7).map(function (p, i) {
      return '<a class="sres' + (i ? "" : " act") + '" href="#/pn/' + p.id + '"><span class="sa">' + art(p) + '</span><span class="tx"><b>' + esc(p.short) + "</b><span>" + esc(p.kind) + '</span></span><span class="pr"><b class="gp sm">' + esc(p.price.v) + "</b><small>" + esc(D.prov[p.price.prov].label) + "</small></span></a>";
    }).join("") + (cats.length ? "<h5>Categories</h5>" + cats.map(function (c) { return '<a class="sres" href="#/cn/' + c.id + '"><span class="sa tl">' + CT[c.id] + '</span><span class="tx"><b>' + esc(c.name) + "</b></span></a>"; }).join("") : "");
  }
  function markNav() {
    var r = parse(), p = r.parts[0] || "";
    $$("[data-nav]").forEach(function (a) { var on = a.getAttribute("data-nav") === p; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var t = !p ? "all" : p === "brand" ? "mall" : p === "cn" ? (r.parts[1] || "all") : p === "pn" && byId[r.parts[1]] ? byId[r.parts[1]].cats[0] : "";
    if (p === "cn" && t === "all") t = "";
    $$("[data-tab]").forEach(function (a) { var on = a.getAttribute("data-tab") === t; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }
  function renderFooter() {
    $("#ftr").innerHTML = '<div class="wrap ftr-in"><div class="ftr-l">' + logo() + "<p>A product portfolio built in the image of a quick-commerce app, for Zepto PM applications. " + esc(P.name) + " · " + esc(P.role) + ".</p></div>" +
      '<div><h4>Categories</h4><ul><li><a href="#/cn/all">All cases</a></li><li><a href="#/cn/payments">Payments &amp; Fintech</a></li><li><a href="#/cn/build">0→1 Builds</a></li><li><a href="#/cn/seller">D2C &amp; Commerce</a></li><li><a href="#/brand/phonepe">PhonePe Store</a></li></ul></div>' +
      '<div><h4>Account</h4><ul><li><a href="#/orders">Orders (Experience)</a></li><li><a href="#/cart">Cart</a></li><li><a href="#/account">Help &amp; Support</a></li><li><a href="' + P.resume + '" download>Résumé (PDF)</a></li></ul></div>' +
      '<div><h4>Contact</h4><ul><li><a href="mailto:' + P.email + '">Email</a></li><li><a href="' + P.linkedin + '" target="_blank" rel="noopener">LinkedIn ↗</a></li><li><a href="' + P.phoneHref + '">' + esc(P.phone) + '</a></li><li><a href="' + P.portfolio + '" target="_blank" rel="noopener">Main portfolio ↗</a></li></ul></div>' +
      '<p class="disc">Independent job-application portfolio. Not affiliated with or endorsed by Zepto or PhonePe; brand names belong to their owners and are used only to refer to the role and past employment. Nothing here is for sale — the "prices" are each case\'s headline number, and every figure is labelled Result, Built, Modelled, Target or Sourced.</p></div>';
  }

  /* ---------------- ROUTER ---------------- */
  var lastRoute = "", navCount = 0;
  function parse() {
    var raw = (location.hash || "#/").slice(1), qi = raw.indexOf("?");
    var path = (qi > -1 ? raw.slice(0, qi) : raw) || "/", qs = {};
    if (qi > -1) raw.slice(qi + 1).split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) qs[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ""); });
    return { parts: path.split("/").filter(Boolean), qs: qs, path: path };
  }
  function route() {
    var r = parse(), p = r.parts, view, title = "", cls = "r-home";
    if ((p[0] === "p" || p[0] === "stock" || p[0] === "case") && p[1]) { location.replace("#/pn/" + p[1]); return; }
    if (p[0] === "search" || p[0] === "cases") { location.replace("#/cn/" + (p[1] || "all") + (r.qs.q ? "?q=" + encodeURIComponent(r.qs.q) : "")); return; }
    if (!p.length) { view = vHome(); }
    else if (p[0] === "cn") { var c = p[1] || "all"; if (!D.cats.some(function (x) { return x.id === c; })) c = "all"; if (r.qs.q != null) S.f.q = r.qs.q; view = vCat(c); title = catName(c); cls = "r-cat"; }
    else if (p[0] === "pn") { view = vProduct(p[1]); title = byId[p[1]] ? byId[p[1]].short : "Not found"; cls = "r-pdp"; }
    else if (p[0] === "brand") { view = vBrand(); title = "PhonePe Store"; cls = "r-brand"; }
    else if (p[0] === "orders") { view = vOrders(r.qs); title = "Your orders"; cls = "r-orders"; }
    else if (p[0] === "cart") { view = vCart(); title = "Cart"; cls = "r-cart"; }
    else if (p[0] === "account" || p[0] === "profile" || p[0] === "help") { view = vAccount(); title = "Account"; cls = "r-account"; }
    else { view = vNotFound(); title = "Not found"; cls = "r-nf"; }
    document.body.className = document.body.className.replace(/\br-\S+/g, "").trim() + " " + cls + (S.cart.length ? " has-cart" : "");
    var v = $("#view"); v.innerHTML = view; v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in");
    document.title = (title ? title + " · " : "") + "zepto × navya — Navya Juneja, Product Manager";
    var mt = $("#mTitle"); if (mt) mt.textContent = title;
    if (r.path !== lastRoute) { window.scrollTo(0, 0); S.fltOpen = false; }
    lastRoute = r.path;
    markNav(); updMoney(); renderCartBar(); railNav(); setHdrH();
    if (r.qs.o) { var el = $("#o-" + r.qs.o); if (el) setTimeout(function () { el.scrollIntoView({ block: "center", behavior: "smooth" }); }, 120); }
  }
  function setHdrH() { document.documentElement.style.setProperty("--hdr-h", $("#hdr").offsetHeight + "px"); }
  function rerender() { var y = window.scrollY; route(); window.scrollTo(0, y); }

  /* floating "View cart" bar (mobile) */
  function renderCartBar() {
    var b = $("#cbar"), n = S.cart.length, onCart = parse().parts[0] === "cart";
    document.body.classList.toggle("has-cart", n > 0 && !onCart);
    if (!n || onCart) { b.classList.remove("on"); return; }
    var l = S.cart.slice(-3).map(function (id) { return byId[id]; });
    b.innerHTML = '<a href="#/cart"><span class="cb-th">' + l.map(function (p) { return art(p); }).join("") + '</span><span class="cb-t"><b>View cart</b><small>' + n + " case" + (n > 1 ? "s" : "") + " · first call free</small></span>" + I.chev + "</a>";
    b.classList.add("on");
  }
  function railNav() { $$(".rail").forEach(function (r) { var b = r.parentNode.querySelector(".rnav"); if (b) b.hidden = r.scrollWidth <= r.clientWidth + 4; }); }

  /* ---------------- sheets ---------------- */
  var lastFocus = null;
  function openSheet(html, cls) { lastFocus = document.activeElement; var s = $("#sheet"); s.className = "sheet " + (cls || ""); s.innerHTML = html; requestAnimationFrame(function () { s.classList.add("on"); $("#scrim").classList.add("on"); }); document.body.classList.add("no-scroll"); var f = $("button, a, input", s); if (f) setTimeout(function () { f.focus(); }, 60); }
  function closeSheet() { var s = $("#sheet"); if (!s.classList.contains("on")) return; s.classList.remove("on"); $("#scrim").classList.remove("on"); document.body.classList.remove("no-scroll"); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }
  function sheetHead(h) { return '<div class="sheet-h"><h3>' + esc(h) + '</h3><button class="ib bare" data-act="close" aria-label="Close">' + I.x + "</button></div>"; }
  function hireSheet(id) {
    var items = id && byId[id] ? [byId[id]] : S.cart.map(function (x) { return byId[x]; });
    var subj = "Interview: Navya Juneja — " + S.role + (items.length ? " (re: " + items.map(function (p) { return p.short; }).join(", ") + ")" : "");
    var body = "Hi Navya,\n\nI saw your zepto × navya portfolio" + (items.length ? " — especially " + items.map(function (p) { return p.name; }).join("; ") : "") + ".\nWe'd like to talk about a " + S.role + " role (" + S.rounds + " interview round" + (S.rounds > 1 ? "s" : "") + ").\n\n";
    var href = "mailto:" + P.email + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
    openSheet('<div class="placed"><button class="ib bare cx" data-act="close" aria-label="Close">' + I.x + '</button><div class="ck">' + I.check + "</div><h3>Order placed!</h3><p>Arriving in <b>10 minutes</b> — the time it takes to read this portfolio.</p>" +
      '<div class="trk"><div class="on"><i></i><b>Order confirmed</b><span>' + esc(S.role) + " · " + S.rounds + " round" + (S.rounds > 1 ? "s" : "") + '</span></div><div class="on"><i></i><b>Packed</b><span>Résumé and ' + (items.length || "all") + " case" + (items.length === 1 ? "" : "s") + ' attached</span></div><div><i></i><b>Out for delivery</b><span>Send the email below</span></div><div><i></i><b>Delivered</b><span>Navya replies within a day</span></div></div>' +
      '<div class="od"><div><span>To pay</span><b class="g">₹0 · first call free</b></div></div>' +
      '<div class="acts"><a class="btn pk lg block" href="' + href + '">' + I.mail + 'Send interview request</a><a class="btn ol block" href="' + P.phoneHref + '">' + I.phone + esc(P.phone) + '</a><a class="btn ol block" href="' + P.linkedin + '" target="_blank" rel="noopener">' + I.linkedin + "Connect on LinkedIn</a></div></div>", "btm");
  }
  function locSheet() {
    openSheet(sheetHead("Delivery location") + '<div class="sheet-b"><p class="mut" style="margin-bottom:14px">Where Navya can join from.</p><div class="locs">' +
      '<div class="on">' + I.pin + "<div><b>Gurgaon, India</b><span>Current · Masters' Union PGP-TBM</span></div><em>Selected</em></div>" +
      "<div>" + I.pin + "<div><b>Bengaluru</b><span>Two years at PhonePe · happy to move back</span></div></div>" +
      "<div>" + I.pin + "<div><b>Mumbai, or anywhere Zepto is</b><span>Open to relocating</span></div></div></div>" +
      '<button class="btn pk block lg" style="margin-top:16px" data-act="hire">Hire Navya</button></div>', "btm");
  }
  function lightbox(id, i) {
    var p = byId[id], all = galleryItems(p), imgs = all.filter(function (m) { return m.type === "img"; });
    var m = all[i]; if (!m || m.type !== "img") return; var k = imgs.indexOf(m);
    openSheet('<div class="lb"><img src="' + m.src + '" alt="' + esc(m.alt) + '"><button class="x" data-act="close" aria-label="Close">' + I.x + "</button>" +
      (imgs.length > 1 ? '<button class="nv p" data-act="lb" data-id="' + id + '" data-k="' + all.indexOf(imgs[(k - 1 + imgs.length) % imgs.length]) + '" aria-label="Previous">' + I.back + '</button><button class="nv n" data-act="lb" data-id="' + id + '" data-k="' + all.indexOf(imgs[(k + 1) % imgs.length]) + '" aria-label="Next">' + I.chev + "</button>" : "") +
      "<p>" + esc(m.alt) + " · " + (k + 1) + " / " + imgs.length + "</p></div>", "wide");
  }
  function mSearch() {
    openSheet(sheetHead("Search") + '<div class="sheet-b"><div class="srch" style="width:100%"><form data-act="searchform" role="search"><span aria-hidden="true">' + I.search + '</span><input id="q2" data-q type="search" autocomplete="off" placeholder="Search for “payments”" aria-label="Search case studies"></form></div><div id="q2r" style="margin-top:10px">' + results("") + "</div></div>", "top");
  }

  /* ---------------- toast ---------------- */
  var tt;
  function toast(html) { var el = $("#toast"); el.innerHTML = html; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("on"); }, 2600); }

  /* ---------------- actions ---------------- */
  function setCart(id, on) {
    var i = S.cart.indexOf(id);
    if (on && i < 0) S.cart.push(id); if (!on && i > -1) S.cart.splice(i, 1);
    save("cart", S.cart);
    renderShell(); rerender();
    toast(on ? "Added to cart · " + esc(byId[id].short) + ' <a href="#/cart">View cart</a>' : "Removed from cart");
  }
  function copyLink() {
    var u = location.href;
    function ok() { toast("Link copied"); }
    if (navigator.clipboard) navigator.clipboard.writeText(u).then(ok, function () { toast("Copy this: " + esc(u)); }); else toast("Copy this: " + esc(u));
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]"); if (!el) return;
    var a = el.getAttribute("data-act"), id = el.getAttribute("data-id"), k = el.getAttribute("data-k");
    switch (a) {
      case "add": e.preventDefault(); e.stopPropagation(); setCart(id, true); break;
      case "rm": e.preventDefault(); e.stopPropagation(); setCart(id, false); break;
      case "more": e.preventDefault(); e.stopPropagation(); toast("Only 1 per customer — but she scales 😉"); break;
      case "hire": e.preventDefault(); hireSheet(id || (parse().parts[0] === "pn" ? parse().parts[1] : null)); break;
      case "place": e.preventDefault(); hireSheet(null); break;
      case "loc": locSheet(); break;
      case "close": closeSheet(); break;
      case "back": if (navCount > 0) history.back(); else location.hash = "#/"; break;
      case "mv": S.mv = k; var m = $("#fresh"); if (m) { m.outerHTML = fresh(); railNav(); } break;
      case "rail": var r = document.getElementById(k); if (r) r.scrollBy({ left: r.clientWidth * 0.8, behavior: "smooth" }); break;
      case "gi": GI[id] = +k; var g = $("#gal"); if (g) g.outerHTML = gallery(byId[id]); break;
      case "rounds": S.rounds = Math.max(1, Math.min(5, S.rounds + (+k))); $("#rOut").textContent = S.rounds; break;
      case "share": if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(function () {}); else copyLink(); break;
      case "lb": lightbox(id, +k); break;
      case "otoggle": var o = $("#o-" + id), op = o.classList.toggle("open"); el.setAttribute("aria-expanded", op); break;
      case "seg": $$(".seg button").forEach(function (b) { b.classList.toggle("on", b === el); }); var ov = $("#ovR"); ov.value = el.getAttribute("data-v"); updMoney(); break;
      case "flt": S.fltOpen = !S.fltOpen; var f = $(".flt"); if (f) f.classList.toggle("on", S.fltOpen); el.setAttribute("aria-expanded", S.fltOpen); break;
      case "clr": S.f = { sort: S.f.sort, seller: [], prov: [], q: "" }; $$("[data-q]").forEach(function (i) { i.value = ""; }); if (location.hash.indexOf("?") > -1) location.hash = "#/cn/all"; else rerender(); break;
      case "clrq": S.f.q = ""; $$("[data-q]").forEach(function (i) { i.value = ""; }); if (location.hash.indexOf("?") > -1) location.hash = "#/cn/all"; else rerender(); break;
      case "msearch": mSearch(); break;
    }
  });
  document.addEventListener("change", function (e) {
    var el = e.target, a = el.getAttribute("data-act");
    if (a === "sort") { S.f.sort = el.value; rerender(); }
    if (a === "role") { S.role = el.value; }
    if (a === "chk") { var k = el.getAttribute("data-k"), arr = S.f[k], ix = arr.indexOf(el.value); if (el.checked && ix < 0) arr.push(el.value); if (!el.checked && ix > -1) arr.splice(ix, 1); S.fltOpen = true; rerender(); }
  });
  function showDrop(inp) {
    if (inp.id === "q2") { $("#q2r").innerHTML = results(inp.value); return; }
    var d = $("#" + inp.id + "d"); if (!d) return; d.innerHTML = results(inp.value); d.classList.add("on");
  }
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.hasAttribute("data-q")) showDrop(el);
    if (el.getAttribute("data-act") === "money") updMoney();
  });
  document.addEventListener("focusin", function (e) { if (e.target.hasAttribute && e.target.hasAttribute("data-q") && e.target.id !== "q2") showDrop(e.target); });
  document.addEventListener("mousedown", function (e) { if (!e.target.closest(".srch")) $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); });
  document.addEventListener("submit", function (e) {
    if (e.target.getAttribute("data-act") === "searchform") {
      e.preventDefault(); var i = $("input", e.target); S.f.q = i.value; i.blur();
      $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); closeSheet();
      var target = "#/cn/all" + (i.value ? "?q=" + encodeURIComponent(i.value) : "");
      if (location.hash === target) rerender(); else location.hash = target;
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); var q = $("#q1"); if (q && q.offsetParent) q.focus(); else mSearch(); }
    if (e.key === "Escape") { closeSheet(); $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); }
    if (e.target.hasAttribute && e.target.hasAttribute("data-q") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      var box = e.target.id === "q2" ? $("#q2r") : $("#" + e.target.id + "d"); if (!box) return;
      var it = $$(".sres", box), cur = it.findIndex(function (x) { return x.classList.contains("act"); });
      if (!it.length) return; e.preventDefault();
      var nx = (cur + (e.key === "ArrowDown" ? 1 : -1) + it.length) % it.length;
      it.forEach(function (x, j) { x.classList.toggle("act", j === nx); });
    }
    if (e.target.hasAttribute && e.target.hasAttribute("data-q") && e.key === "Enter") {
      var b = e.target.id === "q2" ? $("#q2r") : $("#" + e.target.id + "d"), act = b && $(".sres.act", b);
      if (act && e.target.value.trim()) { e.preventDefault(); e.target.blur(); $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); closeSheet(); location.hash = act.getAttribute("href"); }
    }
  });
  $("#scrim").addEventListener("click", closeSheet);
  window.addEventListener("hashchange", function () { navCount++; closeSheet(); $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); route(); });
  window.addEventListener("resize", function () { railNav(); setHdrH(); });
  window.addEventListener("scroll", function () { document.body.classList.toggle("scrolled", window.scrollY > 8); }, { passive: true });

  /* rotating placeholder, the way the store does it */
  var phs = ["payments", "pricing", "PhonePe", "ReconOS", "dark stores", "D2C"], phi = 0;
  setInterval(function () { phi = (phi + 1) % phs.length; $$("[data-q]").forEach(function (i) { if (document.activeElement !== i) i.placeholder = "Search for “" + phs[phi] + "”"; }); }, 2600);

  /* ---------------- SPLASH ---------------- */
  function splash() {
    var sp = $("#splash"); if (!sp) return;
    var seen = false; try { seen = sessionStorage.getItem("zxn_seen") === "1"; } catch (e) {}
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dur = seen ? 1000 : (reduce ? 900 : 3200), done = false;
    if (seen) sp.classList.add("fast");
    function end() { if (done) return; done = true; sp.classList.add("out"); document.body.classList.remove("no-scroll"); setTimeout(function () { sp.classList.add("gone"); sp.setAttribute("aria-hidden", "true"); }, 600); try { sessionStorage.setItem("zxn_seen", "1"); } catch (e) {} }
    document.body.classList.add("no-scroll");
    $("#spSkip").addEventListener("click", end);
    sp.addEventListener("click", function (e) { if (e.target.id !== "spSkip") end(); });
    setTimeout(end, dur);
  }

  /* ---------------- boot ---------------- */
  renderShell(); renderFooter(); route(); splash();
})();
