import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonPortrait } from '@/components/dragon-portrait';
import { GardenBackdrop } from '@/components/garden-backdrop';
import { PrimaryButton } from '@/components/primary-button';
import { QuizProgress } from '@/components/quiz-progress';
import { SpeechBubble } from '@/components/speech-bubble';
import { ThemedText } from '@/components/themed-text';
import { ThinkingMark } from '@/components/thinking-mark';
import {
  buildQuiz,
  fillPet,
  OTHER_ID,
  type QuizOption,
  type QuizQuestion,
} from '@/constants/quiz';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';

const ADVANCE_DELAY = 350;

export default function QuizScreen() {
  const theme = useTheme();
  const { dragonName, quizAnswers, setQuizAnswer } = useOnboarding();
  const [index, setIndex] = useState(0);
  const [reacting, setReacting] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = buildQuiz(quizAnswers);
  const question = questions[index];
  const answer = quizAnswers[question.id];
  const otherValue = quizAnswers[`${question.id}.other`];
  const otherText = typeof otherValue === 'string' ? otherValue : '';

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const goNext = () => {
    setReacting(false);
    // Recompute: answering `areas` adds follow-up questions.
    if (index + 1 < buildQuiz(quizAnswers).length) setIndex(index + 1);
    else router.push('/onboarding/plan');
  };

  const goBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setReacting(false);
    if (index === 0) router.back();
    else setIndex(index - 1);
  };

  const chooseSingle = (id: string) => {
    setQuizAnswer(question.id, id);
    setReacting(true);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    // Single answers move on by themselves after a short happy beat.
    advanceTimer.current = setTimeout(goNext, ADVANCE_DELAY);
  };

  const toggleMulti = (q: Extract<QuizQuestion, { kind: 'multi' }>, id: string) => {
    const current = Array.isArray(answer) ? answer : [];
    const exclusive = q.exclusive ?? [];
    let next: string[];
    if (current.includes(id)) next = current.filter((x) => x !== id);
    else if (exclusive.includes(id)) next = [id];
    else next = [...current.filter((x) => !exclusive.includes(x)), id];
    if (q.max && next.length > q.max) return;
    setQuizAnswer(question.id, next);
    setReacting(true);
  };

  const canContinue =
    question.kind === 'text'
      ? typeof answer === 'string' && answer.trim().length > 0
      : question.kind === 'multi'
        ? Array.isArray(answer) && answer.length > 0
        : false;

  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.topBar}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
              style={[styles.back, { backgroundColor: theme.artCard }]}>
              <ThemedText type="subtitle" themeColor="ink">
                ‹
              </ThemedText>
            </Pressable>
            <QuizProgress questions={questions} index={index} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <View style={styles.portrait}>
              <DragonPortrait
                expression={reacting ? 'happy' : 'curious'}
                size={110}
                accessibilityLabel={dragonName}
              />
              <ThinkingMark idea={reacting} />
            </View>
            <Animated.View
              key={question.id}
              entering={FadeInRight.duration(250)}
              style={styles.question}>
              <SpeechBubble text={fillPet(question.prompt, dragonName)} />
              {question.kind === 'multi' ? (
                <ThemedText type="small" themeColor="inkSecondary" style={styles.center}>
                  {question.max ? `Pick up to ${question.max}.` : 'Pick any that fit.'}
                </ThemedText>
              ) : null}

              {question.kind === 'text' ? (
                <TextInput
                  value={typeof answer === 'string' ? answer : ''}
                  onChangeText={(text) => setQuizAnswer(question.id, text)}
                  onSubmitEditing={() => canContinue && goNext()}
                  placeholder={question.placeholder}
                  placeholderTextColor={theme.inkSecondary}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                  maxLength={24}
                  accessibilityLabel={question.placeholder}
                  style={[
                    styles.input,
                    { backgroundColor: theme.artCard, color: theme.ink, borderColor: theme.primary },
                  ]}
                />
              ) : (
                <View
                  style={styles.options}
                  accessibilityRole={question.kind === 'single' ? 'radiogroup' : undefined}>
                  {question.options.map((option) => (
                    <OptionRow
                      key={option.id}
                      option={option}
                      kind={question.kind}
                      selected={
                        Array.isArray(answer) ? answer.includes(option.id) : answer === option.id
                      }
                      onPress={() =>
                        question.kind === 'single'
                          ? chooseSingle(option.id)
                          : toggleMulti(question, option.id)
                      }
                    />
                  ))}
                  {question.kind === 'multi' && Array.isArray(answer) && answer.includes(OTHER_ID) ? (
                    <TextInput
                      value={otherText}
                      onChangeText={(text) => setQuizAnswer(`${question.id}.other`, text)}
                      placeholder="Tell us in a few words"
                      placeholderTextColor={theme.inkSecondary}
                      autoFocus
                      maxLength={80}
                      accessibilityLabel="Something else, in your own words"
                      style={[
                        styles.otherInput,
                        { backgroundColor: theme.artCard, color: theme.ink, borderColor: theme.primary },
                      ]}
                    />
                  ) : null}
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            {question.kind === 'single' ? (
              <ThemedText type="small" themeColor="inkSecondary" style={styles.center}>
                Tap an answer to continue.
              </ThemedText>
            ) : (
              <PrimaryButton label="Continue" onPress={goNext} disabled={!canContinue} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GardenBackdrop>
  );
}

type OptionRowProps = {
  option: QuizOption;
  kind: 'single' | 'multi';
  selected: boolean;
  onPress: () => void;
};

function OptionRow({ option, kind, selected, onPress }: OptionRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={kind === 'single' ? 'radio' : 'checkbox'}
      accessibilityState={kind === 'single' ? { selected } : { checked: selected }}
      accessibilityLabel={option.label}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? theme.primarySoft : theme.artCard,
          borderColor: selected ? theme.primary : 'transparent',
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText style={styles.emoji}>{option.emoji}</ThemedText>
      <ThemedText type="smallBold" themeColor="ink" style={styles.optionLabel}>
        {option.label}
      </ThemedText>
      {kind === 'multi' ? (
        <View
          style={[
            styles.box,
            {
              borderColor: selected ? theme.primary : theme.inkSecondary,
              backgroundColor: selected ? theme.primary : 'transparent',
            },
          ]}>
          {selected ? (
            <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
              ✓
            </ThemedText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  question: {
    gap: Spacing.three,
  },
  options: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  optionLabel: {
    flex: 1,
  },
  portrait: {
    alignSelf: 'center',
  },
  otherInput: {
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
    fontSize: 16,
    outlineWidth: 0,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.four,
    minHeight: 60,
    fontFamily: Fonts.heading,
    fontSize: 22,
    outlineWidth: 0,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    minHeight: 56 + Spacing.three + Spacing.two,
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
