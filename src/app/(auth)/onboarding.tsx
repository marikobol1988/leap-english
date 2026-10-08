import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { Icon } from '../../components/Icon';
import { T } from '../../components/Text';
import { ProgressBar, Screen } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { useAccent } from '../../lib/progress';
import { colors, fonts } from '../../theme';

const REASONS = ['მოგზაურობა', 'სამსახური და კარიერა', 'საზღვარგარეთ ცხოვრება', 'ფილმები და სერიალები', 'თვითგანვითარება', 'სხვა'];
const LEVELS = ['ინგლისურს ახლა ვიწყებ', 'ვიცი რამდენიმე სიტყვა', 'შემიძლია მარტივი საუბარი', 'თავისუფლად ვსაუბრობ ბევრ თემაზე'];
const GOALS: [string, string, number][] = [['მსუბუქი', '5 წთ დღეში', 10], ['ჩვეულებრივი', '10 წთ დღეში', 20], ['სერიოზული', '15 წთ დღეში', 30], ['ინტენსიური', '20 წთ დღეში', 50]];

function Opt({ on, onPress, title, sub }: { on: boolean; onPress: () => void; title: string; sub?: string }) {
  const a = useAccent();
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }}
      style={{ padding: 14, borderRadius: 16, borderWidth: 2, borderColor: on ? a.acc : colors.line, backgroundColor: on ? a.soft : colors.surface, flexDirection: 'row', justifyContent: 'space-between' }}>
      <T style={{ fontFamily: fonts.kaBold, fontSize: 14 }}>{title}</T>{sub && <T v="caption">{sub}</T>}
    </Pressable>
  );
}

/** Reason → level → daily goal → account, as in the prototype. */
export default function Onboarding() {
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [goal, setGoal] = useState(20);
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [pw, setPw] = useState('');
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [sent, setSent] = useState(false);

  const submit = async () => {
    setErr('');
    if (!name.trim()) return setErr('შეიყვანე სახელი.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr('შეიყვანე სწორი ელფოსტა, მაგალითად nino@gmail.com.');
    if (pw.length < 8) return setErr('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს.');
    setBusy(true);
    const e = await signUp({ email, password: pw, displayName: name.trim(), learningReason: reason !== null ? REASONS[reason] : undefined, selfLevel: level ?? undefined, dailyGoalXp: goal });
    setBusy(false);
    if (e) setErr(e); else setSent(true); // with email confirmation on, the session arrives after the link is opened
  };

  return (
    <Screen style={{ padding: 24, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, height: 40 }}>
        <Pressable onPress={() => (step ? setStep(step - 1) : router.back())} accessibilityLabel="უკან"><Icon name="arrow-left" size={24} color={colors.muted} /></Pressable>
        <View style={{ flex: 1 }}><ProgressBar value={(step + 1) / 4} height={12} /></View>
      </View>
      {step === 0 && <>
        <T v="h1">რისთვის სწავლობ ინგლისურს?</T>
        {REASONS.map((r, i) => <Opt key={r} on={reason === i} onPress={() => setReason(i)} title={r} />)}
        <Button label="გაგრძელება" disabled={reason === null} onPress={() => setStep(1)} />
      </>}
      {step === 1 && <>
        <T v="h1">რამდენად კარგად იცი ინგლისური?</T>
        {LEVELS.map((l, i) => <Opt key={l} on={level === i} onPress={() => setLevel(i)} title={l} />)}
        <Button label="გაგრძელება" disabled={level === null} onPress={() => setStep(2)} />
      </>}
      {step === 2 && <>
        <T v="h1">აირჩიე დღიური მიზანი</T>
        <T v="small" style={{ marginTop: -8 }}>მიზანს ნებისმიერ დროს შეცვლი პროფილში.</T>
        {GOALS.map(([t, s, xp]) => <Opt key={xp} on={goal === xp} onPress={() => setGoal(xp)} title={t} sub={`${s} · ${xp} XP`} />)}
        <Button label="გაგრძელება" onPress={() => setStep(3)} />
      </>}
      {step === 3 && (sent ? <>
        <T v="h1">შეამოწმე ელფოსტა</T>
        <T v="small">{email}-ზე გამოგიგზავნეთ დადასტურების ბმული. გახსენი და დაბრუნდი აპში.</T>
        <Button kind="quiet" label="შესვლა" onPress={() => router.replace('/sign-in')} />
      </> : <>
        <T v="h1">შექმენი პროფილი</T>
        <T v="small" style={{ marginTop: -8 }}>ასე შენი პროგრესი და სერია შენახული დარჩება.</T>
        <Field label="სახელი" value={name} onChangeText={setName} autoComplete="given-name" textContentType="givenName" />
        <Field label="ელფოსტა" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
        <Field label="პაროლი" value={pw} onChangeText={setPw} secure autoComplete="new-password" textContentType="newPassword" />
        <T v="caption">მინიმუმ 8 სიმბოლო. ციფრები და დიდი ასოები პაროლს აძლიერებს.</T>
        {!!err && <View style={{ backgroundColor: colors.errorSoft, borderRadius: 12, padding: 12 }} accessibilityRole="alert"><T style={{ color: colors.error, fontSize: 13 }}>{err}</T></View>}
        <Button label={busy ? 'იქმნება…' : 'ანგარიშის შექმნა'} disabled={busy} onPress={submit} />
      </>)}
    </Screen>
  );
}
