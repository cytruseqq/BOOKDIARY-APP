import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://kgtohoepsyyyayuynthd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PMrCPHw4bHAdbza_rsLAbQ_RJUVol5Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
