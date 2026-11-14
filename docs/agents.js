// SIMULATED agent replies. No real agent was contacted.
// Each reply is written to show one outcome the assistant must handle (see RULES.md).

// SCENARIO EVENTS (scripted): replies to "what is the unit number?" for suspected-copy groups (R3).
// Unit numbers are never in the ads, so these are simulated events, labelled as such in the app.
window.GROUP_REPLIES = {
  UB: { result: 'confirmed', unit: '22nd floor, unit ending 07', perAd: {
    '163248524': 'Unit on the 22nd floor, ending 07. It IS furnished, the "unfurnished" tick was a mistake. Permit number sent separately.',
    '162796160': '22nd floor, ending 07. Fully upgraded and furnished.',
    '172424007': 'Floor 22, ending 07. Vacant now.',
    '162771266': '22nd floor, ending 07. Brand new furniture.' } },
  UA: { result: 'confirmed', unit: 'mid floor, unit ending 04', perAd: {
    '158259691': 'Mid floor, ending 04. Vacant from 12 Nov.',
    '172418843': 'Mid floor (unit ending 04). Viewing any day.',
    '162328203': 'Unit ending 04, mid floor, available from 15 Nov.' } },
  G3: { result: 'confirmed', unit: '16th floor', perAd: {
    '168361983': '16th floor, road view.',
    '172436243': '16th floor, same flat as my colleague\'s ad. 70k with 4 cheques.' } },
  G4: { result: 'confirmed', unit: 'one 4-bed unit', perAd: {
    '166543340': 'Same unit, we posted it twice by mistake.',
    '166543956': 'Same unit as our other ad.' } },
  G2: { result: 'split', perAd: {
    '171966518': 'This one is unit 1204 (12th floor), with kitchen appliances.',
    '171966710': 'This is a different flat: unit 3104 (31st floor), unfurnished. Same layout, so we reused the photos.' } },
  G1: { result: 'noreply' },
};

// SCENARIO EVENTS (scripted, cannot be known from the ad): used by demo scenarios 2 and 3.
// Every other answer is built only from what the real ad states (see answer() below).
window.AGENT_REPLIES = {
  '149092526': { outcome: 'gone', text: 'Sorry, this one was rented yesterday. I have a similar 4BR in the same tower for AED 395,000, shall I send it?', facts: { all: 'No longer available: rented yesterday. The agent offered a different 4-bed at AED 395,000 (+58%): recorded as bait for this ad (B3)' } },
  '152823022': { outcome: 'changed', text: 'The price is low because it is tenanted until March 2027 at AED 120,000 a year. Vacant on transfer is not possible.', facts: { below: 'Cheaper because it is tenanted until Mar 2027', vacant: 'Not vacant: tenant until Mar 2027 at AED 120,000/yr', avail: 'For sale with the tenant in place' } },
};

// Every question gets its own answer, built from the listing's real data (answers are simulated).
const QTYPE = [
  ['permit', /permit/i], ['cheques', /cheques/i], ['below', /below similar/i], ['above', /above similar/i],
  ['furnish', /furnish|photos or the furnishing/i], ['unit', /unit number|floor\?/i], ['selling', /being sold|also lists this flat for sale/i],
  ['vacant', /vacant|tenanted/i], ['nego', /negotiable/i], ['condition', /without that condition/i], ['viewing', /view it this week/i], ['avail', /available|move in by/i],
];
const qType = q => (QTYPE.find(([, re]) => re.test(q)) || ['other'])[0];
window.qTypeOf = qType;
const AED = n => 'AED ' + Math.round(n).toLocaleString('en-US');
function answer(l, type, cheques) {
  // Returns [agent text, summary, pending?]. Only facts from the real ad are used.
  const f = window.AD_FACTS[l.id] || {}, a = l.audit, cp = a.chequePrices;
  const where = [f.floor, f.view].filter(Boolean).join(', ');
  const photosFurnished = (a.contradictions || []).some(t => /photos show a furnished/i.test(t));
  switch (type) {
    case 'avail': return l.avail <= window.TODAY ? [`The ad is still live and says available since ${l.avail}.`, `ad still live, available since ${l.avail}`] : [`Available from ${l.avail}, as in the ad.`, `available from ${l.avail}`];
    case 'cheques':
      if (cp && cp[cheques]) return [`As in the ad: ${AED(cp[cheques])} for ${cheques} cheques.${a.feesStated ? ' ' + a.feesStated + '.' : ''}`, `${AED(cp[cheques])} for ${cheques} cheques (stated in the ad)`];
      if (l.cheques === cheques) return [`${AED(l.price)} in ${cheques} cheques, as advertised.${a.feesStated ? ' ' + a.feesStated + '.' : ''}`, `${AED(l.price)} in ${cheques} cheques (as advertised)`];
      return [`The ad is ${AED(l.price)}${l.cheques ? ' in ' + l.cheques + ' cheque' + (l.cheques > 1 ? 's' : '') : ''}. For ${cheques} cheques I need to check with the owner.`, `price for ${cheques} cheques`, true];
    case 'below': return a.priceReason ? [`It is priced lower because: ${a.priceReason.toLowerCase()}.`, 'cheaper because ' + a.priceReason.toLowerCase()] : [`The owner set the price${where ? '; the ad says ' + where : ''}. I will ask the owner why it is lower.`, 'why it is cheaper', true];
    case 'above': return a.priceReason ? [`${a.priceReason}, which is why it costs more.`, 'more expensive because ' + a.priceReason.toLowerCase()] : photosFurnished ? ['The photos show it upgraded and furnished; that is why it costs more.', 'more expensive because it is upgraded and furnished (as the photos show)'] : [`I will ask the owner what justifies the price${where ? '; the ad says ' + where : ''}.`, 'why it is more expensive', true];
    case 'furnish': return photosFurnished ? ['It is furnished, as the photos show; the "unfurnished" tick is wrong.', 'furnished (as the photos show; the tick was wrong)'] : [{ YES: 'Furnished, as in the ad.', NO: 'Unfurnished, as in the ad.', PARTLY: 'Partly furnished, as in the ad.' }[l.furnished], { YES: 'furnished', NO: 'unfurnished', PARTLY: 'partly furnished' }[l.furnished]];
    case 'permit': return l.permit ? ['The DLD permit QR is on the ad.', 'permit shown on the ad'] : ['I will send the permit number.', 'the permit number', true];
    case 'unit': return f.floor ? [`It is on the ${f.floor}; the unit number I share at the viewing.`, f.floor + ' (unit number at the viewing)'] : ['I will check the floor and unit number with the owner.', 'floor and unit number', true];
    case 'selling': return a.dual ? ['Yes, the owner has also listed it for sale. I will confirm with the owner whether a 12-month lease is fine.', 'whether a 12-month lease is fine while it is for sale', true] : ['It is not for sale.', 'not for sale'];
    case 'vacant': return f.vacant ? ['The ad says vacant.', 'vacant (as in the ad)'] : ['I will confirm with the owner whether it is vacant or tenanted.', 'vacant or tenanted', true];
    case 'condition': return ['That rate needs a move-in by the 15th. I will ask the owner for the price without it.', 'the price without the move-in condition', true];
    case 'viewing': return ['A viewing can be arranged.', 'viewing can be arranged'];
    case 'nego': return ['I will ask the seller about offers.', 'whether the price is negotiable', true];
    default: return ['I will check with the owner.', 'this question', true];
  }
}

// Facts stated in each real ad's title or description (14 Nov 2026). Simulated agents may only use these.
window.AD_FACTS = {
  '117697346': { view: 'sea view' }, '166539635': { view: 'sea view' },
  '171966518': { floor: 'high floor', view: 'marina and sea views' }, '171966710': { floor: 'high floor', view: 'marina and sea views' },
  '168361983': { floor: 'high floor', view: 'road and community view' }, '172436243': { floor: '16th floor' },
  '166526520': { floor: 'high floor', vacant: true }, '152354372': { floor: 'high floor', vacant: true },
  '163248524': { floor: 'high floor' }, '163246904': { floor: 'high floor' },
  '152823022': { outcome: 'changed', text: 'The price is low because it is tenanted until March 2027 at AED 120,000 a year. Vacant on transfer is not possible.', facts: { below: 'Cheaper because it is tenanted until Mar 2027', vacant: 'Not vacant: tenant until Mar 2027 at AED 120,000/yr', avail: 'For sale with the tenant in place' } },
  '171043151': { view: 'marina and sea views' }, '164583091': { view: 'Palm, Atlantis and Gulf views' },
  '162792136': { view: 'landmark view' }, '167910347': { view: 'partial sea view' }, '161445449': { view: 'partial sea view', vacant: true },
  '171029653': { floor: 'low floor', vacant: true }, '159600029': { view: 'partial sea view', vacant: true }, '154614649': { vacant: true },
  '140131088': { floor: 'high floor', view: 'marina and city skyline' }, '143735224': { floor: 'high floor', view: 'marina and city views' },
  '158259691': { view: 'full sea views' }, '162796160': { view: 'sea view', vacant: true }, '172418843': { floor: 'mid floor', view: 'sea view', vacant: true },
  '172424007': { view: 'sea view', vacant: true }, '162771266': { view: 'sea and Palm views', vacant: true }, '85731782': { view: 'sea view', vacant: true },
  '166543340': { view: 'Dubai Eye and partial sea view', vacant: true }, '166543956': { view: 'Dubai Eye and partial sea view', vacant: true },
  '131587060': { vacant: true }, '126111722': { vacant: true },
};

window.makeReply = function (l, qs, cheques) {
  const types = qs.map(qType);
  const scripted = window.AGENT_REPLIES[l.id];
  let answered = [], pending = [], text, outcome = 'confirmed';
  if (scripted) {
    text = scripted.text; outcome = scripted.outcome;
    if (scripted.facts.all) answered = [{ q: 'All questions', a: scripted.facts.all }];
    else qs.forEach((q, i) => scripted.facts[types[i]] ? answered.push({ q, a: scripted.facts[types[i]] }) : pending.push(q));
  } else {
    const parts = types.map(t => answer(l, t, cheques));
    text = parts.map(x => x[0]).join(' ');
    qs.forEach((q, i) => parts[i][2] ? pending.push(q) : answered.push({ q, a: parts[i][1] }));
  }
  let summary = answered.map(x => x.a).join('; ');
  if (pending.length) summary += (summary ? '. ' : '') + 'To confirm: ' + pending.length + ' question' + (pending.length > 1 ? 's' : '');
  return { outcome, text, answered, pending, scripted: !!scripted, summary };
};
