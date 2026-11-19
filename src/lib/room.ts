/**
 * What stands in the dragon's den. Starter pieces belong to everyone; the rest
 * are bought in the shop. Placing and putting away is free and never loses anything.
 */

export type RoomSlot = 'bed' | 'rug' | 'lamp' | 'shelf' | 'chest' | 'pot' | 'picture' | 'clock' | 'cushion';

export type RoomItemId =
  | 'bed'
  | 'bed-cloud'
  | 'rug'
  | 'rug-star'
  | 'lamp'
  | 'lamp-mushroom'
  | 'bookshelf'
  | 'toy-chest'
  | 'plant-pot'
  | 'wall-picture'
  | 'clock'
  | 'cushion';

export type RoomItemInfo = {
  id: RoomItemId;
  /** Only one piece per slot stands in the room at a time. */
  slot: RoomSlot;
  name: string;
  detail: string;
  /** Diamonds in the shop; 0 for the starter pieces. */
  price: number;
};

export const ROOM_ITEMS: readonly RoomItemInfo[] = [
  { id: 'bed', slot: 'bed', name: 'Cozy bed', detail: 'A soft place to curl up after a full day.', price: 0 },
  { id: 'rug', slot: 'rug', name: 'Round rug', detail: 'A little mint and lavender underfoot.', price: 0 },
  { id: 'lamp', slot: 'lamp', name: 'Bedside lamp', detail: 'A warm glow when the moon comes out.', price: 0 },
  { id: 'cushion', slot: 'cushion', name: 'Floor cushion', detail: 'For flopping down mid-afternoon.', price: 40 },
  { id: 'plant-pot', slot: 'pot', name: 'Potted plant', detail: 'A bit of the garden, indoors.', price: 50 },
  { id: 'wall-picture', slot: 'picture', name: 'Framed picture', detail: 'A favourite view from a journey.', price: 60 },
  { id: 'clock', slot: 'clock', name: 'Wall clock', detail: 'It ticks very quietly.', price: 70 },
  { id: 'rug-star', slot: 'rug', name: 'Star rug', detail: 'A patch of night sky for the floor.', price: 90 },
  { id: 'toy-chest', slot: 'chest', name: 'Toy chest', detail: 'Full of treasures from the road.', price: 110 },
  { id: 'lamp-mushroom', slot: 'lamp', name: 'Mushroom lamp', detail: 'Glows softly once it gets dark.', price: 120 },
  { id: 'bookshelf', slot: 'shelf', name: 'Bookshelf', detail: 'Stories for rainy days.', price: 150 },
  { id: 'bed-cloud', slot: 'bed', name: 'Cloud bed', detail: 'Like sleeping on a summer sky.', price: 200 },
];

const BY_ID = new Map(ROOM_ITEMS.map((item) => [item.id, item]));

export function roomItem(id: RoomItemId): RoomItemInfo {
  return BY_ID.get(id)!;
}

/** The pieces standing in the room right now. */
export type RoomLayout = RoomItemId[];

export const STARTER_ROOM: RoomLayout = ['bed', 'rug', 'lamp'];

export function ownsRoomItem(id: RoomItemId, ownedItems: readonly string[] | undefined) {
  return roomItem(id).price === 0 || (ownedItems ?? []).includes(id);
}

/**
 * Reads a saved room. The first version saved three on/off switches; those and
 * anything partial or corrupt fall back to the starter pieces rather than an empty room.
 */
export function roomLayout(value: unknown): RoomLayout {
  const saved = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  if (Array.isArray(saved.placed)) {
    const seen = new Set<RoomSlot>();
    const layout: RoomLayout = [];
    for (const id of saved.placed) {
      const info = typeof id === 'string' ? BY_ID.get(id as RoomItemId) : undefined;
      if (!info || seen.has(info.slot)) continue;
      seen.add(info.slot);
      layout.push(info.id);
    }
    return layout;
  }
  return STARTER_ROOM.filter((id) => saved[id] !== false);
}

/** Places a piece, swapping out whatever shared its slot, or puts it away if it is out. */
export function togglePlaced(layout: RoomLayout, id: RoomItemId): RoomLayout {
  if (layout.includes(id)) return layout.filter((placed) => placed !== id);
  const { slot } = roomItem(id);
  return [...layout.filter((placed) => roomItem(placed).slot !== slot), id];
}

/** The piece standing in a slot, if any. */
export function placedIn(layout: RoomLayout, slot: RoomSlot): RoomItemId | null {
  return layout.find((id) => roomItem(id).slot === slot) ?? null;
}
