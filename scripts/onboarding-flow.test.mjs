import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SIGNUP_STEPS,
  OPTIONAL_STEPS,
  signupPosition,
  progressLabel,
  nextSignupStep,
  isLastSignupStep,
  editRoute,
  firstMissingStep,
} from "../lib/onboardingFlow.ts";
import { PROFILE_COMPLETION_FIELDS } from "../lib/profileCompletion.ts";

test("SIGNUP_STEPS and OPTIONAL_STEPS cover 1 to 13 once each", () => {
  assert.deepEqual([...SIGNUP_STEPS], [2, 3, 4, 6, 8, 9, 10]);
  assert.deepEqual([...OPTIONAL_STEPS], [1, 5, 7, 11, 12, 13]);
  const all = [...SIGNUP_STEPS, ...OPTIONAL_STEPS].sort((a, b) => a - b);
  assert.deepEqual(all, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
});

test("progressLabel and signupPosition for signup vs optional", () => {
  assert.equal(progressLabel(2), "1 of 7");
  assert.equal(progressLabel(6), "4 of 7");
  assert.equal(progressLabel(10), "7 of 7");
  for (const step of OPTIONAL_STEPS) {
    assert.equal(signupPosition(step), null);
    assert.equal(progressLabel(step), null);
  }
});

test("walking nextSignupStep from 2 reaches Home after 10", () => {
  const visited = [];
  let step = 2;
  while (step != null) {
    visited.push(step);
    step = nextSignupStep(step);
  }
  assert.deepEqual(visited, [2, 3, 4, 6, 8, 9, 10]);
  for (const optional of OPTIONAL_STEPS) {
    assert.equal(visited.includes(optional), false);
  }
  assert.equal(nextSignupStep(10), null);
  assert.equal(isLastSignupStep(10), true);
  assert.equal(isLastSignupStep(9), false);
});

test("editRoute carries mode edit and from", () => {
  assert.deepEqual(editRoute(7, "home"), {
    pathname: "/onboarding/[step]",
    params: { step: "7", mode: "edit", from: "home" },
  });
  assert.deepEqual(editRoute(11, "profile"), {
    pathname: "/onboarding/[step]",
    params: { step: "11", mode: "edit", from: "profile" },
  });
});

test("firstMissingStep follows 19-field order and skips Email", () => {
  assert.equal(firstMissingStep(["Skills", "CV"]), 7);
  assert.equal(firstMissingStep(["CV"]), 11);
  assert.equal(firstMissingStep([]), null);
  assert.equal(firstMissingStep(["Email"]), null);
});

test("profileCompletion keeps exactly 19 fields in website order", () => {
  const labels = PROFILE_COMPLETION_FIELDS.map((f) => f.label);
  assert.equal(PROFILE_COMPLETION_FIELDS.length, 19);
  assert.deepEqual(labels, [
    "First name",
    "Last name",
    "Email",
    "Current location",
    "Nationality or citizenship",
    "Current or most recent role",
    "Years of experience",
    "Skills",
    "Primary industry",
    "Job preferences",
    "CV",
    "Sponsorship status",
    "Notice period",
    "Job-search intent",
    "Relocation readiness",
    "Target country or countries",
    "Career summary",
    "Work experience",
    "Education or qualifications",
  ]);
  for (const field of PROFILE_COMPLETION_FIELDS) {
    if (field.key === "email") {
      assert.equal(field.onboardingStep, null);
      continue;
    }
    assert.ok(
      field.onboardingStep >= 1 && field.onboardingStep <= 13,
      `${field.label} step out of range`,
    );
  }
});
