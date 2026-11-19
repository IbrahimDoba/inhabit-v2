import { ownsRoomItem, placedIn, roomLayout, togglePlaced } from '../room';

describe('saved room', () => {
  it('keeps a stored layout across a reload', () => {
    const saved = JSON.parse(JSON.stringify({ placed: ['rug-star', 'bookshelf'] }));
    expect(roomLayout(saved)).toEqual(['rug-star', 'bookshelf']);
  });
  it('reads the first version, which stored three switches', () => {
    expect(roomLayout({ bed: false, rug: true, lamp: false })).toEqual(['rug']);
    expect(roomLayout({ bed: false })).toEqual(['rug', 'lamp']);
  });
  it('recovers from corrupt saves instead of hiding furniture', () => {
    for (const value of [null, 'broken', 8, { bed: 'false', lamp: null, rug: [] }]) {
      expect(roomLayout(value)).toEqual(['bed', 'rug', 'lamp']);
    }
  });
  it('drops unknown pieces and a second piece in the same slot', () => {
    expect(roomLayout({ placed: ['bed', 'bed-cloud', 'throne', 4] })).toEqual(['bed']);
  });
});

describe('placing furniture', () => {
  it('swaps a piece for another in the same slot', () => {
    const layout = togglePlaced(['bed', 'rug', 'lamp'], 'bed-cloud');
    expect(layout).toEqual(['rug', 'lamp', 'bed-cloud']);
    expect(placedIn(layout, 'bed')).toBe('bed-cloud');
  });
  it('puts a placed piece away, and leaves the slot empty', () => {
    const layout = togglePlaced(['bed', 'rug'], 'rug');
    expect(layout).toEqual(['bed']);
    expect(placedIn(layout, 'rug')).toBeNull();
  });
  it('gives everyone the starter pieces and nothing else for free', () => {
    expect(ownsRoomItem('bed', undefined)).toBe(true);
    expect(ownsRoomItem('bookshelf', [])).toBe(false);
    expect(ownsRoomItem('bookshelf', ['bookshelf'])).toBe(true);
  });
});
