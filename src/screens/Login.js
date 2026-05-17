import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const BLUE = '#1C6EF2';
const BASE_URL = 'https://dummyjson.com';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Email VEYA username girilebilir — her iki durumda da doğru username'i bulur
  const resolveUsername = async (input) => {
    const res = await fetch(`${BASE_URL}/users?limit=100`);
    const data = await res.json();
    const lower = input.toLowerCase();
    // Önce email eşleşmesi, sonra username eşleşmesi (büyük/küçük harf bağımsız)
    const found = data.users.find(
      (u) =>
        u.email.toLowerCase() === lower ||
        u.username.toLowerCase() === lower,
    );
    return found ? found.username : input;
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const resolvedUsername = await resolveUsername(username.trim());

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: resolvedUsername,
          password,
          expiresInMins: 30,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Giriş başarısız. Bilgileri kontrol et.');
        return;
      }

      await login(data.accessToken, data);
    } catch (err) {
      setError('Bağlantı hatası. İnternet bağlantını kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>👥</Text>
          </View>
          <Text style={styles.brandName}>Community</Text>
        </View>

        <Text style={styles.heading}>Hoş Geldiniz</Text>
        <Text style={styles.sub}>Topluluğuna katılmak için giriş yap.</Text>

        <View style={styles.inputRow}>
          <Text style={styles.prefixIcon}>✉</Text>
          <TextInput
            id="login-username"
            style={styles.input}
            placeholder="E-posta veya Kullanıcı Adı"
            placeholderTextColor="#B0B0B0"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.prefixIcon}>🔒</Text>
          <TextInput
            id="login-password"
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#B0B0B0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            id="login-eye-toggle"
            onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity id="login-forgot" style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          id="login-submit"
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.welcomeBack}>WELCOME BACK</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 72, height: 72, backgroundColor: BLUE, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    elevation: 5, shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  logoIcon: { fontSize: 32 },
  brandName: { fontSize: 24, fontWeight: '800', color: BLUE, letterSpacing: 0.5 },
  heading: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  sub: { fontSize: 14, color: '#888', marginBottom: 28 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA',
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#EAEAEA',
  },
  prefixIcon: { fontSize: 16, color: '#888', marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 14 },
  eyeIcon: { fontSize: 18, color: '#888', padding: 4 },
  errorText: { color: '#E53E3E', fontSize: 13, marginBottom: 8, marginTop: -4 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { color: BLUE, fontSize: 14, fontWeight: '600' },
  loginBtn: {
    backgroundColor: BLUE, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', elevation: 4, shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  btnDisabled: { opacity: 0.65 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  welcomeBack: {
    marginTop: 52, textAlign: 'center', fontSize: 34,
    fontStyle: 'italic', color: '#850db8ff', letterSpacing: 6, fontWeight: '300',
  },
});

export default Login;
