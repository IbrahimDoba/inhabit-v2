/**
 * The "Today with your dragon" home screen widget (iOS).
 *
 * Runs in its own runtime inside the widget extension: only @expo/ui SwiftUI
 * components, no hooks, no imports at runtime, and nothing from outside this
 * function. Everything it shows arrives as props from `syncTodayWidget`.
 * Tapping ✓ ticks a habit right in the widget; the app picks those ticks up
 * the next time it opens (see `src/widgets/sync.ts`).
 */

import {
  Button,
  Gauge,
  HStack,
  Image,
  Rectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  clipShape,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  resizable,
  strikethrough,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetHabit } from './widget-data';

export type TodayWidgetProps = {
  petName: string;
  energy: number;
  fullBar: number;
  energyPerHabit: number;
  habits: WidgetHabit[];
  /** e.g. "back in 3h 20m" while exploring, else empty. */
  awayNote: string;
  /** Shared-container file URL of the dragon picture. */
  dragonUri: string;
  /** Habit ids ticked inside the widget, waiting for the app to pick up. */
  widgetTicks: string[];
};

const TodayWidget = (props: TodayWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const INK = '#2A2140';
  const MUTED = '#5B5373';
  const ACCENT = '#6C4FE0';
  const GOLD = '#F2C14E';
  const dark = environment.colorScheme === 'dark';
  const text = dark ? '#F3EFFA' : INK;
  const sub = dark ? '#C9C0E2' : MUTED;
  const family = environment.widgetFamily;

  const left = props.habits.filter((h) => !h.done).length;
  const full = props.energy >= props.fullBar;
  const status = props.awayNote
    ? `${props.petName} is exploring`
    : full
      ? `${props.petName} is full of energy!`
      : left === 0
        ? 'All done for today'
        : `${left} ${left === 1 ? 'habit' : 'habits'} left`;

  // Ticking in the widget updates the widget at once; the app syncs later.
  const tick = (id: string): TodayWidgetProps => {
    const habits = props.habits.map((h) => (h.id === id ? { ...h, done: true } : h));
    return {
      ...props,
      habits,
      energy: Math.min(props.fullBar, props.energy + props.energyPerHabit),
      widgetTicks: props.widgetTicks.includes(id) ? props.widgetTicks : [...props.widgetTicks, id],
    };
  };

  const energyBar = (width: number) => (
    <HStack spacing={6}>
      <Text modifiers={[font({ size: 11 })]}>⚡</Text>
      <ZStack alignment="leading" modifiers={[frame({ width, height: 8 })]}>
        <Rectangle
          modifiers={[foregroundStyle(dark ? '#3A3060' : '#E4DDFA'), frame({ width, height: 8 }), clipShape('capsule')]}
        />
        <Rectangle
          modifiers={[
            foregroundStyle(GOLD),
            frame({ width: Math.max(8, (width * Math.min(props.energy, props.fullBar)) / props.fullBar), height: 8 }),
            clipShape('capsule'),
          ]}
        />
      </ZStack>
      <Text modifiers={[font({ size: 11, weight: 'bold', design: 'rounded' }), foregroundStyle(text)]}>
        {full ? 'Full' : `${props.energy}/${props.fullBar}`}
      </Text>
    </HStack>
  );

  const dragon = (size: number) =>
    props.dragonUri ? (
      <Image uiImage={props.dragonUri} modifiers={[resizable(), frame({ width: size * 0.81, height: size })]} />
    ) : (
      <Text modifiers={[font({ size: size * 0.6 })]}>🐉</Text>
    );

  const habitRow = (h: WidgetHabit) => (
    <HStack key={h.id} spacing={8}>
      <Text modifiers={[font({ size: 14 })]}>{h.emoji}</Text>
      <Text
        modifiers={[
          font({ size: 13, weight: 'semibold', design: 'rounded' }),
          foregroundStyle(h.done ? sub : text),
          lineLimit(1),
          strikethrough({ isActive: h.done, pattern: 'solid' }),
        ]}>
        {h.title}
      </Text>
      <Spacer />
      {h.done ? (
        <Text modifiers={[font({ size: 14, weight: 'bold' }), foregroundStyle(ACCENT)]}>✓</Text>
      ) : (
        <Button
          label="✓"
          target={`tick:${h.id}`}
          onPress={() => tick(h.id)}
          modifiers={[buttonStyle('bordered'), font({ size: 12, weight: 'bold' }), foregroundStyle(ACCENT)]}
        />
      )}
    </HStack>
  );

  const background = containerBackground(
    {
      type: 'linearGradient',
      colors: dark ? ['#2B2550', '#1F2A3A'] : ['#DCEFFF', '#E7F3D3'],
      startPoint: { x: 0.5, y: 0 },
      endPoint: { x: 0.5, y: 1 },
    },
    'widget',
  );

  // Lock Screen: tiny, monochrome-friendly.
  if (family === 'accessoryCircular') {
    return (
      <Gauge
        value={Math.min(props.energy, props.fullBar) / props.fullBar}
        currentValueLabel={<Text>{left}</Text>}
        modifiers={[containerBackground('clear', 'widget')]}
      />
    );
  }
  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2} modifiers={[containerBackground('clear', 'widget')]}>
        <Text modifiers={[font({ size: 14, weight: 'bold', design: 'rounded' })]}>🐉 {props.petName}</Text>
        <Text modifiers={[font({ size: 12, design: 'rounded' })]}>
          ⚡ {props.energy}/{props.fullBar} · {left} left
        </Text>
      </VStack>
    );
  }

  if (family === 'systemSmall') {
    return (
      <VStack spacing={4} modifiers={[background, padding({ all: 4 })]}>
        {dragon(78)}
        <Text modifiers={[font({ size: 12, weight: 'bold', design: 'rounded' }), foregroundStyle(text), lineLimit(1)]}>
          {status}
        </Text>
        {energyBar(70)}
      </VStack>
    );
  }

  const shown = family === 'systemLarge' ? props.habits.slice(0, 6) : props.habits.filter((h) => !h.done).slice(0, 3);

  if (family === 'systemMedium') {
    return (
      <HStack spacing={12} modifiers={[background]}>
        <VStack spacing={4}>
          {dragon(92)}
          {energyBar(56)}
        </VStack>
        <VStack alignment="leading" spacing={6}>
          <Text modifiers={[font({ size: 13, weight: 'bold', design: 'rounded' }), foregroundStyle(text)]}>
            {status}
          </Text>
          {shown.length > 0 ? (
            shown.map(habitRow)
          ) : (
            <Text modifiers={[font({ size: 12, design: 'rounded' }), foregroundStyle(sub)]}>
              {props.awayNote || `${props.petName} is proud of you.`}
            </Text>
          )}
          <Spacer />
        </VStack>
      </HStack>
    );
  }

  // systemLarge
  return (
    <VStack alignment="leading" spacing={10} modifiers={[background]}>
      <HStack spacing={12}>
        {dragon(96)}
        <VStack alignment="leading" spacing={6}>
          <Text modifiers={[font({ size: 17, weight: 'bold', design: 'rounded' }), foregroundStyle(text)]}>
            {props.petName}
          </Text>
          <Text modifiers={[font({ size: 13, design: 'rounded' }), foregroundStyle(sub)]}>
            {props.awayNote || status}
          </Text>
          {energyBar(120)}
        </VStack>
        <Spacer />
      </HStack>
      <Text modifiers={[font({ size: 12, weight: 'bold', design: 'rounded' }), foregroundStyle(sub)]}>TODAY</Text>
      {shown.length > 0 ? (
        shown.map(habitRow)
      ) : (
        <Text modifiers={[font({ size: 13, design: 'rounded' }), foregroundStyle(sub)]}>
          No habits today. Enjoy the day off!
        </Text>
      )}
      <Spacer />
    </VStack>
  );
};

export default createWidget<TodayWidgetProps>('TodayWidget', TodayWidget);
