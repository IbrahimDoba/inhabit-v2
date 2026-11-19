import { router } from 'expo-router';
import { useEffect } from 'react';

import { useCloud } from '@/hooks/use-cloud';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useOnboarding } from '@/hooks/use-onboarding';

/**
 * Tells the cloud whenever the garden changes, and opens the account page when
 * the phone and the cloud disagree and only the person can choose.
 */
export function useCloudAutoSync() {
  const { noteChange, conflict } = useCloud();
  const { companion } = useCompanion();
  const { habits, log } = useHabits();
  const { dragonName, isComplete } = useOnboarding();

  useEffect(() => {
    if (isComplete) noteChange();
  }, [noteChange, companion, habits, log, dragonName, isComplete]);

  const asking = conflict !== null;
  useEffect(() => {
    if (asking) router.push('/account');
  }, [asking]);
}
