import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { useAccent } from '../lib/progress';

export type Mood = 'happy' | 'cheer' | 'think' | 'sad';
const COAT = '#F2B23A', SPOT = '#7A4A22', MUZZLE = '#FFF1DC', INK = '#2A1A12', NOSE = '#3A2218';

/** Tari's face in a 200x200 box (Figma: Leap/Brand/Tari face, Leap/Mascot/*). */
function Face({ mood }: { mood: Mood }) {
  const eyesOpen = (hl: number) => (
    <>
      <Ellipse cx={72} cy={110} rx={11} ry={14} fill={INK} /><Ellipse cx={128} cy={110} rx={11} ry={14} fill={INK} />
      <Circle cx={75} cy={hl} r={4} fill="#fff" /><Circle cx={131} cy={hl} r={4} fill="#fff" />
    </>
  );
  return (
    <G>
      <Circle cx={50} cy={56} r={28} fill={COAT} /><Circle cx={150} cy={56} r={28} fill={COAT} />
      <Circle cx={50} cy={56} r={14} fill="#F6C9A6" /><Circle cx={150} cy={56} r={14} fill="#F6C9A6" />
      <Ellipse cx={100} cy={112} rx={80} ry={70} fill={COAT} />
      <G fill={SPOT}>
        <Circle cx={100} cy={56} r={7} /><Circle cx={78} cy={64} r={4.5} /><Circle cx={122} cy={64} r={4.5} />
        <Circle cx={34} cy={108} r={5} /><Circle cx={166} cy={108} r={5} /><Circle cx={42} cy={134} r={4} /><Circle cx={158} cy={134} r={4} />
      </G>
      <Ellipse cx={100} cy={146} rx={42} ry={30} fill={MUZZLE} />
      <Circle cx={58} cy={134} r={9} fill="#F28B6B" opacity={0.45} /><Circle cx={142} cy={134} r={9} fill="#F28B6B" opacity={0.45} />
      {mood === 'cheer'
        ? <Path d="M60 114 Q72 98 84 114 M116 114 Q128 98 140 114" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        : eyesOpen(mood === 'think' ? 101 : 105)}
      {mood === 'think' && <Path d="M60 88 Q72 80 84 86 M118 92 L140 90" stroke={SPOT} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {mood === 'sad' && (
        <>
          <Path d="M60 90 L82 97 M140 90 L118 97" stroke={SPOT} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M146 120 Q152 132 146 138 Q140 132 146 120Z" fill="#7CC4F2" />
        </>
      )}
      <Path d="M89 130 Q100 123 111 130 Q105 141 100 141 Q95 141 89 130Z" fill={NOSE} />
      {mood === 'cheer' && <Path d="M84 147 Q100 176 116 147Z" fill="#8E3B2E" stroke={NOSE} strokeWidth={3} strokeLinejoin="round" />}
      {mood === 'think' && <Path d="M92 153 Q102 150 112 154" stroke={NOSE} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
      {mood === 'sad' && <Path d="M88 158 Q100 147 112 158" stroke={NOSE} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
      {mood === 'happy' && <Path d="M100 141 L100 147 M88 150 Q100 160 112 150" stroke={NOSE} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
    </G>
  );
}

export function TariFace({ size = 30, mood = 'happy' }: { size?: number; mood?: Mood }) {
  return <Svg width={size} height={size} viewBox="0 0 200 200" accessible={false}><Face mood={mood} /></Svg>;
}

/** Full body, sitting, wearing a scarf in the app accent colour. */
export function Tari({ width = 176, mood = 'happy' }: { width?: number; mood?: Mood }) {
  const a = useAccent();
  return (
    <Svg width={width} height={width * 1.2} viewBox="0 0 300 360" accessibilityLabel="ტარი">
      <Path d="M212 305 Q292 305 282 232 Q274 192 246 206" stroke={COAT} strokeWidth={22} fill="none" strokeLinecap="round" />
      <Circle cx={246} cy={206} r={11} fill={SPOT} />
      <Ellipse cx={150} cy={268} rx={82} ry={72} fill={COAT} /><Ellipse cx={150} cy={284} rx={48} ry={50} fill={MUZZLE} />
      <G fill={SPOT}><Circle cx={90} cy={250} r={6} /><Circle cx={210} cy={250} r={6} /><Circle cx={96} cy={296} r={5} /><Circle cx={204} cy={296} r={5} /></G>
      <Ellipse cx={122} cy={298} rx={16} ry={24} fill={COAT} /><Ellipse cx={178} cy={298} rx={16} ry={24} fill={COAT} />
      <Ellipse cx={106} cy={334} rx={32} ry={18} fill={COAT} /><Ellipse cx={194} cy={334} rx={32} ry={18} fill={COAT} />
      <Path d="M96 330 L96 344 M108 330 L108 345 M184 330 L184 345 M196 330 L196 344" stroke="#C98A22" strokeWidth={3} strokeLinecap="round" />
      <G transform="translate(40,6) scale(1.1)"><Face mood={mood} /></G>
      <Path d="M86 200 Q150 226 214 200 L210 220 Q150 246 90 220Z" fill={a.acc} stroke={a.dk} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M176 222 L198 262 L176 260 L164 230Z" fill={a.acc} stroke={a.dk} strokeWidth={3} strokeLinejoin="round" />
    </Svg>
  );
}
