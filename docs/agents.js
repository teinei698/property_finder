// SIMULATED agent replies. No real agent was contacted.
// Each reply is written to show one outcome the assistant must handle (see RULES.md).

// Replies to "what is the unit number / floor?" for suspected-copy groups (R3)
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

// Replies to a single listing's questions
window.AGENT_REPLIES = {
  '149092526': { outcome: 'gone', text: 'Sorry, this one was rented yesterday. I have a similar 4BR in the same tower for AED 395,000, shall I send it?', summary: 'The agent says it is already rented and offered a different flat at AED 395,000 (+58% vs this ad). Marked as gone and recorded as bait for this ad (B3).' },
  '152823022': { outcome: 'changed', text: 'The price is low because it is tenanted until March 2027 at AED 120,000 a year. Vacant on transfer is not possible.', summary: 'Not vacant, as the title says: it is tenanted until March 2027 at AED 120,000 a year. That explains the −19% price.' },
  '152354372': { outcome: 'confirmed', text: 'Vacant now, keys with us. It is also listed for rent in case it does not sell, but we can transfer it vacant.', summary: 'Vacant and can be transferred vacant. The rent ad (AED 75,000 a year) suggests a gross yield of about 6.25%.' },
  '171043151': { outcome: 'confirmed', price: 295000, text: 'Available. 280k is with 2 cheques. With 4 cheques it is 295k. Viewing possible Saturday 11:00.', summary: 'Available. Real price for 4 cheques: AED 295,000 (the headline 280,000 is for 2 cheques).' },
  '166526520': { outcome: 'changed', text: 'The owner is trying to sell, but a tenant can sign 12 months and the lease stays with the new owner.', summary: 'Available. The owner is also trying to sell; the agent says a 12-month lease is fine. Your call.' },
  '159648965': { outcome: 'confirmed', price: 108000, text: 'Available. 105k on 1 cheque, 108k on 4 cheques.', summary: 'Available. AED 108,000 on 4 cheques (the headline 105,000 is for 1 cheque).' },
  '154614649': { outcome: 'confirmed', text: 'Vacant, keys at the office. The seller will consider 1.07M for a quick deal.', summary: 'Vacant. The seller would consider AED 1,070,000.' },
  '171029653': { outcome: 'confirmed', text: 'Vacant now, low floor (single digit), partly furnished. The seller is open to offers.', summary: 'Vacant, low floor, partly furnished. The seller is open to offers.' },
  '162792136': { outcome: 'confirmed', text: 'Available. 69,999 with 1 cheque, 75,000 with 4. Deposit 5%, agency fee 5% + VAT.', summary: 'Available. AED 75,000 on 4 cheques, deposit 5%, fee 5% + VAT.' },
};
window.defaultReply = () => ({ outcome: 'confirmed', text: 'Yes, still available at this price. Happy to arrange a viewing this week.', summary: 'Available at the advertised price. Viewing possible this week.' });
