import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CHEERS, LESSON_NAMES, PATH, UNITS, currentNode, isUnlocked, nodesOfUnit } from '../content';
import { useAccent, useProgress } from '../lib/progress';
import { colors, fonts } from '../theme';
import { Icon } from './Icon';
import { Tari } from './Tari';
import { T } from './Text';

const W = 360, ROW = 112, TOP = 70, OFF = [-66, 52, 118, -8, -70, 14];

/** The winding lesson trail for one unit. */
export function LessonPath({ unitId }: { unitId: string }) {
  const a = useAccent();
  const done = useProgress((s) => s.done);
  const openChest = useProgress((s) => s.openChest);
  const ui = UNITS.findIndex((u) => u.id === unitId), flip = ui % 2 === 1;
  const nodes = nodesOfUnit(unitId), cur = currentNode(done);
  const pts = nodes.map((_, i) => ({ x: W / 2 + (flip ? -1 : 1) * OFF[i], y: TOP + i * ROW }));
  const H = TOP + (nodes.length - 1) * ROW + 60;
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i], m = (q.y - p.y) / 2; d += ` C${p.x} ${p.y + m} ${q.x} ${q.y - m} ${q.x} ${q.y}`; }

  const press = async (id: string, kind: string) => {
    if (!isUnlocked(id, done)) return Alert.alert('ჯერ დაასრულე წინა ეტაპი');
    if (kind === 'chest') {
      if (done.has(id)) return Alert.alert('საჩუქარი უკვე გახსნილია');
      try { await openChest(id); Alert.alert('+20 ბრილიანტი'); } catch (e) { Alert.alert('ვერ გაიხსნა', String(e)); }
      return;
    }
    router.push({ pathname: '/lesson/[nodeId]', params: { nodeId: id } });
  };

  return (
    <View style={{ width: '100%', maxWidth: W, alignSelf: 'center', height: H }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: 'absolute' }}>
        <Path d={d} stroke="#2A3442" strokeWidth={11} strokeLinecap="round" strokeDasharray="3 17" fill="none" />
      </Svg>
      <View style={{ position: 'absolute', top: TOP + ROW * 1.05, [flip ? 'right' : 'left']: 0, alignItems: 'center' }} pointerEvents="none">
        <Tari width={118} mood={ui % 3 === 2 ? 'cheer' : 'happy'} />
        <T v="caption" style={{ fontFamily: fonts.kaBold }}>{CHEERS[ui % CHEERS.length]}</T>
      </View>
      {nodes.map((n, i) => {
        const p = pts[i], isDone = done.has(n.id), open = isUnlocked(n.id, done), isCur = cur?.id === n.id, chest = n.kind === 'chest';
        const size = chest ? 54 : 72;
        const icon = isDone ? 'check' : chest ? 'gift' : n.kind === 'review' ? 'flag' : open ? 'star' : 'lock';
        const label = chest ? 'საჩუქარი' : n.kind === 'review' ? 'თავის გამეორება' : `გაკვეთილი ${n.lessonNumber}: ${LESSON_NAMES[(n.lessonNumber ?? 1) - 1]}`;
        return (
          <View key={n.id} style={{ position: 'absolute', left: `${(p.x / W) * 100}%`, top: p.y, transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }] }}>
            {isCur && <View style={{ position: 'absolute', left: -8, top: -8, width: size + 16, height: size + 16, borderRadius: chest ? 24 : 99, borderWidth: 2, borderColor: a.acc, backgroundColor: a.soft }} />}
            <Pressable onPress={() => press(n.id, n.kind)} accessibilityRole="button"
              accessibilityLabel={`${label}${isDone ? ' (დასრულებულია)' : !open ? ' (დაკეტილია)' : ''}`}
              style={{ width: size, height: size, borderRadius: chest ? 18 : 99, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderBottomWidth: 7,
                backgroundColor: open || isDone ? (chest ? '#FFF1C4' : a.acc) : colors.sunk,
                borderColor: open || isDone ? (chest ? colors.yellow : a.dk) : '#2A3442' }}>
              <Icon name={icon} size={chest ? 26 : 30} color={open || isDone ? (chest ? colors.yellowPressed : a.on) : '#4A5563'} />
            </Pressable>
            {isCur && !chest && <T v="caption" style={{ position: 'absolute', top: size + 6, width: 150, left: size / 2 - 75, textAlign: 'center', color: a.acc }}>{label.split(': ').pop()}</T>}
          </View>
        );
      })}
    </View>
  );
}

export const totalNodes = PATH.length;
