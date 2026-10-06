import { fullBar, type CompanionState } from '@/engine/companion';
import { ENERGY_PER_HABIT, STAGE_RULES } from '@/engine/rules';
import { groupForDay, type Habit } from '@/lib/habits';

/** One habit as a widget shows it. */
export type WidgetHabit = { id: string; title: string; emoji: string; done: boolean };

/** What the app knows that the widget should show. Same for iOS and Android. */
export type WidgetData = {
  petName: string;
  energy: number;
  fullBar: number;
  energyPerHabit: number;
  habits: WidgetHabit[];
  awayNote: string;
  /** Tomorrow's due habits, shown from midnight until the app is opened again. */
  tomorrowHabits: WidgetHabit[];
  tomorrowFullBar: number;
};

function hoursAndMinutes(ms: number) {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

/** Today (and tomorrow) for the widget, from the dragon and the habit list. */
export function buildWidgetData(
  companion: CompanionState,
  habits: readonly Habit[],
  petName: string,
  now: number,
): WidgetData {
  const today = new Date(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const asWidget = (date: Date, doneIds: readonly string[]) =>
    groupForDay(habits, date)
      .flatMap((g) => g.habits)
      .map((h) => ({ id: h.id, title: h.title, emoji: h.emoji, done: doneIds.includes(h.id) }));

  return {
    petName,
    energy: companion.energy,
    fullBar: fullBar(companion),
    energyPerHabit: ENERGY_PER_HABIT,
    habits: asWidget(today, companion.habitsDoneToday),
    awayNote: companion.journey
      ? `Exploring, back in ${hoursAndMinutes(companion.journey.returnsAt - now)}`
      : '',
    tomorrowHabits: asWidget(tomorrow, []),
    tomorrowFullBar: STAGE_RULES[companion.stage].fullBar,
  };
}

/**
 * Applies ticks made in the widget (before the app has seen them): those habits
 * show as done and add their energy, up to a full bar.
 */
export function withWidgetTicks(data: WidgetData, ticks: readonly string[]): WidgetData {
  let energy = data.energy;
  const habits = data.habits.map((h) => {
    if (h.done || !ticks.includes(h.id)) return h;
    energy = Math.min(data.fullBar, energy + data.energyPerHabit);
    return { ...h, done: true };
  });
  return { ...data, habits, energy };
}
