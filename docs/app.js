(function () {
  const { evaluate, groups, leadOf, realPrice, fmt } = window.Rules;
  const L = window.LISTINGS;
  const byId = Object.fromEntries(L.map(l => [l.id, l]));
  const $ = s => document.querySelector(s);
  const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const KEY = 'pf_scout_v2';
  const fresh = () => ({ brief: { R: {}, S: {} }, stage: { R: 'idle', S: 'idle' }, log: { R: [], S: [] }, threads: {}, groups: {}, dismissed: {}, extra: {}, viewing: {} });
  let P = Object.assign(fresh(), store.get(KEY, {}));
  const save = () => store.set(KEY, P);
  const S = { mode: 'R', beds: 'all', tab: 'search', picks: [] };
  const RULE_NAME = { S1: 'Short list', S2: 'Confirmed', U1: 'Ask first', U2: 'No reply', R1: 'Same photo files', R2: 'Same room', R3: 'Confirm by unit no.', R4: 'One card', R9: 'Dual listing', P1: 'Comparison group', P2: 'Real price', P3: 'Conditional price', P4: 'Below similar', P5: 'Price bait', P6: 'Above similar', P7: 'Reason given', L1: 'No permit', L2: 'Holiday-home licence', L3: 'Contradiction', L4: 'Maybe gone', L5: 'Not verified', B1: 'Bait-and-switch', B2: 'Not one flat', B3: 'Bait after asking', B4: 'Paid twice' };
  const M = () => S.mode;
  const B = () => P.brief[M()];
  const cheques = () => B().cheques || 4;
  const ev = l => evaluate(l, { cheques: cheques() });
  const price = l => { const t = P.threads[l.id]; return t && t.reply && t.reply.price ? t.reply.price : realPrice(l, cheques()); };
  const per = l => l.c === 'R' ? '<span class="meta"> /year</span>' : '';
  const img = l => `<img src="${l.img}" alt="" loading="lazy" onerror="this.style.display='none'">`;
  const kfmt = n => n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 2 : 0).replace(/0$/, '') + 'M' : Math.round(n / 1000) + 'k';
  const hasView = l => /sea|palm|dubai eye|full marina|marina view|views/i.test(l.title);
  const bedsWanted = () => S.beds !== 'all' ? S.beds : B().beds;
  const addDays = d => { const x = new Date(window.TODAY); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };

  // ---------------- the brief: tappable choices only ----------------
  const BEDS = { k: 'beds', ask: 'How many bedrooms?', opts: [['1', '1 bed'], ['2', '2 beds'], ['4', '4 beds']], skip: () => S.beds !== 'all' };
  const DELEGATE = { k: 'delegate', ask: 'Shall I message the agents for you? I only ask about availability, the real price and the unit number, and I never share your budget.', opts: [['yes', 'Yes, ask them'], ['no', 'Not yet, just show me']] };
  const Q = {
    R: [BEDS,
      { k: 'budget', ask: 'What is your top budget per year?', opts: [[80000, 'AED 80k'], [100000, '100k'], [150000, '150k'], [200000, '200k'], [300000, '300k'], [450000, '450k']] },
      { k: 'cheques', ask: 'In how many cheques do you want to pay?', opts: [[1, '1 cheque'], [2, '2 cheques'], [4, '4 cheques']] },
      { k: 'movein', ask: 'When do you need to move in?', opts: [[7, 'Now'], [30, 'Within a month'], [90, 'Within 3 months']] },
      { k: 'furnish', ask: 'Furnished or unfurnished?', opts: [['YES', 'Furnished'], ['NO', 'Unfurnished'], ['ANY', 'Either']] },
      { k: 'prio', multi: true, ask: 'What matters most to you? Pick any.', opts: [['view', 'Sea or Palm view'], ['cost', 'Lowest total cost'], ['now', 'Ready to move in']] },
      DELEGATE],
    S: [BEDS,
      { k: 'budget', ask: 'What is your top budget?', opts: [[1300000, 'AED 1.3M'], [1600000, '1.6M'], [2000000, '2M'], [2500000, '2.5M'], [5000000, '5M']] },
      { k: 'purpose', ask: 'Are you buying to live in or to rent out?', opts: [['live', 'To live in'], ['invest', 'To rent out']] },
      { k: 'vacant', ask: 'Does it need to be vacant on transfer?', opts: [['yes', 'Yes, vacant'], ['no', 'Tenanted is fine']] },
      { k: 'prio', multi: true, ask: 'What matters most to you? Pick any.', opts: [['view', 'Sea or Palm view'], ['cost', 'Lowest price'], ['yield', 'Rental income']] },
      DELEGATE],
  };
  const questions = () => Q[M()].filter(q => !(q.skip && q.skip()));
  const nextQ = () => questions().find(q => B()[q.k] === undefined);
  const label = (q, v) => Array.isArray(v) ? (v.length ? v.map(x => q.opts.find(o => o[0] === x)[1]).join(', ') : 'Nothing special') : (q.opts.find(o => String(o[0]) === String(v)) || [0, v])[1];

  // ---------------- matching the person (personal fit) ----------------
  function fitOf(l, d) {
    const b = B(), out = { ok: true, reasons: [], chips: [] };
    const rp = price(l);
    if (b.budget) {
      if (rp <= b.budget) out.chips.push(['y', `AED ${kfmt(rp)}${l.c === 'R' ? ' on ' + cheques() + ' cheque' + (cheques() > 1 ? 's' : '') : ''}, within your ${kfmt(b.budget)}`]);
      else if (rp <= b.budget * 1.05) out.chips.push(['n', `AED ${kfmt(rp)}: ${Math.round((rp / b.budget - 1) * 100)}% over your budget`]);
      else { out.ok = false; out.reasons.push('over budget'); }
    }
    if (l.c === 'R') {
      const contra = d.flags.some(f => f.rule === 'L3' && /furnish/i.test(f.text));
      if (b.furnish && b.furnish !== 'ANY') {
        if (contra || l.furnished === 'PARTLY') out.chips.push(['n', 'Furnishing to confirm']);
        else if (l.furnished === b.furnish) out.chips.push(['y', b.furnish === 'YES' ? 'Furnished' : 'Unfurnished']);
        else { out.ok = false; out.reasons.push(b.furnish === 'YES' ? 'not furnished' : 'furnished'); }
      }
      if (b.movein) {
        const deadline = addDays(b.movein);
        if (l.avail > deadline) { out.ok = false; out.reasons.push('free only from ' + l.avail); }
        else if (d.flags.some(f => f.rule === 'L4')) out.chips.push(['n', 'Availability to confirm']);
        else out.chips.push(['y', 'Available before your move-in date']);
      }
    }
    if ((b.prio || []).includes('view') && hasView(l)) out.chips.push(['y', 'View in the title']);
    if (l.c === 'S' && l.audit.dual && b.purpose === 'invest') out.chips.push(['y', 'Already listed for rent: rental income visible']);
    return out;
  }
  function score(l, d, fit) {
    const b = B(); let s = 0;
    if (P.threads[l.id] && P.threads[l.id].reply && ['confirmed', 'changed'].includes(P.threads[l.id].reply.outcome)) s += 50;
    if (d.status === 'short') s += 20;
    s += fit.chips.filter(c => c[0] === 'y').length * 6 - fit.chips.filter(c => c[0] === 'n').length * 4;
    if (b.budget) s += 10 * (1 - price(l) / b.budget);
    if ((b.prio || []).includes('cost') && b.budget) s += 15 * (1 - price(l) / b.budget);
    if (l.permit) s += 3; if (l.verified) s += 3;
    return s;
  }

  // ---------------- what Scout sees in this search ----------------
  function analyse() {
    const want = bedsWanted();
    const ls = L.filter(l => l.c === M() && (!want || String(l.beds) === String(want)));
    const G = groups(ls), inG = {}, flats = [];
    Object.entries(G).forEach(([k, ms]) => {
      const st = P.groups[k] && P.groups[k].state;
      if (st === 'split') return;
      ms.forEach(m => inG[m.id] = k);
      flats.push({ kind: st === 'confirmed' ? 'merged' : 'group', key: k, members: ms, lead: leadOf(ms, cheques()) });
    });
    ls.filter(l => !inG[l.id]).forEach(l => flats.push({ kind: 'single', lead: l, members: [l] }));
    const res = { ads: ls.length, flats, aside: [], misfit: [], cands: [], dropped: [], copies: Object.values(G).reduce((n, g) => n + g.length, 0) };
    flats.forEach(f => {
      const l = f.lead, d = ev(l); f.d = d; f.fit = fitOf(l, d);
      const t = P.threads[l.id], r = t && t.reply;
      if (d.status === 'hidden' || d.status === 'notyearly') return res.aside.push(f);
      if (!f.fit.ok) return res.misfit.push(f);
      if (P.dismissed[l.id]) { f.why = 'You said: ' + P.dismissed[l.id]; return res.dropped.push(f); }
      if (f.kind === 'group' && P.groups[f.key] && P.groups[f.key].state === 'noreply') { f.why = 'No reply after 24 hours (U2)'; return res.dropped.push(f); }
      if (r && r.outcome === 'gone') { f.why = r.summary; return res.dropped.push(f); }
      if (r && r.outcome === 'noreply') { f.why = 'No reply after 24 hours (U2)'; return res.dropped.push(f); }
      if (r && r.personal && r.personal[B().purpose + '-' + B().vacant] === 'drop') { f.why = r.personalWhy; return res.dropped.push(f); }
      f.score = score(l, d, f.fit);
      res.cands.push(f);
    });
    res.cands.sort((a, b) => b.score - a.score);
    return res;
  }

  // ---------------- Scout's delegation (simulated agents) ----------------
  function personalQs(l, d) {
    const b = B(), qs = [...d.questions];
    if (l.c === 'R' && b.movein) qs.unshift(`Can I move in by ${addDays(b.movein)}?`);
    if (l.c === 'R' && !qs.some(q => /cheques/.test(q))) qs.push(`What is the total for ${cheques()} cheques, plus deposit and agency fee?`);
    if (l.c === 'S' && b.vacant === 'yes' && !qs.some(q => /vacant/i.test(q))) qs.push('Is it vacant on transfer?');
    return [...new Set(qs)].slice(0, 4);
  }
  function logLine(text, mode = M()) { P.log[mode].push(text); save(); }
  function askAgent(l, qs, delay) {
    P.threads[l.id] = { questions: qs, reply: null }; save();
    setTimeout(() => {
      const r = window.AGENT_REPLIES[l.id] || window.defaultReply(l);
      P.threads[l.id].reply = r; save();
      logLine(`<b>${l.broker}</b> replied about the ${l.beds}-bed at AED ${kfmt(realPrice(l, cheques()))}: ${r.summary}`, l.c);
      render();
    }, delay);
  }
  function askGroup(k, ms, delay) {
    P.groups[k] = { state: 'asked' }; save();
    setTimeout(() => {
      const R = window.GROUP_REPLIES[k] || { result: 'confirmed', unit: 'same unit' };
      P.groups[k] = { state: R.result, unit: R.unit };
      const ag = new Set(ms.map(m => m.broker)).size;
      if (R.result === 'confirmed') {
        const lead = leadOf(ms, cheques());
        P.threads[lead.id] = { questions: ['What is the unit number, or at least the floor?'], reply: { outcome: 'confirmed', text: (R.perAd || {})[lead.id] || 'Same unit.', summary: `Same flat confirmed by ${ms.length} ads from ${ag} agencies (${R.unit}). Cheapest verified: AED ${fmt(price(lead))} via ${lead.broker} (R3, R4).` } };
        logLine(`${ms.length} ads from ${ag} agencies gave the same unit (${R.unit}): <b>one flat</b>. I kept the cheapest verified ad, AED ${kfmt(price(lead))} (R3, R4).`, ms[0].c);
      } else if (R.result === 'split') {
        ms.forEach(m => { P.threads[m.id] = { questions: ['What is the unit number, or at least the floor?'], reply: { outcome: 'confirmed', text: R.perAd[m.id], summary: 'Its own flat: ' + R.perAd[m.id] } }; });
        logLine(`${ms.length} ads shared photos, but the agent says they are <b>different flats</b> with the same layout. I show them separately. (Rule R1 alone would have been wrong.)`, ms[0].c);
      } else logLine(`No reply about the ${ms.length} ads that look like one flat. They stay visible but move down (U2).`, ms[0].c);
      save(); render();
    }, delay);
  }
  function work() {
    const mode = M(), b = B();
    P.stage[mode] = 'working'; P.log[mode] = []; save();
    const a = analyse();
    const want = bedsWanted();
    const lines = [
      `I checked all <b>${a.ads}</b> ${want ? want + '-bed ' : ''}ads for ${mode === 'R' ? 'rent' : 'sale'} in Elite Residence.`,
      a.copies ? `<b>${a.copies}</b> ads look like copies of the same flat (same photos or same room). I will ask for unit numbers before merging them (R1, R2, R3).` : null,
      a.aside.length ? `I set aside <b>${a.aside.length}</b> as likely bait or not a yearly lease. Tap "What Scout did" to see why.` : null,
      a.misfit.length ? `<b>${a.misfit.length}</b> do not fit your answers (${[...new Set(a.misfit.flatMap(f => f.fit.reasons.map(r => r.startsWith('free only') ? 'move-in date' : r)))].join(', ')}).` : null,
      `<b>${a.cands.length}</b> could fit you.`,
    ].filter(Boolean);
    lines.forEach(x => logLine(x, mode));
    if (b.delegate === 'yes') {
      let n = 0;
      a.cands.forEach((f, i) => {
        const delay = 1400 + i * 900;
        if (f.kind === 'group' && !P.groups[f.key]) { askGroup(f.key, f.members, delay); n++; }
        else if (f.kind === 'single' && !P.threads[f.lead.id]) { askAgent(f.lead, personalQs(f.lead, f.d), delay); n++; }
      });
      logLine(n ? `I am messaging <b>${n}</b> agent${n > 1 ? 's' : ''} now. Answers will appear here and on each flat.` : 'Nothing new to ask.', mode);
    } else logLine('Here is what I found. Tap "Ask the agent for me" on any flat and I will ask.', mode);
    P.stage[mode] = 'done'; save(); render();
  }

  // ---------------- rendering ----------------
  function renderFilters() {
    $('#filters').innerHTML = ['all', '1', '2', '4'].map(b => `<span class="chip ${S.beds === b ? 'on' : ''}" data-beds="${b}">${b === 'all' ? 'Any beds' : b + ' bed'}</span>`).join('');
    $('#filters').querySelectorAll('[data-beds]').forEach(e => e.onclick = () => { S.beds = e.dataset.beds; render(); });
  }

  function briefHtml() {
    const qs = questions(); let h = '';
    qs.forEach(q => {
      const v = B()[q.k];
      if (v === undefined) return;
      h += `<div class="say">${q.ask}</div><div class="you">${label(q, v)}</div>`;
    });
    const q = nextQ();
    if (q) {
      h += `<div class="say">${q.ask}</div><div class="chips">${q.opts.map(o => `<span class="opt ${q.multi && S.picks.includes(o[0]) ? 'sel' : ''}" data-ans="${o[0]}">${o[1]}</span>`).join('')}${q.multi ? '<span class="opt go" data-done="1">Done</span>' : ''}</div>`;
    }
    return h;
  }
  function bindBrief() {
    const q = nextQ(); if (!q) return;
    document.querySelectorAll('[data-ans]').forEach(e => e.onclick = () => {
      const raw = e.dataset.ans, opt = q.opts.find(o => String(o[0]) === raw), v = opt[0];
      if (q.multi) { S.picks = S.picks.includes(v) ? S.picks.filter(x => x !== v) : [...S.picks, v]; return render(); }
      B()[q.k] = v; save();
      if (!nextQ()) work(); else render();
    });
    const d = document.querySelector('[data-done]'); if (d) d.onclick = () => { B()[q.k] = S.picks; S.picks = []; save(); if (!nextQ()) work(); else render(); };
  }

  function costLine(l) {
    const p = price(l);
    if (l.c === 'R') {
      const dep = l.furnished === 'YES' ? 0.1 : 0.05, fee = p * 0.05 * 1.05, first = p / cheques();
      return `To move in: first cheque AED ${fmt(first)} + deposit ~${dep * 100}% (AED ${fmt(p * dep)}) + agency fee ~5% + VAT (AED ${fmt(fee)}) ≈ <b>AED ${fmt(first + p * dep + fee)}</b> <span class="muted">(typical rates, Scout confirms with the agent)</span>`;
    }
    return `Purchase costs: price + DLD transfer fee ~4% (AED ${fmt(p * 0.04)}) + agency fee ~2% (AED ${fmt(p * 0.02)}) ≈ <b>AED ${fmt(p * 1.06)}</b> <span class="muted">(typical rates)</span>`;
  }

  function flatCard(f, rank) {
    const l = f.lead, t = P.threads[l.id], r = t && t.reply, g = f.kind !== 'single';
    const ag = new Set(f.members.map(m => m.broker)).size;
    let trust = [];
    if (r && ['confirmed', 'changed'].includes(r.outcome)) trust.push(['y', '✓ Confirmed by agent (S2)']);
    else if (t || (g && P.groups[f.key] && P.groups[f.key].state === 'asked')) trust.push(['', '⏳ Waiting for the agent']);
    if (f.kind === 'merged') trust.push(['y', `Same flat as ${f.members.length - 1} other ad${f.members.length > 2 ? 's' : ''}, cheapest shown`]);
    if (f.kind === 'group') trust.push(['n', `${f.members.length} ads, ${ag} ${ag > 1 ? 'agencies' : 'agency'}: maybe one flat`]);
    if (l.permit) trust.push(['y', 'DLD permit']); else trust.push(['n', 'No permit shown']);
    if (l.verified) trust.push(['y', 'Verified']);
    const issues = r ? [] : f.d.flags.filter(x => x.kind === 'issue').slice(0, 2);
    const personal = r && r.personal && r.personal[B().purpose + '-' + B().vacant] === 'keep' ? `<div class="fit y">${r.personalWhy}</div>` : '';
    const ps = f.members.map(m => price(m));
    const priceTxt = f.kind === 'group' ? `AED ${fmt(Math.min(...ps))}–${fmt(Math.max(...ps))}` : `AED ${fmt(price(l))}`;
    return `<div class="card" data-flat="${l.id}" ${g ? `data-gk="${f.key}"` : ''}>${img(l)}<div class="body">
      ${rank ? `<div class="rank">#${rank} for you</div>` : ''}
      <div class="price">${priceTxt}${per(l)}</div>
      <div class="meta">${l.beds} bed · ${fmt(l.sqft)} sqft · ${f.kind === 'group' ? ag + ' agencies' : l.broker}</div>
      <div>${f.fit.chips.map(c => `<span class="fit ${c[0]}">${c[1]}</span>`).join('')}${personal}</div>
      <div>${trust.map(c => `<span class="fit ${c[0]}">${c[1]}</span>`).join('')}</div>
      ${r ? `<div class="agentsaid"><b>Agent:</b> ${r.summary}</div>` : ''}
      ${issues.length ? `<ul class="why">${issues.map(x => `<li><span class="rid">${x.rule}</span>${x.text}</li>`).join('')}</ul>` : ''}
      ${f.kind !== 'group' ? `<div class="cost">${costLine(l)}</div>` : ''}
      ${P.viewing[l.id] ? `<div class="fit y">Viewing requested: ${P.viewing[l.id]}</div>` : ''}
      ${(P.extra[l.id] || []).map(x => `<div class="agentsaid"><b>You asked:</b> ${x.q}<br><b>Agent:</b> ${x.a}</div>`).join('')}
      <div class="chips" data-stop="1">${actions(f)}</div>
      <div data-panel="${l.id}" data-stop="1"></div>
    </div></div>`;
  }
  function actions(f) {
    const l = f.lead, t = P.threads[l.id], r = t && t.reply;
    let a = '';
    if (f.kind === 'group' && !P.groups[f.key]) a += `<span class="opt go" data-act="group" data-id="${l.id}" data-k="${f.key}">Ask for the unit number</span>`;
    else if (!t && f.kind === 'single') a += `<span class="opt go" data-act="ask" data-id="${l.id}">Ask the agent for me</span>`;
    if (r && ['confirmed', 'changed'].includes(r.outcome) && !P.viewing[l.id]) a += `<span class="opt go" data-act="view" data-id="${l.id}">Book a viewing</span>`;
    if (r) a += `<span class="opt" data-act="more" data-id="${l.id}">Ask something else</span>`;
    a += `<span class="opt" data-act="why" data-id="${l.id}">Why Scout trusts this</span><span class="opt" data-act="no" data-id="${l.id}">Not for me</span>`;
    return a;
  }
  const MORE = { R: [['Is parking included?', 'Yes, one covered parking space.'], ['Are pets allowed?', 'Small pets are allowed with the landlord\'s approval.'], ['Can I pay monthly?', 'Monthly is possible through the Rent in 12 option, at a slightly higher total.'], ['Is the agency fee negotiable?', 'The fee is 5% + VAT, but it can be discussed for a quick signing.']],
    S: [['What is the service charge?', 'Around AED 20 per sqft per year; the statement is available on request.'], ['Is the price negotiable?', 'The seller will consider reasonable offers.'], ['Is there a mortgage on it?', 'Yes, a small mortgage, cleared at transfer.']] };
  function bindCards() {
    document.querySelectorAll('[data-stop]').forEach(e => e.onclick = ev => ev.stopPropagation());
    document.querySelectorAll('[data-flat]').forEach(e => e.onclick = () => e.dataset.gk ? openGroup(e.dataset.gk) : openListing(e.dataset.flat));
    document.querySelectorAll('[data-act]').forEach(e => e.onclick = ev => {
      ev.stopPropagation();
      const id = e.dataset.id, l = byId[id], panel = document.querySelector(`[data-panel="${id}"]`);
      const act = e.dataset.act;
      if (act === 'ask') { askAgent(l, personalQs(l, ev2(l)), 1600); logLine(`Asking <b>${l.broker}</b> about the ${l.beds}-bed at AED ${kfmt(price(l))}.`); render(); }
      if (act === 'group') { const ms = L.filter(x => x.audit.dupGroup === e.dataset.k && x.c === M()); askGroup(e.dataset.k, ms, 1800); logLine(`Asking ${new Set(ms.map(m => m.broker)).size} agencies for the unit number of the flat they all advertise.`); render(); }
      if (act === 'view') panel.innerHTML = `<div class="say">When suits you?</div><div class="chips">${['Tomorrow after 6pm', 'Saturday morning', 'Saturday afternoon', 'Sunday any time'].map(s => `<span class="opt" data-slot="${s}">${s}</span>`).join('')}</div>`;
      if (act === 'more') panel.innerHTML = `<div class="say">What else should I ask?</div><div class="chips">${MORE[l.c].map((x, i) => `<span class="opt" data-more="${i}">${x[0]}</span>`).join('')}</div>`;
      if (act === 'no') panel.innerHTML = `<div class="say">Got it. Why not?</div><div class="chips">${['Too expensive', 'Wrong floor or view', 'Don\'t like the photos', 'Already viewed it'].map(s => `<span class="opt" data-no="${s}">${s}</span>`).join('')}</div>`;
      if (act === 'why') openListing(id);
      panel && panel.querySelectorAll('[data-slot]').forEach(s => s.onclick = () => { P.viewing[id] = s.dataset.slot; logLine(`Asked ${l.broker} for a viewing: ${s.dataset.slot}. The agent will confirm the time with you directly.`); save(); render(); });
      panel && panel.querySelectorAll('[data-more]').forEach(s => s.onclick = () => { const x = MORE[l.c][+s.dataset.more]; (P.extra[id] = P.extra[id] || []).push({ q: x[0], a: x[1] + ' (simulated)' }); save(); render(); });
      panel && panel.querySelectorAll('[data-no]').forEach(s => s.onclick = () => { P.dismissed[id] = s.dataset.no; logLine(`Removed the ${l.beds}-bed at AED ${kfmt(price(l))} (${s.dataset.no.toLowerCase()}).`); save(); render(); });
    });
  }
  const ev2 = l => ev(l);

  function shortlistHtml(a) {
    const ready = a.cands.filter(f => { const t = P.threads[f.lead.id]; return t && t.reply; });
    const rest = a.cands.filter(f => !ready.includes(f));
    let h = '';
    h += ready.length ? `<div class="section">Your short list (${ready.length})</div><div class="note">Checked by Scout and confirmed by the agent, best fit first.</div>${ready.map((f, i) => flatCard(f, i + 1)).join('')}` : '';
    h += rest.length ? `<div class="section">${ready.length ? 'Still checking' : 'Could fit you'} (${rest.length})</div>${rest.map(f => flatCard(f)).join('')}` : '';
    if (!a.cands.length) h += `<div class="empty">Nothing fits all your answers yet.<br>Try changing one answer.</div>`;
    return h;
  }
  function workHtml(a) {
    const row = (f, why) => `<div class="q" style="display:block" data-flat="${f.lead.id}"><b>${f.lead.beds} bed · AED ${kfmt(price(f.lead))}</b> <span class="muted">${f.lead.broker}</span><br><span class="muted">${why}</span></div>`;
    let h = `<details class="drawer"><summary>What Scout did for you</summary><div class="pad" style="padding-top:0">`;
    h += P.log[M()].map(x => `<div class="log">• ${x}</div>`).join('');
    if (a.aside.length) h += `<div class="section" style="margin-left:0">Set aside as likely bait (${a.aside.length})</div>` + a.aside.map(f => row(f, f.d.flags.filter(x => x.kind === 'issue').map(x => `<span class="rid">${x.rule}</span>${x.text}`).join('<br>'))).join('');
    if (a.dropped.length) h += `<div class="section" style="margin-left:0">Dropped (${a.dropped.length})</div>` + a.dropped.map(f => row(f, f.why)).join('');
    if (a.misfit.length) h += `<div class="section" style="margin-left:0">Do not fit your answers (${a.misfit.length})</div>` + a.misfit.map(f => row(f, f.fit.reasons.join(', '))).join('');
    return h + '</div></details>';
  }

  function renderSearch() {
    const mode = M(), stage = P.stage[mode];
    const want = bedsWanted();
    const ads = L.filter(l => l.c === mode && (S.beds === 'all' || String(l.beds) === S.beds));
    let h = `<div class="scout"><h3>🛡️ Scout</h3>`;
    if (stage === 'idle') h += `<div class="say">I can turn these ${ads.length} ads into a short list you can trust: I remove likely bait, merge copies of the same flat, and ask agents your questions. You just tap answers.</div><div class="chips"><span class="opt go" id="start">Build my short list</span></div>`;
    else if (stage === 'brief') h += briefHtml();
    else h += `<div class="say">Your brief: ${questions().filter(q => q.k !== 'delegate').map(q => label(q, B()[q.k] ?? (q.k === 'beds' ? S.beds : ''))).join(' · ')}</div><div class="chips"><span class="opt" id="edit">Change my answers</span></div>`;
    h += '</div>';
    if (stage === 'done' || stage === 'working') {
      const a = analyse();
      const lastLog = P.log[mode].slice(-1)[0];
      h += `<div class="note">${lastLog ? '🛡️ ' + lastLog : ''}</div>`;
      h += shortlistHtml(a) + workHtml(a);
    }
    h += `<details class="drawer"><summary>All ${ads.length} ads, as listed today (not checked)</summary>${ads.map(l => `<div class="card" data-flat="${l.id}">${img(l)}<div class="body"><div class="price">AED ${fmt(l.price)}${per(l)}</div><div class="meta">${l.beds} bed · ${fmt(l.sqft)} sqft · ${l.broker}</div>${l.paid ? `<span class="badge b-paid">${l.paid}</span>` : ''}</div></div>`).join('')}</details>`;
    h += `<div class="note">Real listings from propertyfinder.ae (Elite Residence, Dubai Marina, 14 Nov 2026). Agent replies are simulated.</div>`;
    $('#main').innerHTML = h;
    const st = $('#start'); if (st) st.onclick = () => { P.stage[mode] = 'brief'; save(); render(); };
    const ed = $('#edit'); if (ed) ed.onclick = () => { P.brief[mode] = {}; P.stage[mode] = 'brief'; save(); render(); };
    bindBrief(); bindCards();
  }

  function renderList() {
    let h = `<div class="entry">📱 Your short list and agent replies are saved to your Property Finder account: start on the web, continue in the app, and get a push notification when an agent replies. <span style="opacity:.7">(Simulated here with this browser's storage.)</span></div>`;
    if (P.stage[M()] === 'idle' || P.stage[M()] === 'brief') h += `<div class="empty">No short list for ${M() === 'R' ? 'renting' : 'buying'} yet.<br>Go to Search and tap "Build my short list".</div>`;
    else { const a = analyse(); h += shortlistHtml(a) + workHtml(a); }
    h += `<div style="margin:12px"><button class="btn ghost small" id="reset">Reset demo</button></div>`;
    $('#main').innerHTML = h; bindCards(); $('#reset').onclick = reset;
  }

  // ---------------- detail sheets (rule-by-rule check) ----------------
  function openSheet(html) { $('#sheet').innerHTML = '<button class="close" id="x">×</button>' + html; $('#sheet').style.display = 'block'; $('#bg').style.display = 'block'; $('#x').onclick = closeSheet; $('#sheet').scrollTop = 0; }
  function closeSheet() { $('#sheet').style.display = 'none'; $('#bg').style.display = 'none'; }
  $('#bg').onclick = closeSheet;
  function openListing(id) {
    const l = byId[id], d = ev(l), t = P.threads[id];
    const statusTxt = { short: '<span style="color:var(--ok)">passes every check (S1)</span>', ask: '<span style="color:var(--warn)">needs answers from the agent (U1)</span>', hidden: '<span style="color:var(--bad)">likely bait, set aside</span>', notyearly: '<span style="color:var(--bad)">not a standard yearly lease</span>' }[d.status];
    let h = `<img src="${l.img}" alt="" onerror="this.style.display='none'"><div class="pad">
      <div class="price">AED ${fmt(price(l))}${l.c === 'R' ? ' /year' : ''}</div>
      <div class="meta">${l.title}</div><div class="meta">${l.beds} bed · ${fmt(l.sqft)} sqft · listed ${l.listed} · ${l.broker} (${l.agent})</div>
      <div class="box" style="background:#f9fafb;border:1px solid var(--line)"><h4>🛡️ Scout's check: ${statusTxt}</h4>
      ${d.ok.length ? `<ul>${d.ok.map(p => `<li>✓ ${p}</li>`).join('')}</ul>` : ''}
      ${d.flags.length ? `<ul style="margin-top:6px">${d.flags.map(f => `<li><span class="rid">${f.rule} · ${RULE_NAME[f.rule] || ''}</span><br>${f.text}</li>`).join('')}</ul>` : ''}
      ${d.comparable ? `<div class="muted" style="margin-top:6px">Compared with ${l.n} live ads in this tower with the same plan (median AED ${fmt(l.median)}).</div>` : ''}</div>`;
    if (t) h += `<div class="box" style="background:#fff;border:1px solid var(--line)"><h4>Scout ↔ ${l.agent} (${l.broker})</h4><div class="bubble me">Hi, for a client, about your ad ${l.id}:<br>${t.questions.map(q => '• ' + q).join('<br>')}</div>${t.reply ? (t.reply.text ? `<div class="bubble them">${t.reply.text}</div>` : '') + `<div class="bubble scout"><b>Scout:</b> ${t.reply.summary}</div>` : '<div class="muted">⏳ Waiting for the agent… (simulated)</div>'}</div>`;
    h += `<div class="grid2"><a class="btn ghost small" style="text-align:center;text-decoration:none" href="${l.url}" target="_blank" rel="noopener">Open the real listing</a><button class="btn ghost small" id="call">Call agent myself</button></div><div class="note" style="margin:8px 0 0">Call directly if you want to view today or already know this agent.</div></div>`;
    openSheet(h);
    $('#call').onclick = () => alert('In the real app this opens Call / WhatsApp, exactly as today.');
  }
  function openGroup(k) {
    const ms = L.filter(l => l.audit.dupGroup === k && l.c === M()), g = P.groups[k];
    const rule = ms.some(m => m.audit.photoSemanticMatch) ? ['R2', 'the photos show the same room (same furniture, fittings and view) under different watermarks.'] : ['R1', 'these ads share identical photo files.'];
    let h = `<img src="${ms[0].img}" alt="" onerror="this.style.display='none'"><div class="pad"><h3 style="margin:2px 0">${ms.length} ads that may be one flat</h3>
      <div class="box" style="background:var(--infobg)"><span class="rid">${rule[0]}</span>${rule[1]}<br><span class="muted">This tower has many identical floor plans, and agencies sometimes reuse photos for a twin flat. Scout merges them only when the agents give the same unit number (R3).</span>${g ? `<br><b>Status:</b> ${{ asked: 'asked, waiting', confirmed: 'confirmed one flat (' + g.unit + ')', split: 'different flats', noreply: 'no reply' }[g.state]}` : ''}</div>
      ${ms.map(m => `<div class="q" style="display:block"><b>AED ${fmt(price(m))}</b> · ${m.broker} ${m.verified ? '· verified' : '· <span style="color:var(--warn)">not verified</span>'} ${m.permit ? '' : '· <span style="color:var(--warn)">no permit shown</span>'}<br><span class="muted">${m.title}</span> · <a href="${m.url}" target="_blank" rel="noopener">real ad</a> · <a href="#" data-one="${m.id}">Scout's check</a></div>`).join('')}</div>`;
    openSheet(h);
    document.querySelectorAll('[data-one]').forEach(a => a.onclick = e => { e.preventDefault(); openListing(a.dataset.one); });
  }

  // ---------------- how it works + scenarios ----------------
  const SCEN = {
    1: ['R', '2', { budget: 200000, cheques: 4, movein: 30, furnish: 'YES', prio: ['view'], delegate: 'yes' }],
    2: ['R', '4', { budget: 300000, cheques: 4, movein: 30, furnish: 'ANY', prio: ['cost'], delegate: 'yes' }],
    3: ['S', '2', { budget: 2000000, purpose: 'live', vacant: 'yes', prio: ['cost'], delegate: 'yes' }],
    4: ['S', '1', { budget: 1300000, purpose: 'invest', vacant: 'no', prio: ['yield'], delegate: 'yes' }],
  };
  function scenario(n) {
    const [mode, beds, brief] = SCEN[n];
    S.mode = mode; S.beds = beds; S.tab = 'search'; P.brief[mode] = Object.assign({ beds }, brief); save(); work();
  }
  function renderAbout() {
    $('#main').innerHTML = `<div class="pad">
      <h3 style="margin-top:0">Scout: your own assistant inside the search</h3>
      <p>Tell Scout what you need by tapping a few answers. It removes likely bait, merges copies of the same flat, asks agents your questions, and gives you a short list you can trust. The agent stays in the deal.</p>
      <h4>Try it with real listings</h4>
      <button class="btn ghost small" data-sc="1">1 · Rent: one furnished flat, 4 agencies, 4 prices</button>
      <button class="btn ghost small" data-sc="2" style="margin-top:6px">2 · Rent: a 4-bed 35% below similar flats</button>
      <button class="btn ghost small" data-sc="3" style="margin-top:6px">3 · Buy to live in: a 2-bed 19% below similar flats</button>
      <button class="btn ghost small" data-sc="4" style="margin-top:6px">4 · Buy to rent out: a flat also listed for rent</button>
      <p class="muted">Tip for 3: tap "Change my answers" and pick "To rent out". The same flat comes back, because its tenant is income for an investor.</p>
      <h4>Where Scout lives</h4>
      <ol><li><b>Search results:</b> the Scout card above the list. Nothing happens until you tap "Build my short list".</li>
      <li><b>Each flat:</b> "Ask the agent for me", "Book a viewing", "Ask something else" and "Why Scout trusts this" sit on the card, next to the normal Call button.</li>
      <li><b>My short list:</b> saved to your account, so you can start on the web and continue in the app, with a push when an agent replies.</li></ol>
      <h4>Real and simulated</h4>
      <ul><li><b>Real:</b> 38 listings from Elite Residence, Dubai Marina, and price medians from all 442 live ads in the tower.</li>
      <li><b>Real logic:</b> every check follows RULES.md; rule numbers are shown.</li>
      <li><b>Manual check:</b> which ads show the same room (photos compared by eye).</li>
      <li><b>Simulated:</b> every agent reply. Cost estimates use typical Dubai rates and are labelled as estimates.</li></ul>
      <button class="btn ghost small" id="reset2">Reset demo</button></div>`;
    document.querySelectorAll('[data-sc]').forEach(b => b.onclick = () => scenario(+b.dataset.sc));
    $('#reset2').onclick = reset;
  }
  function reset() { P = fresh(); save(); S.tab = 'search'; S.beds = 'all'; render(); }

  // personalised outcomes for buyer scenario 3 (same reply, different person)
  if (window.AGENT_REPLIES['152823022']) Object.assign(window.AGENT_REPLIES['152823022'], { personal: { 'live-yes': 'drop', 'invest-no': 'keep', 'invest-yes': 'drop', 'live-no': 'keep' }, personalWhy: 'Tenanted until Mar 2027 at AED 120,000/yr: ~6.7% gross income for an investor, but not vacant for you' });
  if (window.AGENT_REPLIES['152354372']) Object.assign(window.AGENT_REPLIES['152354372'], { personal: { 'invest-no': 'keep', 'invest-yes': 'keep', 'live-yes': 'keep', 'live-no': 'keep' }, personalWhy: 'Rent ad for the same flat: AED 75,000/yr, ~6.25% gross yield' });

  function render() {
    document.querySelectorAll('[data-mode]').forEach(e => e.classList.toggle('on', e.dataset.mode === S.mode));
    ['search', 'list', 'about'].forEach(t => $('#nav-' + t).classList.toggle('on', S.tab === t));
    const n = Object.values(P.threads).filter(t => t.reply && ['confirmed', 'changed'].includes(t.reply.outcome)).length;
    $('#navcount').innerHTML = n ? `<span class="count">${n}</span>` : '';
    renderFilters();
    ({ search: renderSearch, list: renderList, about: renderAbout })[S.tab]();
  }
  document.querySelectorAll('[data-mode]').forEach(e => e.onclick = () => { S.mode = e.dataset.mode; S.beds = 'all'; S.picks = []; render(); });
  $('#nav-search').onclick = () => { S.tab = 'search'; render(); };
  $('#nav-list').onclick = () => { S.tab = 'list'; render(); };
  $('#nav-about').onclick = () => { S.tab = 'about'; render(); };
  render();
})();
