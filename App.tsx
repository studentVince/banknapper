import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { supabase } from '../banknapper/src/config/supabase';
import AppNavigation from '../banknapper/src/navigation/AppNavigation';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for user session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    
  }, []);

  return (
    <AppNavigation user={user} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
});