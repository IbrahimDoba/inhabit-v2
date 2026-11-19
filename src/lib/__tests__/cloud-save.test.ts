import {
  decide,
  fingerprint,
  hasDragon,
  isCloudDocument,
  NO_META,
  snapshot,
  summarise,
  type CloudDocument,
} from '../cloud-save';

function doc(name: string, complete = true, diamonds = 0): CloudDocument {
  return {
    schema: 1,
    slots: {
      'inhabit.onboarding': { version: 1, data: { dragonName: name, isComplete: complete } },
      'inhabit.companion': { version: 1, data: { stage: 'young', hatchedOn: '2026-11-01', diamonds } },
      'inhabit.habits': { version: 1, data: [{ id: 'a' }, { id: 'b' }] },
    },
  };
}
const empty: CloudDocument = { schema: 1, slots: {} };
const synced = (d: CloudDocument, version: number) => ({ version, fingerprint: fingerprint(d), syncedAt: 1 });

describe('snapshot', () => {
  it('copies readable slots and skips broken or missing ones', () => {
    const stored: Record<string, string> = {
      'inhabit.onboarding': JSON.stringify({ version: 1, data: { isComplete: true } }),
      'inhabit.habits': '{not json',
      'inhabit.devPlus': 'true',
    };
    const made = snapshot((key) => stored[key] ?? null);
    expect(Object.keys(made.slots)).toEqual(['inhabit.onboarding']);
    expect(hasDragon(made)).toBe(true);
  });
});

describe('fingerprint', () => {
  it('is the same for the same content and different after a change', () => {
    expect(fingerprint(doc('Clover'))).toBe(fingerprint(doc('Clover')));
    expect(fingerprint(doc('Clover'))).not.toBe(fingerprint(doc('Clover', true, 10)));
  });
});

describe('isCloudDocument', () => {
  it('accepts a snapshot and refuses anything else', () => {
    expect(isCloudDocument(doc('Clover'))).toBe(true);
    expect(isCloudDocument(null)).toBe(false);
    expect(isCloudDocument({ schema: 2, slots: {} })).toBe(false);
    expect(isCloudDocument({ schema: 1, slots: [] })).toBe(false);
  });
});

describe('summarise', () => {
  it('describes a save in a few words', () => {
    expect(summarise(doc('Clover'))).toEqual({
      dragonName: 'Clover',
      stage: 'young',
      hatchedOn: '2026-11-01',
      habits: 2,
    });
  });
});

describe('decide', () => {
  const cloudOf = (data: CloudDocument | null, version: number) => ({ data, version });

  it('sends the first save when the cloud is empty', () => {
    expect(decide({ local: doc('Clover'), meta: NO_META, cloud: cloudOf(null, 0) })).toBe('push');
  });

  it('sends nothing before there is a dragon', () => {
    expect(decide({ local: empty, meta: NO_META, cloud: cloudOf(null, 0) })).toBe('none');
  });

  it('does nothing when neither side changed', () => {
    const d = doc('Clover');
    expect(decide({ local: d, meta: synced(d, 3), cloud: cloudOf(d, 3) })).toBe('none');
  });

  it('sends the phone when only the phone changed', () => {
    const before = doc('Clover');
    expect(
      decide({ local: doc('Clover', true, 10), meta: synced(before, 3), cloud: cloudOf(before, 3) }),
    ).toBe('push');
  });

  it('takes the cloud on a new phone with no dragon', () => {
    expect(decide({ local: empty, meta: NO_META, cloud: cloudOf(doc('Clover'), 5) })).toBe('pull');
    expect(decide({ local: doc('Egg', false), meta: NO_META, cloud: cloudOf(doc('Clover'), 5) })).toBe('pull');
  });

  it('takes the cloud when another phone saved and this one did not change', () => {
    const d = doc('Clover');
    expect(decide({ local: d, meta: synced(d, 3), cloud: cloudOf(doc('Clover', true, 50), 4) })).toBe('pull');
  });

  it('asks when both changed', () => {
    const before = doc('Clover');
    expect(
      decide({
        local: doc('Clover', true, 10),
        meta: synced(before, 3),
        cloud: cloudOf(doc('Clover', true, 50), 4),
      }),
    ).toBe('ask');
  });

  it('asks when signing in to an account that already has a different garden', () => {
    expect(decide({ local: doc('Juniper'), meta: NO_META, cloud: cloudOf(doc('Clover'), 5) })).toBe('ask');
  });

  it('adopts the version when both hold the same garden', () => {
    expect(decide({ local: doc('Clover'), meta: NO_META, cloud: cloudOf(doc('Clover'), 5) })).toBe('adopt');
  });

  it('never sends an empty phone over a cloud it has synced with', () => {
    const d = doc('Clover');
    expect(decide({ local: empty, meta: synced(d, 3), cloud: cloudOf(d, 3) })).toBe('none');
  });
});
