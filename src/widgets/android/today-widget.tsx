'use no memo';
// React Compiler must not touch this file: Android widgets are plain functions
// that return widget primitives, with no hooks.

import { FlexWidget, ImageWidget, TextWidget, type HexColor } from 'react-native-android-widget';

import type { WidgetData, WidgetHabit } from '../widget-data';

const DRAGON = require('@/assets/images/dragon/anim/idle.png');

export const TICK_ACTION = 'TICK_HABIT';

type Colors = { bg: [HexColor, HexColor]; text: HexColor; sub: HexColor; track: HexColor; card: HexColor };

const LIGHT: Colors = {
  bg: ['#DCEFFF', '#E7F3D3'],
  text: '#2A2140',
  sub: '#5B5373',
  track: '#E4DDFA',
  card: '#FFFFFFB3',
};
const DARK: Colors = {
  bg: ['#2B2550', '#1F2A3A'],
  text: '#F3EFFA',
  sub: '#C9C0E2',
  track: '#3A3060',
  card: '#FFFFFF1F',
};
const ACCENT: HexColor = '#6C4FE0';
const GOLD: HexColor = '#F2C14E';

type Props = { data: WidgetData | null; width: number; height: number; dark: boolean };

/**
 * "Today with your dragon" for Android. Its size decides the layout: a small
 * square shows the dragon and its energy; wider adds today's habits with a ✓.
 */
export function TodayWidget({ data, width, height, dark }: Props) {
  const c = dark ? DARK : LIGHT;
  const root = {
    height: 'match_parent' as const,
    width: 'match_parent' as const,
    backgroundGradient: { from: c.bg[0], to: c.bg[1], orientation: 'TOP_BOTTOM' as const },
    borderRadius: 22,
    padding: 12,
  };

  if (!data) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{ ...root, justifyContent: 'center', alignItems: 'center' }}>
        <ImageWidget image={DRAGON} imageWidth={64} imageHeight={79} />
        <TextWidget text="Open Inhabit to meet your dragon" style={{ fontSize: 13, color: c.text }} />
      </FlexWidget>
    );
  }

  const left = data.habits.filter((h) => !h.done).length;
  const full = data.energy >= data.fullBar;
  const status = data.awayNote
    ? `${data.petName} is exploring`
    : full
      ? `${data.petName} is full of energy!`
      : left === 0
        ? 'All done for today'
        : `${left} ${left === 1 ? 'habit' : 'habits'} left`;

  const small = width < 220;
  const large = height >= 260;
  const dragonSize = small ? Math.min(78, height * 0.5) : large ? 96 : Math.min(96, height * 0.62);
  const shown = large ? data.habits.slice(0, 6) : data.habits.filter((h) => !h.done).slice(0, 3);

  const energyBar = (barWidth: number) => (
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6 }}>
      <TextWidget text="⚡" style={{ fontSize: 11 }} />
      <FlexWidget style={{ width: barWidth, height: 8, backgroundColor: c.track, borderRadius: 4 }}>
        <FlexWidget
          style={{
            width: Math.max(8, (barWidth * Math.min(data.energy, data.fullBar)) / data.fullBar),
            height: 8,
            backgroundColor: GOLD,
            borderRadius: 4,
          }}
        />
      </FlexWidget>
      <TextWidget
        text={full ? 'Full' : `${data.energy}/${data.fullBar}`}
        style={{ fontSize: 11, fontWeight: 'bold', color: c.text }}
      />
    </FlexWidget>
  );

  const dragon = (
    <ImageWidget
      image={DRAGON}
      imageWidth={Math.round(dragonSize * 0.81)}
      imageHeight={Math.round(dragonSize)}
      clickAction="OPEN_APP"
    />
  );

  const habitRow = (h: WidgetHabit) => (
    <FlexWidget
      key={h.id}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: 'match_parent',
        backgroundColor: c.card,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 5,
        flexGap: 8,
      }}>
      <TextWidget text={h.emoji} style={{ fontSize: 14 }} />
      <FlexWidget style={{ flex: 1 }}>
        <TextWidget
          text={h.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 13, color: h.done ? c.sub : c.text, fontWeight: '600' }}
        />
      </FlexWidget>
      {h.done ? (
        <TextWidget text="✓" style={{ fontSize: 14, fontWeight: 'bold', color: ACCENT }} />
      ) : (
        <FlexWidget
          clickAction={TICK_ACTION}
          clickActionData={{ id: h.id }}
          accessibilityLabel={`Mark ${h.title} done`}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: ACCENT,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TextWidget text="✓" style={{ fontSize: 13, fontWeight: 'bold', color: ACCENT }} />
        </FlexWidget>
      )}
    </FlexWidget>
  );

  if (small) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{ ...root, justifyContent: 'center', alignItems: 'center', flexGap: 4 }}>
        {dragon}
        <TextWidget text={status} maxLines={1} style={{ fontSize: 12, fontWeight: 'bold', color: c.text }} />
        {energyBar(70)}
      </FlexWidget>
    );
  }

  const list =
    shown.length > 0 ? (
      shown.map(habitRow)
    ) : (
      <TextWidget
        text={data.awayNote || `${data.petName} is proud of you.`}
        style={{ fontSize: 12, color: c.sub }}
      />
    );

  if (!large) {
    return (
      <FlexWidget style={{ ...root, flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
        <FlexWidget style={{ alignItems: 'center', flexGap: 4 }}>
          {dragon}
          {energyBar(56)}
        </FlexWidget>
        <FlexWidget style={{ flex: 1, flexGap: 5 }}>
          <TextWidget text={status} style={{ fontSize: 13, fontWeight: 'bold', color: c.text }} />
          {list}
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget style={{ ...root, flexGap: 8 }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 12 }}>
        {dragon}
        <FlexWidget style={{ flexGap: 4 }}>
          <TextWidget text={data.petName} style={{ fontSize: 17, fontWeight: 'bold', color: c.text }} />
          <TextWidget text={data.awayNote || status} style={{ fontSize: 13, color: c.sub }} />
          {energyBar(120)}
        </FlexWidget>
      </FlexWidget>
      <TextWidget text="TODAY" style={{ fontSize: 12, fontWeight: 'bold', color: c.sub }} />
      {list}
    </FlexWidget>
  );
}
