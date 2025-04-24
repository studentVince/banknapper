import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://jcujiwcfrvkkzdtiujuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdWppd2NmcnZra3pkdGl1anVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NTM3NDYsImV4cCI6MjA2MDAyOTc0Nn0.Z2xf-_0UyU4SdLYc3RMV87QB0T1XUCeyE0GpiZdpmt4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});