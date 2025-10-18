-- Update profiles table to support profile pictures and starting points
-- Add profile_picture column if it doesn't exist
alter table public.profiles 
add column if not exists profile_picture text;

-- Update the trigger function to give new users 1000 starting points and a random profile picture
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  random_avatar text;
  avatar_options text[] := ARRAY[
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2359-6yCwmpkkNY0MfYT9vLrHQcjvDOmLYs.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/70a07d7a-c153-4940-bb37-3570370e674c-LHnOL81cnrbE0Q3mWklbAcMrGsVTab.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2364-n0hoacYPEBq58poFwG3opUmCFRwWDA.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2360-uVp10zBMb8HGYxVcJjUyb7rdRead0E.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8d3c900d-92ac-4bec-af7f-562df56147b2-S1RPCkLn8UjQHYxvMbiD896p85XmJG.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f54da0b-cf03-45b3-8565-5e3c0c90af6a-xZJmknFp4JDUEIxnGUMg83ZyVNefl2.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2361-VsBejtaKHWljR4lhhn87HFpCXgBRLS.jpeg'
  ];
begin
  -- Select a random avatar from the options
  random_avatar := avatar_options[floor(random() * array_length(avatar_options, 1) + 1)];
  
  insert into public.profiles (id, username, total_points, profile_picture)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    1000,  -- Starting points
    random_avatar  -- Random profile picture
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
