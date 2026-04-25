import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasPlaceholderConfig =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project') ||
  supabaseUrl.includes('your-supabase-url') ||
  supabaseAnonKey.includes('your-anon-key');

export const supabaseConfigMessage =
  'Supabase credentials are not configured correctly. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env with your Supabase project values.';

export const isSupabaseConfigured = !hasPlaceholderConfig;

function createMockError() {
  return new Error(supabaseConfigMessage);
}

function createMockResult(operation, payload, expectsSingle) {
  if (operation === 'select') {
    return {
      data: expectsSingle ? null : [],
      error: null,
    };
  }

  if (operation === 'insert' || operation === 'update' || operation === 'upsert') {
    const normalizedData = expectsSingle
      ? Array.isArray(payload)
        ? payload[0] ?? null
        : payload ?? null
      : Array.isArray(payload)
        ? payload
        : payload
          ? [payload]
          : [];

    return {
      data: normalizedData,
      error: createMockError(),
    };
  }

  if (operation === 'delete') {
    return {
      data: null,
      error: createMockError(),
    };
  }

  return {
    data: expectsSingle ? null : [],
    error: null,
  };
}

function createMockQueryBuilder() {
  let operation = 'select';
  let payload;
  let expectsSingle = false;

  const resolveResult = () => Promise.resolve(createMockResult(operation, payload, expectsSingle));

  const proxy = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'insert' || prop === 'update' || prop === 'upsert') {
          return (value) => {
            operation = prop;
            payload = value;
            return proxy;
          };
        }

        if (prop === 'delete') {
          return () => {
            operation = 'delete';
            return proxy;
          };
        }

        if (prop === 'single' || prop === 'maybeSingle') {
          return () => {
            expectsSingle = true;
            return proxy;
          };
        }

        if (prop === 'then') {
          return (onFulfilled, onRejected) => resolveResult().then(onFulfilled, onRejected);
        }

        if (prop === 'catch') {
          return (onRejected) => resolveResult().catch(onRejected);
        }

        if (prop === 'finally') {
          return (onFinally) => resolveResult().finally(onFinally);
        }

        if (typeof prop === 'symbol') {
          return undefined;
        }

        return () => proxy;
      },
    }
  );

  return proxy;
}

function createMockSupabaseClient() {
  if (import.meta.env.DEV) {
    console.warn(supabaseConfigMessage);
  }

  return {
    from() {
      return createMockQueryBuilder();
    },
    auth: {
      async getUser() {
        return {
          data: { user: null },
          error: null,
        };
      },
      async getSession() {
        return {
          data: { session: null },
          error: null,
        };
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        };
      },
      async signInWithPassword() {
        return {
          data: { user: null, session: null },
          error: createMockError(),
        };
      },
      async signUp() {
        return {
          data: { user: null, session: null },
          error: createMockError(),
        };
      },
      async signOut() {
        return {
          error: null,
        };
      },
      async updateUser() {
        return {
          data: { user: null },
          error: createMockError(),
        };
      },
    },
  };
}

function createSupabaseBrowserClient(options) {
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

export function createEphemeralSupabaseClient() {
  if (!isSupabaseConfigured) {
    return createMockSupabaseClient();
  }

  return createSupabaseBrowserClient({
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'dxsure-crm-ephemeral-auth',
    },
  });
}

export const supabase = isSupabaseConfigured
  ? createSupabaseBrowserClient()
  : createMockSupabaseClient();
