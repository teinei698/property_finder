// Rule engine: one function per rule group, IDs exactly as in RULES.md.
// Input: real listings (data.js) + the searcher's choices. Output: one decision per listing.
(function () {
  // Thresholds marked (verify) in RULES.md. Change them here only.
  const T = window.THRESHOLDS = {
    minGroup: 10,          // P1: at least 10 comparable live ads
    askBelow: 0.15,        // P4: 15% below median -> question
    hideBelow: 0.25,       // P5: 25% below median + one more red flag -> hidden
    askAbove: 0.25,        // P6: 25% above median, no reason -> question
    shortListBand: 0.15,   // S1: within ±15% of median
    availPastDays: 30,     // L4: "available from" more than 30 days ago
    availBeforeListed: 60, // P5 second flag: "available from" > 60 days before listing date
  };
  const DAY = 864e5;
  const days = (a, b) => Math.round((new Date(a) - new Date(b)) / DAY);
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const pct = x => (x > 0 ? '+' : '') + Math.round(x * 100) + '%';

  // P2: price for the searcher's number of cheques
  function realPrice(l, cheques) {
    const cp = l.audit.chequePrices;
    if (l.c === 'R' && cp && cp[cheques]) return cp[cheques];
    return l.price;
  }

  function evaluate(l, prefs) {
    const today = window.TODAY;
    const a = l.audit;
    const d = { id: l.id, flags: [], questions: [], ok: [] };
    const issue = (rule, text, q) => { d.flags.push({ rule, text, kind: 'issue' }); if (q && !d.questions.includes(q)) d.questions.push(q); };
    const info = (rule, text) => d.flags.push({ rule, text, kind: 'info' });

    const rp = realPrice(l, prefs.cheques);
    const comparable = l.n >= T.minGroup;                       // P1
    const dev = rp / l.median - 1;
    const availPast = days(today, l.avail);
    const availBeforeListed = days(l.listed, l.avail);
    d.realPrice = rp; d.dev = dev; d.comparable = comparable;
    if (rp !== l.price) info('P2', `Ad shows AED ${fmt(l.price)}; for ${prefs.cheques} cheques the text says AED ${fmt(rp)}`);

    // ---------- Hidden / moved out ----------
    if (l.c === 'R' && l.dtcm) {                                 // L2
      d.status = 'notyearly';
      issue('L2', 'Holiday-home (DTCM) licence, not a DLD permit: not a standard yearly lease');
      if (a.conditionalPrice) issue('P3', 'Headline price has a condition: ' + a.conditionalPrice);
      return d;
    }
    const second = [];
    if (availBeforeListed > T.availBeforeListed) second.push(`"available from" ${availBeforeListed} days before it was listed`);
    if (!l.verified) second.push('not verified');
    if (a.photoContradiction) second.push(a.photoContradiction.toLowerCase());
    if (comparable && dev <= -T.hideBelow && second.length) {   // P5
      d.status = 'hidden';
      issue('P5', `${pct(dev)} vs the median of ${l.n} similar ads (AED ${fmt(l.median)}), and ${second.join('; ')}`);
      return d;
    }
    if (!l.verified && a.switchText && a.photoContradiction) {  // B1
      d.status = 'hidden';
      issue('B1', `${a.switchText}. ${a.photoContradiction}. Not verified`);
      return d;
    }

    // ---------- Questions (U1) ----------
    if (comparable && dev <= -T.askBelow && !a.priceReason)      // P4
      issue('P4', `${pct(dev)} vs the median of ${l.n} similar ads (AED ${fmt(l.median)}), no reason given`, 'Why is the price below similar flats in the tower? Which floor and view?');
    if (comparable && dev >= T.askAbove && !a.priceReason)       // P6
      issue('P6', `${pct(dev)} vs the median of ${l.n} similar ads (AED ${fmt(l.median)}), no reason given`, 'What explains the price above similar flats (upgrades, furniture, view)?');
    if (a.conditionalPrice) issue('P3', 'Headline price has a condition: ' + a.conditionalPrice, 'What is the price without that condition?');
    if (!l.permit) issue('L1', 'No DLD permit shown on the ad', 'Can you share the DLD permit number for this ad?');
    (a.contradictions || []).forEach(t => issue('L3', t, /furnish/i.test(t) ? 'Is it furnished, partly furnished or unfurnished?' : 'Is it for sale or for rent, and is it vacant?'));
    if (a.photoContradiction) issue('L3', a.photoContradiction, 'Which is right: the photos or the furnishing field?');
    if (l.c === 'R' && availPast > T.availPastDays) issue('L4', `"Available from" ${l.avail}, ${availPast} days ago`, 'Is it still available? Could we view it this week?');
    if (!l.verified) issue('L5', 'Not a verified listing', 'Is it still available at this price?');
    if (a.genericUnit) issue('B2', a.genericUnit, 'What is the unit number, or at least the floor?');
    if (l.c === 'R' && !l.cheques && !(a.chequePrices && a.chequePrices[prefs.cheques])) issue('P2', 'Number of cheques not stated', `What is the total for ${prefs.cheques} cheques, plus deposit and agency fee?`);
    if (a.dual && l.c === 'R') { info('R9', 'The same flat is also listed for sale (dual listing, not a copy)'); d.questions.push('The owner also lists this flat for sale. Is it being sold, and is a 12-month lease still fine?'); }
    if (a.dual && l.c === 'S') info('R9', 'The same flat is also listed for rent (dual listing, not a copy). Useful to a buyer: it shows the rent it can earn');
    if (a.saleSameRoomAs) info('R2', 'Photos show the same room as 4 rent ads from 4 agencies (Unit B)');
    if (a.paidTwice) info('B4', 'This ad appears twice on the results page (paid slot + organic). Shown once here');

    // ---------- What checks out ----------
    if (l.permit) d.ok.push('DLD permit shown');
    if (l.verified) d.ok.push('Verified listing');
    if (comparable && Math.abs(dev) < T.shortListBand) d.ok.push(`Price in line with ${l.n} similar ads (median AED ${fmt(l.median)})`);
    if (a.priceReason) d.ok.push('Price gap explained (P7): ' + a.priceReason.toLowerCase());
    if (!comparable) d.ok.push(`Only ${l.n} similar ads: price not compared (P1)`);
    if (a.feesStated) d.ok.push('Fees stated: ' + a.feesStated);
    if (l.c === 'R' && availPast <= T.availPastDays) d.ok.push(availPast <= 0 ? `Available from ${l.avail}` : `Available since ${l.avail}`);

    // ---------- S1 ----------
    const priceOk = !comparable || Math.abs(dev) < T.shortListBand || !!a.priceReason;
    d.status = (d.questions.length === 0 && l.permit && l.verified && priceOk) ? 'short' : 'ask';
    if (d.status === 'ask' && d.questions.length === 0) d.questions.push('Is it still available? Could we view it this week?');
    return d;
  }

  // R1/R2/R3: build suspected-copy groups within one rent/sale category
  function groups(listings) {
    const g = {};
    listings.forEach(l => { const k = l.audit.dupGroup; if (k) (g[k] = g[k] || []).push(l); });
    Object.keys(g).forEach(k => { if (g[k].length < 2) delete g[k]; });
    return g;
  }
  // R4: lead ad = cheapest verified (then permit shown, then newest)
  function leadOf(ls, cheques) {
    return [...ls].sort((x, y) => (y.verified - x.verified) || realPrice(x, cheques) - realPrice(y, cheques) || (y.permit - x.permit) || (new Date(y.listed) - new Date(x.listed)))[0];
  }

  window.Rules = { evaluate, groups, leadOf, realPrice, fmt, pct };
})();
