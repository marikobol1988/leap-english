import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { Icon } from '../../components/Icon';
import { T } from '../../components/Text';
import { Logo, Screen } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { useAccent } from '../../lib/progress';
import { colors, fonts } from '../../theme';

export default function SignIn() {
  const a = useAccent();
  const { signIn, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(''), [pw, setPw] = useState('');
  const [err, setErr] = useState(''), [note, setNote] = useState(''), [busy, setBusy] = useState(false);

  const submit = async () => { setErr(''); setBusy(true); const e = await signIn(email, pw); setBusy(false); if (e) setErr(e); };
  const forgot = async () => {
    setErr(''); setNote('');
    if (!email.trim()) return setErr('ჯერ შეიყვანე ელფოსტა.');
    const e = await sendPasswordReset(email);
    if (e) setErr(e); else setNote('პაროლის აღდგენის ბმული გამოგზავნილია ელფოსტაზე.');
  };

  return (
    <Screen style={{ padding: 24, gap: 16 }}>
      <Pressable onPress={() => router.back()} accessibilityLabel="უკან" style={{ height: 40, justifyContent: 'center' }}><Icon name="arrow-left" size={24} color={colors.muted} /></Pressable>
      <View style={{ alignItems: 'center' }}><Logo /></View>
      <T v="h1" style={{ textAlign: 'center' }}>შესვლა</T>
      <Field label="ელფოსტა" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <Field label="პაროლი" value={pw} onChangeText={setPw} secure autoComplete="current-password" textContentType="password" onSubmitEditing={submit} />
      {!!err && <View style={{ backgroundColor: colors.errorSoft, borderRadius: 12, padding: 12 }} accessibilityRole="alert"><T style={{ color: colors.error, fontSize: 13 }}>{err}</T></View>}
      {!!note && <View style={{ backgroundColor: a.soft, borderRadius: 12, padding: 12 }}><T style={{ color: a.acc, fontSize: 13 }}>{note}</T></View>}
      <Button label={busy ? 'შესვლა…' : 'შესვლა'} disabled={busy || !email || !pw} onPress={submit} />
      <Pressable onPress={forgot} style={{ alignSelf: 'center', padding: 8 }}><T style={{ fontFamily: fonts.kaBold, color: a.acc, textDecorationLine: 'underline' }}>დაგავიწყდა პაროლი?</T></Pressable>
      <Pressable onPress={() => router.replace('/onboarding')} style={{ alignSelf: 'center', padding: 8 }}>
        <T v="small">ჯერ არ გაქვს ანგარიში? <T style={{ fontFamily: fonts.kaBold, color: a.acc }}>რეგისტრაცია</T></T>
      </Pressable>
    </Screen>
  );
}
