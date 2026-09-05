ANTIGRAVITY — PORT: homepage rail + section rhythm

Two reference files ship with this instruction:

  tracenews-category-rail.reference.html
  tracenews-homepage-rhythm.reference.html

CONFIRM FIRST: reply with both filenames and one line each on what they contain. If
either is missing or unreadable, say so and stop. Do not proceed from memory.

RULES
- Read each reference file AS TEXT. Compare structurally against your components.
- Report the difference list BEFORE writing code.
- Do not redesign, simplify, or drop elements you judge unnecessary. If it is in the
  reference, it ships.
- Story cards and featured images are UNCHANGED. Nothing about them is in scope.
- Commit, push, and confirm the Vercel and Railway builds SUCCEEDED before reporting
  done. "Builds locally" is not deployed.

================================================================================
0. WHAT IS NOT CHANGING — read this first
================================================================================

THE DAILY BRIEFING SECTION AT THE TOP OF THE HOMEPAGE STAYS EXACTLY AS IT IS.
Its layout, its cards, its "Top News Stories" list, its images — untouched. It is not
one of the three treatments below and it does not get a rail. It remains the first
thing on the page, in its current form.

Also unchanged: the masthead, the trending chips row, the story cards themselves, the
featured-image treatment, the footer.

The only things in scope are: section HEADINGS, section LAYOUT (which of three
treatments each section uses), and the RAIL.

================================================================================
1. BACKEND — the rail needs its own data
================================================================================

The landing and feed endpoints return roughly 80 clusters. The rail currently filters
that same slice, which is why it duplicates stories already in the left column —
after excluding those, there is often nothing left to show.

Add an endpoint that serves the rail directly:

  GET /clusters/most-carried?category={category}&limit=6

Returns, for that category, the clusters with the highest SCORED outlet count across
the whole category — not just what the feed happens to include. Include for each:
id, slug, representative_title, scored outlet count, the tier distribution as counts,
and published/created timestamp.

Return 6 so the frontend can drop any already rendered in the left column and still
have two left.

Rank on SCORED outlets. Floor: 8 or more. (1,392 clusters in the last 30 days meet
this — about 46 a day — so every rail fills.)

================================================================================
2. THE RAIL — port tracenews-category-rail.reference.html
================================================================================

Replace the current CoverageBreadthCard rail with the reference exactly.

What makes it a panel rather than a third column of stories — all three are required:

  a) A MASTHEAD. Mono label "MOST WIDELY CARRIED" at 9.5px, letter-spacing 1.6px,
     uppercase, with the category name right-aligned in mono at 9px. A 1px rule
     beneath at 55% opacity of --ink. Then the italic sub-line.

  b) NO HERO IMAGE on the cards. This is what made the current version read as more
     stories. The cards are typographic.

  c) THE COUNT LEADS. The outlet number in IBM Plex Mono at 30px, line-height .85,
     letter-spacing -1.6px, tabular numerals, with "OUTLETS" beside it in 9.5px mono
     caps. This sits ABOVE the headline and is the largest element on the card after
     it. It is currently rendering as small grey text — that is the main defect.

Card order: count → headline (Spectral 15px) → tier bar → tier counts → footer.

SELECTION, enforced in code:
  - Rank across the whole category via the new endpoint.
  - EXCLUDE any cluster already rendered in that section's left column.
  - Take the top 2 after exclusion.
  - Fewer than 2 qualify → render 1. None → render NO rail; the section spans full
    width. No placeholder, no fallback card, no signup form.

LANGUAGE:
  - No verdict language. No CLEAR, no MIXED, no badge asserting anything.
  - Counts, never percentages.
  - A zero tier reads "none recorded" with the hatched ghost segment, never "0".

================================================================================
3. SECTION HEADINGS — port from tracenews-homepage-rhythm.reference.html
================================================================================

Every category section heading becomes broadsheet. This single change is what makes
the page speak the same language as the rail and the rest of the product.

  - Title: Spectral, 22px, weight 600, colour --ink, letter-spacing -.3px
  - Right side: "Follow" and "Read more" in mono, 9.5px, letter-spacing 1.2px,
    uppercase, colour --t-faint, hover --v-clear
  - Beneath: a 2px rule in --ink at 80% opacity, then 2px gap, then a 1px --border
    rule, then 20px before content

Applies to every category section. NOT to the Daily Briefing block, which is
unchanged.

================================================================================
4. THREE SECTION TREATMENTS — replacing the single repeated one
================================================================================

The homepage currently runs one layout ten times. A reader learns the pattern in two
sections and stops looking. Three treatments, assigned by position:

LEAD — maximum 2 per page, highest up (Politics, Security)
  Current treatment, unchanged: hero image with gradient caption, three story rows
  beneath, rail on the right. Grid 1fr / 320px, gap 34px.

STANDARD — most sections
  NO hero image. Five story rows in a ruled list with 76x54 thumbs. Rail on the
  right. Same grid as LEAD.

COMPACT — 2-3 smaller sections, lower down (Technology, Religion, Niger Delta)
  Two columns, full width, NO rail, NO images.
  Each row: outlet count (mono 11px, right-aligned, 26px column) → micro tier bar
  (40px wide, 4px tall, same steel/taupe/sage, hatched ghost for none recorded) →
  headline (13px) → age (mono 9px).
  No percentages and no dominant-tier label. Counts-not-percentages is a standing
  rule; at these numbers a percentage misleads — 3 of 5 outlets renders as 60%,
  which sounds like a measurement when it is three articles.

PAGE ORDER
  Daily Briefing (UNCHANGED)
    -> LEAD
    -> STANDARD x3
    -> LEAD
    -> STANDARD x3
    -> COMPACT x2
    -> Watchdog Report signup, ONCE, at the foot

Assign treatments by category volume. From the database, last 30 days, clusters with
3+ outlets: Politics 1752, Security 851, Economy 761, Sports 649, Entertainment 492,
Health 397, Education 284, International 254, Judiciary 186, General 161, Religion
143, Technology 120, Niger Delta 26.

Politics and Security take LEAD. Technology, Religion and Niger Delta take COMPACT.
The rest take STANDARD.

================================================================================
REPORT BACK
================================================================================
  - Confirmation you have both reference files
  - The structural difference list, BEFORE any code
  - Deployed commits both repos, and confirmation both builds succeeded
  - How many rails render 2 cards, 1 card, or none, on live data after the exclusion
    rule is applied
