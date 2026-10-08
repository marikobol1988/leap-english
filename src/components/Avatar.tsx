import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { CHARACTERS, type CharacterId } from '../content';

/** Simple bust avatars for the cast. Replace with commissioned illustrations before launch. */
export function Avatar({ id, size = 72 }: { id: CharacterId; size?: number }) {
  const c = CHARACTERS[id], { skin, hair, style, shirt, bg } = c.look;
  const shortHair = <Path d="M25 33 Q23 16 40 16 Q57 16 55 33 Q52 23 40 23 Q29 23 25 33Z" fill={hair} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" accessibilityLabel={c.name} style={{ borderRadius: size / 2, overflow: 'hidden' }}>
      <Rect width={80} height={80} rx={40} fill={bg} />
      {style === 'long' && <Path d="M22 42 Q20 14 40 14 Q60 14 58 42 L60 66 L20 66Z" fill={hair} />}
      {style === 'bun' && <Circle cx={40} cy={13} r={8} fill={hair} />}
      <Path d="M12 82 Q15 61 40 59 Q65 61 68 82Z" fill={shirt} />
      <Rect x={34} y={47} width={12} height={13} rx={4} fill={skin} />
      <Ellipse cx={40} cy={36} rx={15} ry={17} fill={skin} />
      {style === 'long' && <Path d="M25 34 Q26 18 40 18 Q54 18 55 34 Q48 25 40 27 Q31 25 25 34Z" fill={hair} />}
      {(style === 'short' || style === 'beard') && shortHair}
      {style === 'beard' && <Path d="M26 38 Q27 55 40 55 Q53 55 54 38 Q51 47 40 47 Q29 47 26 38Z" fill={hair} />}
      {style === 'bun' && <Path d="M25 34 Q24 17 40 17 Q56 17 55 34 Q50 23 40 24 Q30 23 25 34Z" fill={hair} />}
      {style === 'curly' && (
        <G fill={hair}>
          <Circle cx={28} cy={27} r={7} /><Circle cx={34} cy={20} r={7} /><Circle cx={42} cy={18} r={7} /><Circle cx={50} cy={21} r={7} />
          <Circle cx={54} cy={29} r={6} /><Circle cx={25} cy={36} r={5} /><Circle cx={56} cy={37} r={5} />
        </G>
      )}
      <Circle cx={34} cy={37} r={2} fill="#2A1A12" /><Circle cx={46} cy={37} r={2} fill="#2A1A12" />
      <Circle cx={30} cy={42} r={2.6} fill="#F28B6B" opacity={0.35} /><Circle cx={50} cy={42} r={2.6} fill="#F28B6B" opacity={0.35} />
      {style === 'beard'
        ? <Path d="M36 46 Q40 49 44 46" stroke="#F1F4F7" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        : <Path d="M35 44 Q40 48.5 45 44" stroke="#4A2A1C" strokeWidth={1.8} fill="none" strokeLinecap="round" />}
      {id === 'brown' && <Path d="M32 60 Q34 72 40 72 Q46 72 48 60" stroke="#4A5563" strokeWidth={2} fill="none" />}
    </Svg>
  );
}
