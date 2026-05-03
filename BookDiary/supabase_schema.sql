-- ============================================
-- BookDiary - Supabase SQL Schema
-- Uruchom poniższy kod w Supabase SQL Editor
-- ============================================

-- Tabela books
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('to_read', 'reading', 'finished')) DEFAULT 'to_read',
  rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela user_follows
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Indeksy
CREATE INDEX IF NOT EXISTS books_user_id_idx ON public.books(user_id);
CREATE INDEX IF NOT EXISTS books_status_idx ON public.books(status);
CREATE INDEX IF NOT EXISTS books_title_author_idx ON public.books(title, author);
CREATE INDEX IF NOT EXISTS user_follows_follower_idx ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS user_follows_following_idx ON public.user_follows(following_id);

-- RLS (Row Level Security)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Polityki dla tabeli books
CREATE POLICY "Users can view their own books" ON public.books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view others finished books for social features" ON public.books
  FOR SELECT USING (status = 'finished');

CREATE POLICY "Users can insert their own books" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON public.books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON public.books
  FOR DELETE USING (auth.uid() = user_id);

-- Polityki dla tabeli user_follows
CREATE POLICY "Users can view follows" ON public.user_follows
  FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Users can follow others" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);
