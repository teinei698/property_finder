# AI-LOG

At least hree times an AI tool gave a confident wrong answer about UAE real estat.

### 1. "The permit is issued per ad, not per flat"
- **AI said:** the DLD permit is per ad, not per property; the same flat posted twice had two different permits.
- **Wrong because:** DLD's brokerage guide only says that every advert needs a Trakheesi permit. Secondary sources describe a permit as issued to a broker for one property and one advert, through the owner's Form A. 
- **Caught by:** I asked another AI model to verify and checked the internet when i suspect about it.

### 2. "Identical photos = the same flat"
- **AI said:** 20 listings that share photos are confirmed duplicates.
- **Wrong because:** this tower has many identical floor plans. An agency can reuse one unit's photos for a twin unit on another floor because they look totally the same, and a landlord can furnish twin flats identically.
- **Caught by:** Logically i think this worked for a skyscraper but it has not been directly considered by AI.

### 3. "Rent ad + sale ad of one flat = duplicate"
- **AI said:** #9/#10, #11/#12 and #13/#14 were suspected duplicates.
- **Wrong because:** in Dubai an owner often lists the same flat for rent and for sale at once, through one agent. #9/#10 show a sale price of AED 1.2M and a rent of AED 75k.
- **Caught by:** I compared the two ads myself manually and realized it is incorrect to use as a metric to detect scamming.

### 4. "The agent confirmed it" (when the question was not answered)
- **AI said:** to "What explains the price above similar flats?" (#14), the simulated agent replied "still available, happy to arrange a viewing", and Scout summarised it as confirmed.
- **Wrong because:** the reply did not answer the question, and Scout never checked whether it had.
- **Caught by:** I check on my own and find it.
  
### 5. "#38 is a fake placeholder listing"
- **AI said:** #38 was likely a placeholder, because its text describes the whole tower ("depending on the unit").
- **Wrong because:** its photos show a real, empty flat. The text is generic, but the flat exists.
- **Caught by:** I manually go through the website and check it.
 