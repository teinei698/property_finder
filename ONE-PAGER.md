# ONE-PAGER

## 1. The problem behind the problem
- **Audit showed** 
many properties ads have duplicated photos and descriptions. Some of them have completely the same information but the price is different and published by different sellers.(Elite Residence, Dubai Marina: 442 live ads, 38 checked by hand):
  
  16 of 38 ads can be suspected copies according to different criteria. One upgraded 2-bed (Unit B) appears as 5 ads from 4 agencies, priced AED 190k–200k, one of them marked "unfurnished" although its photos show the furnished flat.

  113 of 442 ads come from an agency with several ads of the same type, beds and size.

  9 ads have fields that contradict their own text or photos.
- **Why misleading listings exist:** The merchants want to get more viewers to secure higher probability to trade. Also it is possible that an owner shares its properties to multiple agencies therefore agencies post the same properties.
- **What the searcher really wants:** is a suitable property that fits their expectation. And also more than 95% information is not interesting for users. They don't want to see already shown but uninterested ads to be seen once and once again.


## 2. Where it lives
- **Web:** a Scout card above the search results. The searcher taps a few answers (budget, cheques, move-in date, furnishing, priorities, which questions to ask). Each flat card carries "Ask the agent for me", "Book a viewing" and "Why Scout trusts this", next to the normal Call button.
- **App:** the same short list, with a push notification when an agent replies.
- **Web → app:** the brief, the short list and the agent threads are saved to the account. <!-- adjust -->

## 3. Why use it, and when not to
- **Use it when:** The user can use it while comparing many similar flats; a price looks too good; you want the real price for your number of cheques and written answers before a viewing. 
- **Just call the agent when:** you want to view today; you already know the agent; you want to negotiate yourself. 

## 4. Agents and Property Finder's revenue
- **How PF earns today:** From one perspective agents and agencies buy listing credits and paid exposure (Premium, Featured, Spotlight, Community Top Spot). SuperAgent ranking rewards performance.
- **Honest agents:** Honest agents can get higher rank in the list and their ads will be seen more often.

- **Revenue:** The revenue can come form upgrading using experience of the users. Also fewer views contribute to higher trade rate.

## 5. Metrics
| Metric (my definition) | Moves? | How | Roughly how much |
|---|---|---|---|
| Qualified leads: contacts that lead to a viewing | <!-- --> | Bait removed, questions answered before the call | <!-- --> |
| Wasted contacts: calls to ads that are gone or bait | <!-- --> | P5, B1–B3; copies merged | <!-- --> |
| Time to first confirmed viewing | <!-- --> | Scout asks many agents at once | <!-- --> |
| Raw leads per ad | <!-- --> | Copies merged into one card | <!-- --> |

## 6. One number that proves it works
- **The number:** if agent confirmed viewings per searcher within 14 days of starting a search.
- **1% test:** if 1% of searchers in high duplicate towers (for example the 50 Dubai towers with the most ads per real flat). Half see the Scout card, half see today's search. Run for 4 weeks.
- **Guardrail:** leads to honest ads (verified, permit shown, priced within ±15%) must not fall.
- **Proves me wrong:** if confirmed viewings per searcher rise by less than 10% or honest ads lose more than 5% of their leads.

## 7. What I could not build
The rest of functions require more time and permissions that are not possible at current stage.
| # | Feature | Why it is needed | Why I could not add it |
|---|---|---|---|
| <!-- --> | Real messaging channel to agents | Scout must really ask and receive answers; replies are simulated now | Internal PF connection (lead / agent inbox API) |
| <!-- --> | Live photo semantics (vision model on every photo for instance room tags, balcony count, same room matching) | Finds re-watermarked copies (Unit A, Unit B) and photo–field contradictions at scale; done by hand for 38 ads now | Engineering + model pipeline |
| <!-- --> | DLD permit validation (open the Trakheesi QR) | Confirms the ad is legal and which property it covers | Government data connection |
| <!-- --> | Live data for every tower | Medians and copy groups for any search; now one snapshot of one tower | Internal listing API |
| <!-- --> | DLD / Ejari transaction prices | Tells a cheap ad from a cheap flat; medians now use asking prices | Data access |
| <!-- --> | Account sync and push between web and app | Continuity web → app | Internal accounts and notifications; browser storage now |