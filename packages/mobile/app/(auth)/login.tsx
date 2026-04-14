import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  Image, StatusBar,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha');
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(app)');
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Credenciais inválidas');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top white area with logo */}
      <View style={styles.topArea}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🎒</Text>
          </View>
          <View>
            <Text style={styles.logoSubtitle}>SISTEMA</Text>
            <Text style={styles.logoTitle}>ChegueiApp</Text>
          </View>
        </View>
      </View>

      {/* Bottom purple area */}
      <View style={styles.bottomArea}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor="rgba(255,255,255,0.6)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#7C3AED" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Responsável? Use o email cadastrado pela escola
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C3AED',
  },
  topArea: {
    flex: 0.35,
    backgroundColor: 'white',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 2,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  bottomArea: {
    flex: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#7C3AED',
    fontSize: 17,
    fontWeight: '700',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
