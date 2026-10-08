import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { CHARACTERS, type CharacterId } from '../content';
import { colors } from '../theme';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { T } from './Text';

/** A character with a speech bubble, as in the "write in English" screen. */
export function Speaker({ who, children, onListen }: { who: CharacterId; children: ReactNode; onListen?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
      <View style={{ alignItems: 'center', gap: 4, width: 76 }}>
        <Avatar id={who} size={72} />
        <T v="caption">{CHARACTERS[who].name}</T>
      </View>
      <View style={{ flex: 1, marginTop: 6, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>{children}</View>
        {onListen && (
          <Pressable onPress={onListen} accessibilityLabel="მოსმენა" style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.yellowSubtle }}>
            <Icon name="volume-2" size={22} color={colors.yellow} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
