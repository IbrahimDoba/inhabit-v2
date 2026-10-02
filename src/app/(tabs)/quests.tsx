import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';

export default function QuestsScreen() {
  return (
    <Screen title="Quests" hint="Small challenges that earn diamonds.">
      <ComingSoon
        emoji="🗺️"
        items={[
          'Daily quests that reset each morning.',
          'Special quests for milestones, like your first journey.',
          'Seasonal events later on.',
        ]}
      />
    </Screen>
  );
}
