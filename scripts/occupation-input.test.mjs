import { test } from 'node:test';
import assert from 'node:assert/strict';
import { occupationsFromLines } from '../lib/occupation-input.ts';
const existing = [{ scheme: 'ESCO', schemeVersion: '1.2.1', code: 'example-id', label: 'Software engineer, embedded systems' }];
test('unchanged labels preserve their identity and commas', () => {
  assert.deepEqual(occupationsFromLines(existing[0].label, existing), existing);
});
test('new titles remain free text while existing mapped titles are kept', () => {
  assert.deepEqual(occupationsFromLines(`${existing[0].label}\nDéveloppeur C++`, existing), [...existing, { scheme: 'free_text', label: 'Développeur C++' }]);
});
test('edited titles do not retain an unreviewed old identity', () => {
  assert.deepEqual(occupationsFromLines('Electrical engineer', existing), [{ scheme: 'free_text', label: 'Electrical engineer' }]);
});
test('a profile edit does not arbitrarily choose between legacy mappings', () => {
  const conflict = [...existing, { ...existing[0], code: 'other-id' }];
  assert.deepEqual(occupationsFromLines(existing[0].label, conflict), conflict);
});
