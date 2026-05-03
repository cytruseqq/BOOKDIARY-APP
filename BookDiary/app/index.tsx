import { Redirect } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { Colors } from '../src/lib/constants';

export default function Index() {
  const { currentUser } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (currentUser) {
    return <Redirect href="/(tabs)/my-books" />;
  }

  return <Redirect href="/login" />;
}
