import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type BookStatus = 'to_read' | 'reading' | 'finished';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: number | null;
  notes: string | null;
  date_added: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

interface AppState {
  currentUser: any | null;
  currentProfile: UserProfile | null;
  books: Book[];
  follows: UserFollow[];
  setCurrentUser: (user: any | null) => void;
  setCurrentProfile: (profile: UserProfile | null) => void;
  setBooks: (books: Book[]) => void;
  fetchBooks: () => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'user_id' | 'date_added'>) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  fetchFollows: () => Promise<void>;
  followUser: (followingId: string) => Promise<void>;
  unfollowUser: (followingId: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  createOrUpdateProfile: (username: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  currentProfile: null,
  books: [],
  follows: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  setBooks: (books) => set({ books }),

  createOrUpdateProfile: async (username: string) => {
    const { currentUser } = get();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id);

      if (fetchError) {
        console.error('Error checking existing profile:', fetchError.message);
        return;
      }

      if (existing && existing.length > 0) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({ username, updated_at: new Date().toISOString() })
          .eq('id', currentUser.id)
          .select();

        if (!error && data && data.length > 0) {
          set({ currentProfile: data[0] as UserProfile });
          console.log('Profile updated:', data[0]);
        } else {
          console.error('Error updating profile:', error?.message);
        }
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            username,
            email: currentUser.email,
          })
          .select();

        if (!error && data && data.length > 0) {
          set({ currentProfile: data[0] as UserProfile });
          console.log('Profile created:', data[0]);
        } else {
          console.error('Error creating profile:', error?.message);
        }
      }
    } catch (err) {
      console.error('Exception in createOrUpdateProfile:', err);
    }
  },

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      if (data && data.length > 0) {
        console.log('Profile fetched:', data[0]);
        return data[0] as UserProfile;
      } else {
        console.log('No profile found for user:', userId);
        // Return placeholder profile
        return {
          id: userId,
          username: 'Czytelnik_' + userId.substring(0, 8),
          email: 'user@example.com',
          avatar_url: null,
          created_at: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  },

  fetchBooks: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date_added', { ascending: false });
      if (!error && data) {
        set({ books: data as Book[] });
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  },

  addBook: async (book) => {
    const { currentUser } = get();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          status: book.status,
          rating: book.rating,
          notes: book.notes,
          user_id: currentUser.id,
          date_added: new Date().toISOString(),
        })
        .select();

      if (!error && data && data.length > 0) {
        set((state) => ({ books: [data[0] as Book, ...state.books] }));
        console.log('Book added successfully:', data[0]);
      } else {
        console.error('Error adding book:', error?.message);
      }
    } catch (err) {
      console.error('Exception adding book:', err);
    }
  },

  updateBook: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id);

      if (!error) {
        set((state) => ({
          books: state.books.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      } else {
        console.error('Error updating book:', error.message);
      }
    } catch (err) {
      console.error('Exception updating book:', err);
    }
  },

  deleteBook: async (id) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (!error) {
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
        }));
      } else {
        console.error('Error deleting book:', error.message);
      }
    } catch (err) {
      console.error('Exception deleting book:', err);
    }
  },

  fetchFollows: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', currentUser.id);

      if (!error && data) {
        set({ follows: data as UserFollow[] });
      } else {
        console.error('Error fetching follows:', error?.message);
      }
    } catch (err) {
      console.error('Exception fetching follows:', err);
    }
  },

  followUser: async (followingId) => {
    const { currentUser } = get();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: currentUser.id,
          following_id: followingId,
        })
        .select();

      if (!error && data && data.length > 0) {
        set((state) => ({
          follows: [...state.follows, data[0] as UserFollow],
        }));
        console.log('User followed successfully');
      } else {
        console.error('Error following user:', error?.message);
      }
    } catch (err) {
      console.error('Exception following user:', err);
    }
  },

  unfollowUser: async (followingId) => {
    const { currentUser } = get();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', followingId);

      if (!error) {
        set((state) => ({
          follows: state.follows.filter(
            (f) => f.following_id !== followingId
          ),
        }));
        console.log('User unfollowed successfully');
      } else {
        console.error('Error unfollowing user:', error.message);
      }
    } catch (err) {
      console.error('Exception unfollowing user:', err);
    }
  },
}));
