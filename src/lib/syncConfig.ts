// Cross-device sync settings (Supabase). Fill these in from your Supabase
// project: dashboard → Project Settings → API.
//
//   SUPABASE_URL       e.g. https://abcdefgh.supabase.co
//   SUPABASE_ANON_KEY  the "anon public" key
//
// The anon key is a PUBLIC key designed to live in client apps, so it's safe to
// ship here. While these are blank, the app simply works on this device only.

export const SUPABASE_URL = 'https://rrmxdcunuajuqnrecenc.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_KJoJ0-qZVXPU46u8-ZEXYw_bfVGzHo0'

/** True once both values are set — enables the cross-device sync features. */
export const SYNC_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
