import { Easing, Keyframe } from 'react-native-reanimated';

/**
 * The app's one way of making something appear: a short fade while it grows from
 * 94% to full size, with no bounce. Used where a picture or card pops in.
 */
export const gentleIn = () =>
  new Keyframe({
    0: { opacity: 0, transform: [{ scale: 0.94 }] },
    100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.out(Easing.cubic) },
  }).duration(260);

/** How far small icons swell when something arrives (a bolt, a diamond): a nudge, not a pop. */
export const NUDGE = 1.1;
