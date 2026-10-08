import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { T } from '../../components/Text';
import { Card } from '../../components/ui';
import { CHARACTERS, UNITS, sectionOf, unitById } from '../../content';
import { IMAGES } from '../../content/images';
import { useAccent } from '../../lib/progress';
import { speak } from '../../lib/speech';
import { colors, fonts } from '../../theme';

function Listen({ text }: { text: string }) {
  const a = useAccent();
  return (
    <Pressable onPress={() => speak(text)} accessibilityLabel={`მოსმენა: ${text}`} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: a.soft, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="volume-2" size={18} color={a.acc} />
    </Pressable>
  );
}

function Section({ title, icon, children }: { title: string; icon: 'message-circle' | 'zap' | 'alert-circle' | 'star'; children: ReactNode }) {
  const a = useAccent();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name={icon} size={16} color={a.acc} /><T style={{ fontFamily: fonts.kaBold, fontSize: 12, color: a.acc }}>{title}</T></View>
      {children}
    </View>
  );
}

/** Unit guidebook: dialogue, grammar, key phrases, common mistakes, words, pronunciation. */
export default function Guide() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const a = useAccent();
  const u = unitById(unitId), sec = sectionOf(u);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 56, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="უკან"><Icon name="arrow-left" size={24} color={colors.muted} /></Pressable>
        <T v="small">გზამკვლევი</T><View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 18, paddingBottom: 24 }}>
        <View style={{ gap: 4 }}>
          <T style={{ fontFamily: fonts.kaBold, fontSize: 12, color: a.acc }}>{sec.cefr} · თავი {UNITS.indexOf(u) + 1}</T>
          <T v="h1">{u.ka}</T><T v="small" style={{ fontFamily: fonts.en }}>{u.en}</T>
        </View>
        <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flexDirection: 'row' }}><Avatar id={u.host} size={46} /><View style={{ marginLeft: -12 }}><Avatar id={u.partner} size={46} /></View></View>
          <T v="small" style={{ flex: 1 }}><T style={{ fontFamily: fonts.kaBold, fontSize: 13 }}>{CHARACTERS[u.host].name} და {CHARACTERS[u.partner].name}. </T>{u.scene}</T>
        </Card>

        <Section title="დიალოგი" icon="message-circle">
          {u.dialog.map((l) => {
            const me = l.speaker === u.host;
            return (
              <View key={l.id} style={{ flexDirection: me ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end', maxWidth: '92%', alignSelf: me ? 'flex-end' : 'flex-start' }}>
                <Avatar id={l.speaker} size={36} />
                <View style={{ flexShrink: 1, padding: 10, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5, gap: 2, backgroundColor: me ? a.soft : colors.surface, borderColor: me ? a.dk : colors.line }}>
                  <T style={{ fontFamily: fonts.kaBold, fontSize: 11, color: me ? a.acc : colors.muted }}>{CHARACTERS[l.speaker].name}</T>
                  <T v="en" style={{ fontSize: 15 }}>{l.en}</T><T v="caption">{l.ka}</T>
                </View>
                <Listen text={l.en} />
              </View>
            );
          })}
        </Section>

        <Section title="გრამატიკა" icon="zap">
          <Card style={{ padding: 16, gap: 12 }}>
            <T v="h3" style={{ fontSize: 17 }}>{u.grammar.title}</T><T style={{ fontSize: 14 }}>{u.grammar.explanation}</T>
            {u.grammar.examples.map((e) => (
              <View key={e.en} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, backgroundColor: colors.sunk }}>
                <View style={{ flex: 1 }}><T style={{ fontFamily: fonts.enBold, fontSize: 15 }}>{e.en}</T><T v="caption">{e.ka}</T></View><Listen text={e.en} />
              </View>
            ))}
            <T v="caption">{u.tip}</T>
          </Card>
        </Section>

        <Section title="საკვანძო ფრაზები" icon="message-circle">
          <Card style={{ paddingHorizontal: 16 }}>
            {u.phrases.map((p, i) => (
              <View key={p.id} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: colors.line }}>
                <Listen text={p.en} /><View style={{ flex: 1 }}><T style={{ fontFamily: fonts.enBold }}>{p.en}</T><T v="small">{p.ka}</T></View>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="ხშირი შეცდომები" icon="alert-circle">
          <Card>
            {u.mistakes.map((m, i) => (
              <View key={m.id} style={{ padding: 12, paddingHorizontal: 14, gap: 4, borderTopWidth: i ? 1 : 0, borderColor: colors.line }}>
                <T style={{ fontFamily: fonts.enBold, color: colors.error, textDecorationLine: 'line-through' }}>✗ {m.wrong}</T>
                <T style={{ fontFamily: fonts.enBold, color: colors.success }}>✓ {m.correct}</T>
                <T v="caption">{m.note}</T>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="სიტყვები" icon="star">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {u.vocab.map((v) => (
              <Pressable key={v.id} onPress={() => speak(v.en)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, paddingRight: 12, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface }}>
                <Image source={IMAGES[v.image]} style={{ width: 28, height: 28 }} contentFit="contain" />
                <T style={{ fontFamily: fonts.enBold, fontSize: 14 }}>{v.en} <T v="caption">{v.ka}</T></T>
              </Pressable>
            ))}
          </View>
        </Section>

        <Card style={{ padding: 14, gap: 2 }}><T style={{ fontFamily: fonts.kaBold, fontSize: 12, color: colors.sky }}>გამოთქმა</T><T style={{ fontSize: 13.5 }}>{u.soundTip}</T></Card>
        <Card style={{ padding: 14, gap: 2 }}><T style={{ fontFamily: fonts.kaBold, fontSize: 12, color: a.acc }}>კარგი იქნება იცოდე</T><T style={{ fontSize: 13.5 }}>{u.note}</T></Card>
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 12, padding: 24, paddingTop: 12 }}>
        <Button style={{ flex: 1 }} kind="quiet" label="ვარჯიში" onPress={() => router.replace({ pathname: '/session', params: { kind: 'practice', mode: 'unit', unitId: u.id } })} />
        <Button style={{ flex: 1 }} label="გასაგებია" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
