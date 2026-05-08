-- ============================================================
-- CORRECTIONS TO MIGRATION.SQL
-- Supabase Schema Adjustments for GPM Intelligence Frontend
-- ============================================================

-- ============================================================
-- UPDATED VIEWS - Execute these to replace the original views
-- ============================================================

-- View melhorada para incluir semana_ref (útil para filtros no frontend)
create or replace view v_blocos_status as
select
  'okrs'          as bloco,
  max(inserted_at) as ultima_atualizacao,
  max(semana_ref)  as ultima_semana,
  count(*)         as total_registros,
  max(semana_ref)  as semana_ref
from okrs
group by 1
union all
select
  'work_items',
  max(inserted_at),
  max(semana_ref),
  count(*),
  max(semana_ref)
from work_items
group by 1
union all
select
  'agility_data',
  max(inserted_at),
  max(semana_ref),
  count(*),
  max(semana_ref)
from agility_data
group by 1
union all
select
  'capex_opex',
  max(inserted_at),
  max(semana_ref),
  count(*),
  max(semana_ref)
from capex_opex
group by 1
union all
select
  'clipping',
  max(inserted_at),
  max(semana_ref),
  count(*),
  max(semana_ref)
from clipping
group by 1;

-- ============================================================
-- NEW VIEW: Blocos por semana específica
-- Útil para rastrear status de cada semana
-- ============================================================
create or replace view v_blocos_por_semana as
select
  semana_ref,
  'okrs'          as bloco,
  max(inserted_at) as ultima_atualizacao,
  count(*)         as total_registros
from okrs
group by semana_ref, bloco
union all
select
  semana_ref,
  'work_items',
  max(inserted_at),
  count(*)
from work_items
group by semana_ref, bloco
union all
select
  semana_ref,
  'agility_data',
  max(inserted_at),
  count(*)
from agility_data
group by semana_ref, bloco
union all
select
  semana_ref,
  'capex_opex',
  max(inserted_at),
  count(*)
from capex_opex
group by semana_ref, bloco
union all
select
  semana_ref,
  'clipping',
  max(inserted_at),
  count(*)
from clipping
group by semana_ref, bloco;

-- ============================================================
-- INDEX IMPROVEMENTS
-- ============================================================
-- Já estão criados no Migration.SQL original, mas certifique-se de que existem
create index if not exists idx_okrs_semana_inserted on okrs (semana_ref desc, inserted_at desc);
create index if not exists idx_work_items_semana_inserted on work_items (semana_ref desc, inserted_at desc);
create index if not exists idx_agility_semana_inserted on agility_data (semana_ref desc, inserted_at desc);
create index if not exists idx_capex_opex_semana_inserted on capex_opex (semana_ref desc, inserted_at desc);
create index if not exists idx_clipping_semana_inserted on clipping (semana_ref desc, inserted_at desc);
create index if not exists idx_analyses_semana_inserted on weekly_analyses (semana_ref desc, inserted_at desc);

-- ============================================================
-- SAMPLE DATA for testing (OPTIONAL - delete before production)
-- ============================================================
-- Para testar o frontend com dados, descomente as linhas abaixo:

/*
-- Insert sample OKRs
insert into okrs (semana_ref, payload) values (
  '2025-06-16'::date,
  jsonb_build_array(
    jsonb_build_object('titulo', 'Aumentar cobertura de clientes', 'target', 85, 'atual', 78),
    jsonb_build_object('titulo', 'Reduzir tempo de onboarding', 'target', 5, 'atual', 7)
  )
);

-- Insert sample Work Items
insert into work_items (semana_ref, payload) values (
  '2025-06-16'::date,
  jsonb_build_array(
    jsonb_build_object('tipo', 'Iniciativa', 'titulo', 'Plataforma Digital 2025', 'status', 'Em Progresso'),
    jsonb_build_object('tipo', 'Release', 'titulo', 'Release 2.5', 'status', 'Em Testes'),
    jsonb_build_object('tipo', 'US', 'titulo', 'Integração Banco X', 'status', 'Bloqueada')
  )
);

-- Insert sample Agility Data
insert into agility_data (semana_ref, payload) values (
  '2025-06-16'::date,
  jsonb_build_object(
    'cycle_time', 12.5,
    'lead_time', 18.3,
    'throughput', 42,
    'bloqueios', 3,
    'aging', jsonb_build_array(30, 25, 18)
  )
);

-- Insert sample CAPEX/OPEX
insert into capex_opex (semana_ref, capex_pct, opex_pct) values (
  '2025-06-16'::date,
  75.50,
  24.50
);

-- Insert sample Clipping
insert into clipping (semana_ref, data_item, fonte, payload) values (
  '2025-06-16'::date,
  '2025-06-16'::date,
  'Newsletter TechNews',
  jsonb_build_object(
    'titulo', 'Inovações em Fintech 2025',
    'resumo', 'Tendências emergentes no setor',
    'url', 'https://example.com/news',
    'categorias', jsonb_build_array('fintech', 'inovacao')
  )
);

-- Insert sample Analysis
insert into weekly_analyses (semana_ref, narrativa_final, html_output) values (
  '2025-06-16'::date,
  '# Análise Executiva\n\nSemana com progresso moderado. CAPEX 2pp abaixo da meta.',
  '<div><h1>Análise da Semana</h1><p>Relatório teste</p></div>'
);
*/
