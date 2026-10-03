/**
 * TII SCORE VISIBILITY — HIDDEN ON PURPOSE (3 Oct 2026). DO NOT FORGET TO
 * TURN BACK ON when every condition below holds; tracked in the GitHub issue
 * "Unhide TII scores on outlet profiles".
 *
 * Why hidden: counsel's scoping note of 3 Oct 2026 (§4) did not clear the
 * score as displayed. The scores on show were computed by hand around June
 * 2026 with a method since corrected (sample window, cap, minimum, failed
 * judgements counted against the outlet).
 *
 * Turn back on only when:
 *   1. The record hold is narrowed so the scorer may run (RECORD_HOLD in
 *      tracenews-api/app/clusterer.py).
 *   2. The score-history migration is applied and every outlet is rescored
 *      with the corrected scorer.
 *   3. A blind human labelling of about fifty stories against the model's
 *      S2 judgement is done (counsel's recommendation).
 *   4. Counsel has cleared the outlet profile page and the S2 wording.
 *   5. "Last scored" on the profile reads the real date from the data.
 * Then set this to true, and update the outlet profile entry in
 * src/claims/register.json with the clearance reference.
 */
export const TII_SCORES_VISIBLE = false;
