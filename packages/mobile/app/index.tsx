import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return user ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/login" />;
}
