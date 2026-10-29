import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shouldShowNudge,
  nudgeText,
  NUDGE_COOLDOWN_MS,
} from "../lib/profileNudge.ts";

const hour = 60 * 60 * 1000;
const base = {
  signedIn: true,
  percent: 60,
  shownThisSession: false,
  notNowAt: null,
  now: 1_000_000_000_000,
};

test("shows at 60% when signed in, not shown this session, no Not now", () => {
  assert.equal(shouldShowNudge(base), true);
});

test("hidden when shownThisSession is true", () => {
  assert.equal(shouldShowNudge({ ...base, shownThisSession: true }), false);
});

test("hidden until 72 hours after Not now", () => {
  const notNowAt = base.now - hour;
  assert.equal(shouldShowNudge({ ...base, notNowAt }), false);
  assert.equal(
    shouldShowNudge({
      ...base,
      notNowAt: base.now - (NUDGE_COOLDOWN_MS - 60_000),
    }),
    false,
  );
  assert.equal(
    shouldShowNudge({
      ...base,
      notNowAt: base.now - (NUDGE_COOLDOWN_MS + 60_000),
    }),
    true,
  );
});

test("hidden at 100% and when signed out", () => {
  assert.equal(shouldShowNudge({ ...base, percent: 100 }), false);
  assert.equal(
    shouldShowNudge({ ...base, percent: 100, shownThisSession: false }),
    false,
  );
  assert.equal(shouldShowNudge({ ...base, signedIn: false }), false);
});

test("nudgeText(60) is exact copy", () => {
  assert.equal(nudgeText(60), "Your profile is 60% done.");
});
