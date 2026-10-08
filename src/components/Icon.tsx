import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

type FeatherName = ComponentProps<typeof Feather>['name'];
/** Feather is the closest built-in set to the Lucide icons in the Figma kit; flame and gem come from MCI. */
export function Icon({ name, size = 22, color }: { name: FeatherName | 'flame' | 'gem'; size?: number; color: ColorValue }) {
  if (name === 'flame') return <MaterialCommunityIcons name="fire" size={size} color={color as string} />;
  if (name === 'gem') return <MaterialCommunityIcons name="diamond-stone" size={size} color={color as string} />;
  return <Feather name={name} size={size} color={color as string} />;
}
