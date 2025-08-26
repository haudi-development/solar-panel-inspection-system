-- プロジェクトテーブル
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  location text,
  capacity_mw decimal,
  panel_rows integer default 4,
  panel_cols integer default 12,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  user_id text
);

-- 点検テーブル
create table if not exists inspections (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  inspection_date date default current_date,
  status text check (status in ('uploading', 'analyzing', 'completed')),
  total_panels integer default 48,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 画像テーブル
create table if not exists images (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references inspections(id) on delete cascade,
  file_url text not null,
  thermal_url text,
  image_type text check (image_type in ('rgb', 'thermal')),
  grid_position integer,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 異常テーブル
create table if not exists anomalies (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references inspections(id) on delete cascade,
  panel_id text not null,
  anomaly_type text check (anomaly_type in ('hotspot_single', 'hotspot_multi', 'bypass_diode', 'soiling', 'vegetation')),
  severity text check (severity in ('critical', 'moderate', 'minor')),
  iec_class text check (iec_class in ('IEC1', 'IEC2', 'IEC3', 'unclassified')),
  power_loss_watts decimal,
  temperature_delta decimal,
  coordinates jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLSポリシー
alter table projects enable row level security;
alter table inspections enable row level security;
alter table images enable row level security;
alter table anomalies enable row level security;

-- 全ユーザーに対してフルアクセスを許可（MVP版）
create policy "Allow all operations on projects" on projects for all using (true);
create policy "Allow all operations on inspections" on inspections for all using (true);
create policy "Allow all operations on images" on images for all using (true);
create policy "Allow all operations on anomalies" on anomalies for all using (true);

-- Storage Bucket (Supabase管理画面で実行)
-- insert into storage.buckets (id, name, public) values ('inspection-images', 'inspection-images', true);