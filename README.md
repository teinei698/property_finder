# Scout: a short list you can trust

A personal assistant for one person looking for a home on Property Finder. It lives inside the search, not on the home page:

- **Brief by tapping:** budget, cheques, move-in date, furnishing, priorities, and which questions to ask agents.
- **Checks every ad** (RULES.md): likely bait is set aside with the reason, copies of the same flat are flagged and merged once the agents confirm the unit, and the price shown is the real price for your number of cheques.
- **Asks the agents for you:** each reply is split by AI into ✅ answered and ⏳ still to confirm. The agent stays in the deal.
- **Shows its evidence:** every fact is labelled 📊 portal data, 📝 AI read the ad, 📷 AI looked at the photos, or ⚖️ rule.

Works for renters and buyers. Built on 38 real listings from Elite Residence, Dubai Marina.

## Files
| File | What |
|---|---|
| `Audit.md` | The 38 listings checked, with links and findings |
| `Rule.md` | The rules, and when each is wrong |
| `ONE-PAGER.md` | Problem, placement, agents, metrics, test, what is missing |
| `AI-LOG.md` | Confident wrong AI answers and how they were caught |
| `docs/` | The prototype (static HTML/JS, no build step) |

## Real vs simulated
| Part | Status |
|---|---|
| Listings, prices, photos, permits, dates; medians from all 442 live ads | Real (propertyfinder.ae, 14 Nov 2026) |
| Rule engine (`docs/rules.js`) | Real logic, matches Rule.md |
| Photo tags (`docs/photo_tags.js`) | Claude visual recognition of the first 3 photos per listing, 14 Nov 2026, not live |
| Agent replies (`docs/agents.js`) | Simulated, using only what each real ad states; scenario events (e.g. "just rented") are scripted and labelled |
| Account sync web ↔ app | Mocked with browser storage |

## Run locally
Open `docs/index.html` in a browser.

## Live app
- **Phone:** https://teinei698.github.io/property_finder/
- **Desktop:** https://teinei698.github.io/property_finder/desktop.html
