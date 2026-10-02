import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { QuizSections, type QuizQuestion } from '@/constants/quiz';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type QuizProgressProps = {
  questions: readonly QuizQuestion[];
  index: number;
};

/** One segment per quiz section, each filling as its questions are answered. */
export function QuizProgress({ questions, index }: QuizProgressProps) {
  const theme = useTheme();
  const current = questions[index];
  const sectionLabel = QuizSections.find((s) => s.id === current.section)?.label ?? '';

  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityLabel={`${sectionLabel}, question ${index + 1} of ${questions.length}`}>
      <View style={styles.segments}>
        {QuizSections.map((section) => {
          const inSection = questions
            .map((q, i) => ({ q, i }))
            .filter(({ q }) => q.section === section.id);
          const done = inSection.filter(({ i }) => i < index).length;
          const fraction = inSection.length ? done / inSection.length : 0;
          return (
            <View
              key={section.id}
              style={[styles.track, { backgroundColor: theme.artCard }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${fraction * 100}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
          );
        })}
      </View>
      <ThemedText type="smallBold" themeColor="inkSecondary">
        {sectionLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: Spacing.one,
  },
  segments: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
});
