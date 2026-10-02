import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';

export default function FriendsScreen() {
  return (
    <Screen title="Friends" hint="Habits are easier together.">
      <ComingSoon
        emoji="🫶"
        items={[
          "Visit your friends' gardens.",
          'Send one small gift a day.',
          'See their dragons grow up too.',
        ]}
      />
    </Screen>
  );
}
