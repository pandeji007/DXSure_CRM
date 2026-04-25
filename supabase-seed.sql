-- DXSure CRM sample data seed
-- Run this after `supabase-setup.sql` and after creating at least one admin user.

insert into public.clients (name, email, phone, company, status, source, address, notes)
select *
from (
  values
    ('Ananya Sharma', 'ananya@nimbuslabs.in', '+91 98765 10001', 'Nimbus Labs', 'active', 'website', 'Bengaluru, Karnataka', 'Primary enterprise account'),
    ('Rohit Mehta', 'rohit@orbitretail.in', '+91 98765 10002', 'Orbit Retail', 'active', 'referral', 'Mumbai, Maharashtra', 'Interested in annual support contract'),
    ('Priya Nair', 'priya@latticeworks.in', '+91 98765 10003', 'Lattice Works', 'inactive', 'email', 'Kochi, Kerala', 'Re-engagement candidate')
) as seed(name, email, phone, company, status, source, address, notes)
where not exists (select 1 from public.clients);

insert into public.leads (
  title,
  contact_name,
  contact_email,
  contact_phone,
  company,
  status,
  priority,
  source,
  value,
  expected_close_date,
  assigned_to,
  notes
)
select
  seed.title,
  seed.contact_name,
  seed.contact_email,
  seed.contact_phone,
  seed.company,
  seed.status,
  seed.priority,
  seed.source,
  seed.value,
  seed.expected_close_date,
  coalesce(
    (select id from public.profiles where role = 'employee' order by created_at limit 1),
    (select id from public.profiles where role = 'admin' order by created_at limit 1)
  ),
  seed.notes
from (
  values
    ('CRM Rollout for Nimbus Labs', 'Ananya Sharma', 'ananya@nimbuslabs.in', '+91 98765 10001', 'Nimbus Labs', 'qualified', 'high', 'website', 250000, current_date + 10, 'Needs onboarding and sales handoff'),
    ('Support Retainer Renewal', 'Rohit Mehta', 'rohit@orbitretail.in', '+91 98765 10002', 'Orbit Retail', 'contacted', 'medium', 'referral', 95000, current_date + 21, 'Follow up after finance approval'),
    ('New Branch Setup', 'Karan Patel', 'karan@atlasbuild.in', '+91 98765 10004', 'Atlas Build', 'new', 'urgent', 'cold_call', 180000, current_date + 14, 'Decision maker requested solution deck')
) as seed(title, contact_name, contact_email, contact_phone, company, status, priority, source, value, expected_close_date, notes)
where not exists (select 1 from public.leads);

insert into public.tickets (
  title,
  description,
  priority,
  status,
  assigned_to,
  due_date,
  client_id,
  user_id
)
select
  seed.title,
  seed.description,
  seed.priority,
  seed.status,
  coalesce(
    (select id from public.profiles where role = 'employee' order by created_at limit 1),
    (select id from public.profiles where role = 'admin' order by created_at limit 1)
  ),
  seed.due_date,
  (select id from public.clients where company = seed.company limit 1),
  (select id from public.profiles where role = 'admin' order by created_at limit 1)
from (
  values
    ('Finalize onboarding checklist', 'Prepare implementation checklist and assign owners for Nimbus Labs.', 'high', 'pending', current_date + 2, 'Nimbus Labs'),
    ('Schedule renewal review call', 'Coordinate review call with Orbit Retail stakeholders.', 'medium', 'in_progress', current_date + 4, 'Orbit Retail')
) as seed(title, description, priority, status, due_date, company)
where not exists (select 1 from public.tickets);

insert into public.follow_ups (type, status, scheduled_at, notes, client_id, lead_id, user_id)
select
  seed.type,
  seed.status,
  seed.scheduled_at,
  seed.notes,
  seed.client_id,
  seed.lead_id,
  coalesce(
    (select id from public.profiles where role = 'employee' order by created_at limit 1),
    (select id from public.profiles where role = 'admin' order by created_at limit 1)
  )
from (
  values
    (
      'call',
      'scheduled',
      now() + interval '1 day',
      'Confirm rollout timeline and procurement owner.',
      (select id from public.clients where company = 'Nimbus Labs' limit 1),
      null
    ),
    (
      'meeting',
      'scheduled',
      now() + interval '2 days',
      'Demo workflow automation to Atlas Build.',
      null,
      (select id from public.leads where company = 'Atlas Build' limit 1)
    )
) as seed(type, status, scheduled_at, notes, client_id, lead_id)
where not exists (select 1 from public.follow_ups);

insert into public.finance_entries (type, amount, entry_date, payment_method, description, client_id, reference, created_by)
select
  seed.type,
  seed.amount,
  seed.entry_date,
  seed.payment_method,
  seed.description,
  seed.client_id,
  seed.reference,
  (select id from public.profiles where role = 'admin' order by created_at limit 1)
from (
  values
    (
      'payment',
      125000,
      current_date - 2,
      'bank_transfer',
      'Initial payment received for Nimbus Labs rollout',
      (select id from public.clients where company = 'Nimbus Labs' limit 1),
      'INV-1001'
    ),
    (
      'expense',
      8500,
      current_date - 1,
      'upi',
      'Travel and meeting expenses',
      null,
      'EXP-204'
    )
) as seed(type, amount, entry_date, payment_method, description, client_id, reference)
where not exists (select 1 from public.finance_entries);

insert into public.day_plans (user_id, plan_date, tasks, status)
select
  coalesce(
    (select id from public.profiles where role = 'employee' order by created_at limit 1),
    (select id from public.profiles where role = 'admin' order by created_at limit 1)
  ),
  current_date,
  jsonb_build_array(
    jsonb_build_object('title', 'Follow up with Nimbus Labs', 'completed', false),
    jsonb_build_object('title', 'Update Orbit Retail renewal notes', 'completed', false),
    jsonb_build_object('title', 'Review support ticket backlog', 'completed', false)
  ),
  'submitted'
where not exists (select 1 from public.day_plans);

insert into public.vendors (name, email, phone, company, address, notes)
select *
from (
  values
    ('Sahil Verma', 'sahil@rapidprint.in', '+91 98765 10005', 'Rapid Print', 'Delhi', 'Print collateral vendor'),
    ('Meera Iyer', 'meera@cloudrack.in', '+91 98765 10006', 'CloudRack', 'Chennai', 'Hosting and infra support')
) as seed(name, email, phone, company, address, notes)
where not exists (select 1 from public.vendors);

insert into public.activity_logs (user_id, action, entity_type, entity_id, description)
select
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  seed.action,
  seed.entity_type,
  seed.entity_id,
  seed.description
from (
  values
    ('created_client', 'client', (select id from public.clients where company = 'Nimbus Labs' limit 1), 'Created client: Nimbus Labs'),
    ('created_lead', 'lead', (select id from public.leads where company = 'Atlas Build' limit 1), 'Created lead: New Branch Setup'),
    ('recorded_payment', 'finance', (select id from public.finance_entries where reference = 'INV-1001' limit 1), 'Recorded payment: 125000')
) as seed(action, entity_type, entity_id, description)
where not exists (select 1 from public.activity_logs);
