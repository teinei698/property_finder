// PHOTO TAGS: the image-semantic layer, as data.
// Source: Claude visual recognition of the FIRST 3 PHOTOS of each listing, done once on 14 Nov 2026.
// NOT live: a production version would run a vision model on every photo when an ad is posted.
//
// Tag meanings (tri-state, never guess):
//   furnished: 'yes' | 'no' | 'mixed' (photos of a furnished and an empty flat in one ad)
//   kitchen:   'open' (visible inside the living area) | 'separate' | null (not seen)
//   balcony:   a count of DISTINCT balconies seen; the same balcony from two angles counts once.
//              null = no balcony seen in these photos. That is NOT 0: it was simply not photographed.
//   view:      what is visible through windows or from a balcony, or null
//   interior:  false when the first photos show only views, no rooms
//   sameRoom:  id of a group of ads whose photos show the same room (same furniture, fittings, view)
window.PHOTO_TAGS_META = { source: 'Claude visual recognition', photos: 'first 3 photos per listing', date: '2026-11-14', live: false };
window.PHOTO_TAGS = {
  '117697346': { furnished: 'yes', kitchen: null, balcony: null, view: null, interior: true, seen: 'bedroom with bed and side tables' },
  '166539635': { furnished: 'yes', kitchen: null, balcony: null, view: null, interior: true, seen: 'same 3 photos as #1: furnished bedroom' },
  '171966518': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'empty living room, open kitchen at the far wall' },
  '171966710': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'same empty living room and open kitchen as #3, corridor' },
  '168361983': { furnished: 'no', kitchen: 'open', balcony: null, view: 'towers', interior: true, seen: 'empty room, dark-wood open kitchen' },
  '172436243': { furnished: 'no', kitchen: 'open', balcony: null, view: 'towers', interior: true, seen: 'same rooms as #5' },
  '166543340': { furnished: 'no', kitchen: 'open', balcony: 1, view: 'marina, high floor', interior: true, seen: 'empty living room, balcony over the marina, dark-wood kitchen' },
  '166543956': { furnished: 'no', kitchen: null, balcony: null, view: 'Palm and Ain Dubai, high floor', interior: true, seen: 'aerial-style view of the Palm, empty living rooms' },
  '152354372': { furnished: 'no', kitchen: 'open', balcony: null, view: 'towers', interior: true, seen: 'empty, kitchen with washing machine' },
  '166526520': { furnished: 'no', kitchen: 'open', balcony: null, view: 'towers', interior: true, seen: 'same photos as #9' },
  '171961763': { furnished: 'yes', kitchen: null, balcony: null, view: 'city', interior: true, seen: 'sofa, dining table, bedroom' },
  '171969073': { furnished: 'yes', kitchen: null, balcony: null, view: 'city', interior: true, seen: 'same furniture as #11' },
  '163246904': { furnished: 'yes', kitchen: null, balcony: null, view: 'towers and sea', interior: true, sameRoom: 'UB', seen: 'cream boucle sofa, two-tier marble tables, chandelier, herringbone floor, TV wall' },
  '163248524': { furnished: 'yes', kitchen: null, balcony: null, view: 'towers and sea', interior: true, sameRoom: 'UB', seen: 'same photos as #13' },
  '152823022': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'empty rooms, open kitchen' },
  '149092526': { furnished: 'no', kitchen: null, balcony: null, view: 'Palm, high floor', interior: true, seen: 'Palm view from a high floor, empty tiled rooms' },
  '171043151': { furnished: 'no', kitchen: null, balcony: null, view: 'Palm and marina, high floor', interior: true, seen: 'high view with a tower in front, empty rooms with wardrobes' },
  '171043085': { furnished: 'no', kitchen: null, balcony: 1, view: 'marina, high floor', interior: true, seen: 'view through a glass balcony railing, empty living rooms' },
  '164583091': { furnished: null, kitchen: null, balcony: null, view: 'Palm, Atlantis, sea', interior: false, seen: 'views only, one foggy; no rooms in the first photos' },
  '162792136': { furnished: 'no', kitchen: 'open', balcony: null, view: 'towers', interior: true, seen: 'empty rooms, dark open kitchen, two chairs by the window' },
  '159648965': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'empty rooms with curtains, dark kitchen counter' },
  '167910347': { furnished: 'no', kitchen: null, balcony: null, view: 'marina and towers', interior: true, seen: 'exterior view of the marina, empty rooms' },
  '161445449': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'empty rooms and kitchen, although the ad says furnished' },
  '152364757': { furnished: 'no', kitchen: 'separate', balcony: null, view: 'towers', interior: true, seen: 'empty living room, kitchen with washing machine' },
  '131587060': { furnished: 'mixed', kitchen: null, balcony: null, view: null, interior: true, seen: 'a furnished living room and an empty room in the same ad' },
  '171029653': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'empty, kitchen with washing machine' },
  '159600029': { furnished: 'no', kitchen: 'open', balcony: 1, view: 'marina', interior: true, seen: 'balcony with chairs over the marina (2 photos, 1 balcony), open kitchen' },
  '154614649': { furnished: 'no', kitchen: 'open', balcony: null, view: null, interior: true, seen: 'empty rooms, open kitchen' },
  '140131088': { furnished: 'yes', kitchen: null, balcony: null, view: 'city towers', interior: true, seen: 'staged furnished living room' },
  '143735224': { furnished: 'yes', kitchen: 'open', balcony: 1, view: 'city towers', interior: true, seen: 'furnished open-plan room, balcony with chairs' },
  '158259691': { furnished: 'yes', kitchen: null, balcony: null, view: null, interior: true, sameRoom: 'UA', seen: 'grey boucle sofa with orange cushions, round black tables, chandelier, wood floor' },
  '162796160': { furnished: 'yes', kitchen: null, balcony: null, view: 'marina towers', interior: true, sameRoom: 'UB', seen: 'cream boucle sofa, two-tier marble tables, chandelier, dining table' },
  '172418843': { furnished: 'yes', kitchen: null, balcony: null, view: null, interior: true, sameRoom: 'UA', seen: 'same sofa, tables and chandelier as #31' },
  '172424007': { furnished: 'yes', kitchen: null, balcony: null, view: 'towers', interior: true, sameRoom: 'UB', seen: 'same sofa, rug, chandelier and TV wall as #32' },
  '162771266': { furnished: 'yes', kitchen: null, balcony: null, view: 'towers', interior: true, sameRoom: 'UB', seen: 'same dining area and TV wall as #32' },
  '162328203': { furnished: 'yes', kitchen: null, balcony: null, view: null, interior: true, sameRoom: 'UA', seen: 'same sofa and dining area as #31' },
  '85731782': { furnished: 'yes', kitchen: null, balcony: null, view: 'sea', interior: true, seen: 'white sofa, dining table with round mirror' },
  '126111722': { furnished: 'no', kitchen: 'open', balcony: null, view: 'towers', interior: true, seen: 'one real empty flat: living room, open kitchen with washing machine' },
};
