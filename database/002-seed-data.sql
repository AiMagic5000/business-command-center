-- Business Command Center - Seed Data for Derrick Williams
-- All sensitive fields will be encrypted by the app layer on first boot
-- This file uses PLACEHOLDER values that get replaced by the seed API route

-- ============================================
-- BUSINESS OWNERS
-- ============================================
INSERT INTO business_owners (id, name, email, phone, home_address, is_admin, created_at)
VALUES
  -- Admin: Corey Pearson
  ('00000000-0000-0000-0000-000000000001', 'Corey Pearson', 'coreypearsonemail@gmail.com', '(888) 534-3569', 'Admin', TRUE, NOW()),
  -- Client: Derrick Williams
  ('00000000-0000-0000-0000-000000000002', 'Derrick Williams', 'derrickestatewilliams@gmail.com', '(775) 507-0296', '8427 W Glendale Ave, Glendale, AZ 85305', FALSE, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- ENTITIES
-- ============================================
INSERT INTO entities (id, owner_id, type, name, legal_name, jurisdiction, state, county, formation_date, status, industry, description, metadata)
VALUES
  -- Estate Vision Mgmt LLC
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'llc', 'Estate Vision Mgmt LLC', 'ESTATE VISION MGMT LLC', 'New Mexico', 'NM', 'Bernalillo',
   '2026-01-26', 'active', 'Management', 'Management company for estate and business operations',
   '{"phone": "(888) 846-2558", "website": "https://estatevisionmgmt.com", "email": "derrick@estatevisionmgmt.com", "entity_id_sos": "4424925"}'::jsonb),

  -- Derrick Lamont Williams Estate Trucking LLC
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'llc', 'Derricks Transport', 'DERRICK LAMONT WILLIAMS ESTATE TRUCKING LLC', 'New Mexico', 'NM', 'Bernalillo',
   '2026-02-27', 'active', 'Transportation', 'Trucking and transportation services',
   '{"phone": "(888) 988-9439", "website": "https://derricktransport.com", "email": "Derrick@DerrickTransport.com", "short_name": "DLWET"}'::jsonb),

  -- Estate Vision Trust
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002',
   'trust', 'Estate Vision Trust', 'Estate Vision Trust', 'New Mexico', 'NM', NULL,
   '2026-02-02', 'active', 'Asset Protection', 'Revocable Living Trust for asset protection and estate planning',
   '{"trust_type": "Revocable Living Trust", "grantor": "Derrick Williams", "trustee": "Derrick Williams", "hosted_on": "mytrustsoftware.com"}'::jsonb),

  -- Ventangari Solutions Inc
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
   'shelf_corp', 'Ventangari Solutions Inc', 'VENTANGARI SOLUTIONS INC', 'California', 'CA', NULL,
   '2022-11-01', 'in_progress', 'Holdings', 'Aged shelf corporation (3.2yr) - CA to WY domestication in progress',
   '{"corporate_age": "3.2 years", "domestication": "CA to WY", "domestication_status": "in_progress", "acquisition_date": "2026-03-14"}'::jsonb),

  -- Personal Credit Profile
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002',
   'personal', 'Personal Credit Profile', 'Derrick Williams Personal Credit', 'Arizona', 'AZ', NULL,
   '2026-02-19', 'in_progress', 'Credit', 'Personal credit repair and monitoring - in progress',
   '{"services": ["Credit Repair", "IdentityIQ Monitoring", "Rental History Addition", "Premium Pro Credit Build"], "status": "in_progress"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- ENTITY ADDRESSES
-- ============================================
INSERT INTO entity_addresses (entity_id, type, provider_name, street, suite, city, state, zip, login_url, username, notes)
VALUES
  -- Estate Vision: Virtual Office
  ('10000000-0000-0000-0000-000000000001', 'virtual', 'DaVinci Virtual Office',
   '500 Marquette Avenue NW', 'Suite 1200-5243', 'Albuquerque', 'NM', '87102',
   'https://www.davincivirtual.com/login', 'derrickwilliams', NULL),

  -- Estate Vision: Registered Agent
  ('10000000-0000-0000-0000-000000000001', 'ra', 'Registered Agents Inc',
   '1209 Mountain Road PL NE', 'Suite R', 'Albuquerque', 'NM', '87110',
   'https://accounts.newmexicoregisteredagent.com/#/login', NULL, 'Authorized individual: David Roberts. Entity ID: 4424925. Start: 01/26/2026, Stop: 01/26/2027'),

  -- Derricks Transport: Virtual Office
  ('10000000-0000-0000-0000-000000000002', 'virtual', 'DaVinci Virtual Office',
   '4801 Lang Avenue NE', 'Suite 110-16911168', 'Albuquerque', 'NM', '87109',
   'https://www.davincivirtual.com/login', 'derriccktransport', NULL),

  -- Derricks Transport: Registered Agent
  ('10000000-0000-0000-0000-000000000002', 'ra', 'Registered Agents Inc',
   '1209 Mountain Road PL NE', 'Suite R', 'Albuquerque', 'NM', '87110',
   'https://accounts.newmexicoregisteredagent.com/#/login', NULL, 'Authorized individual: David Roberts. Start: 02/27/2026, Stop: 02/27/2027'),

  -- Derrick Home Address (for owner reference)
  ('10000000-0000-0000-0000-000000000001', 'physical', NULL,
   '8427 W Glendale Ave', 'Lot 150', 'Glendale', 'AZ', '85305',
   NULL, NULL, 'Owner home address')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENTITY CREDENTIALS (passwords encrypted by seed API)
-- ============================================
INSERT INTO entity_credentials (entity_id, service_name, service_url, username, password_encrypted, category, notes)
VALUES
  -- Estate Vision Mgmt LLC credentials
  ('10000000-0000-0000-0000-000000000001', 'Hostinger Email', 'https://mail.hostinger.com', 'derrick@estatevisionmgmt.com', 'ENCRYPT:Derrickpass$999', 'email', 'Business email account'),
  ('10000000-0000-0000-0000-000000000001', 'DaVinci Virtual Office', 'https://www.davincivirtual.com/login', 'derrickwilliams', 'ENCRYPT:Derrickpass$999', 'other', 'Virtual business address portal'),
  ('10000000-0000-0000-0000-000000000001', 'NM Registered Agent', 'https://accounts.newmexicoregisteredagent.com/#/login', 'derrick@estatevisionmgmt.com', 'ENCRYPT:Derrickpass$999', 'registrar', 'Registered agent portal'),
  ('10000000-0000-0000-0000-000000000001', 'NM Secretary of State', 'https://enterprise.sos.nm.gov', 'derrick@estatevisionmgmt.com', 'ENCRYPT:Derrickpass$999', 'government', 'State business filings portal'),
  ('10000000-0000-0000-0000-000000000001', 'Dun & Bradstreet', 'https://my.dnb.com/login', 'derrick@estatevisionmgmt.com', 'ENCRYPT:Derrickpass$999', 'financial', 'DUNS number and business credit profile'),

  -- Derricks Transport LLC credentials
  ('10000000-0000-0000-0000-000000000002', 'Hostinger Email', 'https://mail.hostinger.com', 'Derrick@DerrickTransport.com', 'ENCRYPT:Derrickpass$1000', 'email', 'Business email account'),
  ('10000000-0000-0000-0000-000000000002', 'Hostinger SSH', 'ssh://195.35.34.109:65002', 'u456646851', 'ENCRYPT:Thepassword#1', 'hosting', 'Website hosting SSH access'),
  ('10000000-0000-0000-0000-000000000002', 'DaVinci Virtual Office', 'https://www.davincivirtual.com/login', 'derriccktransport', 'ENCRYPT:derrickpss', 'other', 'Virtual business address portal'),
  ('10000000-0000-0000-0000-000000000002', 'NM Registered Agent', 'https://accounts.newmexicoregisteredagent.com/#/login', 'Derrick@DerrickTransport.com', 'ENCRYPT:Derrickpass$1000', 'registrar', 'Registered agent portal'),
  ('10000000-0000-0000-0000-000000000002', 'NM Secretary of State', 'https://enterprise.sos.nm.gov', 'Derrick@DerrickTransport.com', 'ENCRYPT:Derrickpass$1000', 'government', 'State business filings portal'),
  ('10000000-0000-0000-0000-000000000002', 'Dun & Bradstreet', 'https://my.dnb.com/login', 'Derrick@DerrickTransport.com', 'ENCRYPT:Derrickpass$1000', 'financial', 'DUNS number and business credit profile')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENTITY CONTACTS
-- ============================================
INSERT INTO entity_contacts (entity_id, name, role, phone, email, organization, notes)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'David Roberts', 'Registered Agent', NULL, NULL, 'Registered Agents Inc', 'Authorized individual for RA service in NM'),
  ('10000000-0000-0000-0000-000000000002', 'David Roberts', 'Registered Agent', NULL, NULL, 'Registered Agents Inc', 'Authorized individual for RA service in NM'),
  ('10000000-0000-0000-0000-000000000001', 'Chad Siegel', 'Business Consultant', NULL, 'support@creditprivacynumber.com', 'CPN Services / Start My Business Inc', 'Primary point of contact for all business setup services'),
  ('10000000-0000-0000-0000-000000000002', 'Chad Siegel', 'Business Consultant', NULL, 'support@startmybusiness.us', 'Start My Business Inc', 'Handles trucking company setup and consulting')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENTITY DOCUMENTS (paths reference Supabase Storage)
-- ============================================
INSERT INTO entity_documents (entity_id, name, category, file_path, uploaded_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Articles of Organization', 'articles', '/documents/ev/articles-of-org.pdf', '2026-01-26'),
  ('10000000-0000-0000-0000-000000000001', 'EIN Confirmation (CP 575 G)', 'ein', '/documents/ev/ein-cp575g.pdf', '2026-01-26'),
  ('10000000-0000-0000-0000-000000000001', 'Registered Agent Certificate', 'ra', '/documents/ev/ra-certificate.pdf', '2026-01-26'),
  ('10000000-0000-0000-0000-000000000001', 'Operating Agreement', 'operating_agreement', '/documents/ev/operating-agreement.doc', '2026-01-29'),
  ('10000000-0000-0000-0000-000000000001', 'Press Release', 'press_release', '/documents/ev/press-release-v1.doc', '2026-01-29'),
  ('10000000-0000-0000-0000-000000000002', 'Articles of Organization', 'articles', '/documents/dt/articles-of-org.pdf', '2026-02-27'),
  ('10000000-0000-0000-0000-000000000002', 'EIN Confirmation (SS-4)', 'ein', '/documents/dt/ein-ss4.pdf', '2026-02-27'),
  ('10000000-0000-0000-0000-000000000002', 'Registered Agent Certificate', 'ra', '/documents/dt/ra-certificate.pdf', '2026-02-27'),
  ('10000000-0000-0000-0000-000000000002', 'Approval Letter', 'other', '/documents/dt/approval-letter.pdf', '2026-02-27')
ON CONFLICT DO NOTHING;

-- ============================================
-- RELATIONSHIPS (graph edges)
-- ============================================
INSERT INTO relationships (source_type, source_id, target_type, target_id, relationship_type, label, metadata)
VALUES
  -- Derrick owns Estate Vision Mgmt LLC
  ('owner', '00000000-0000-0000-0000-000000000002', 'entity', '10000000-0000-0000-0000-000000000001', 'owns', 'Sole Member', '{"ownership_pct": 100}'::jsonb),
  -- Derrick owns Derricks Transport
  ('owner', '00000000-0000-0000-0000-000000000002', 'entity', '10000000-0000-0000-0000-000000000002', 'owns', 'Sole Member', '{"ownership_pct": 100}'::jsonb),
  -- Derrick is grantor of Estate Vision Trust
  ('owner', '00000000-0000-0000-0000-000000000002', 'entity', '10000000-0000-0000-0000-000000000003', 'grantor_of', 'Grantor & Trustee', '{}'::jsonb),
  -- Derrick owns Ventangari
  ('owner', '00000000-0000-0000-0000-000000000002', 'entity', '10000000-0000-0000-0000-000000000004', 'owns', 'Owner', '{"acquisition": "shelf_corp"}'::jsonb),
  -- Trust manages Estate Vision Mgmt LLC (planned)
  ('entity', '10000000-0000-0000-0000-000000000003', 'entity', '10000000-0000-0000-0000-000000000001', 'manages', 'Trust-Managed LLC', '{"status": "planned"}'::jsonb),
  -- Ventangari is holding company for Transport (planned)
  ('entity', '10000000-0000-0000-0000-000000000004', 'entity', '10000000-0000-0000-0000-000000000002', 'subsidiary_of', 'Holding Company', '{"status": "planned"}'::jsonb),
  -- Personal credit profile linked to owner
  ('owner', '00000000-0000-0000-0000-000000000002', 'entity', '10000000-0000-0000-0000-000000000005', 'manages', 'Personal Profile', '{}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payments (owner_id, entity_id, invoice_number, amount, description, service_category, payment_date, payment_method, status, notes)
VALUES
  -- CPN Services payments
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-001', 700.00, 'Initial payment - CPN & Business Setup', 'CPN Services', '2026-01-08', 'Zelle', 'paid', 'Sent via Zelle to Corey Pearson'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-002', 700.00, '2nd payment - Business formation', 'CPN Services', '2026-01-12', 'Zelle', 'paid', NULL),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-003', 1000.00, '3rd payment - Ahead of schedule', 'CPN Services', '2026-01-17', 'Zelle', 'paid', 'Paid early'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-004', 700.00, '4th payment', 'CPN Services', '2026-01-24', 'Zelle', 'paid', NULL),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-005', 700.00, '5th payment + Trucking company added', 'CPN Services', '2026-01-30', 'Zelle', 'paid', 'Added trucking company to plan'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-006', 700.00, '6th payment', 'CPN Services', '2026-02-09', 'Zelle', 'paid', NULL),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'CPN-007', 695.00, '7th payment - $5 credit applied', 'CPN Services', '2026-02-14', 'Zelle', 'paid', '$5 carryover credit applied. All CPN payments complete.'),

  -- SMB Services payments (Trust & LLC Asset Protection)
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'SMB-2026-0202-001', 5400.00, 'Advanced Growth Plan - Trust & LLC Asset Protection Structure', 'Trust Services', '2026-02-02', 'Zelle', 'paid', 'Total plan amount. Payments split into installments.'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'SMB-TRUST-01', 1000.00, '1st Trust installment', 'Trust Services', '2026-02-09', 'Zelle', 'paid', NULL),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'SMB-TRUST-02', 1000.00, 'Trust payment', 'Trust Services', '2026-02-28', 'CashApp', 'paid', 'CashApp $paymyfile'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'SMB-TRUST-03', 1000.00, '2nd Trust installment', 'Trust Services', '2026-03-05', 'Zelle', 'paid', NULL),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'SMB-TRUST-04', 1080.00, '3rd Trust installment', 'Trust Services', '2026-03-07', 'Zelle', 'paid', NULL),

  -- Ventangari payment
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'SMB-2026-03142', 3300.00, 'Ventangari Solutions Inc - Acquisition + Conversion', 'Shelf Corp Services', '2026-03-14', 'Zelle', 'paid', 'Includes $2,799 shelf corp + $500 CA-to-WY conversion fee')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLIANCE CALENDAR
-- ============================================
INSERT INTO compliance_calendar (entity_id, event_type, due_date, status, recurring, frequency, notes, cost_estimate)
VALUES
  -- Estate Vision Mgmt LLC
  ('10000000-0000-0000-0000-000000000001', 'Registered Agent Renewal', '2027-01-26', 'current', TRUE, 'annual', 'Registered Agents Inc - NM', 49.00),
  ('10000000-0000-0000-0000-000000000001', 'NM Annual Report', '2027-01-26', 'current', TRUE, 'annual', 'File with NM Secretary of State', 0.00),
  ('10000000-0000-0000-0000-000000000001', 'Virtual Office Renewal', '2027-01-26', 'current', TRUE, 'annual', 'DaVinci Virtual Office - 500 Marquette Ave NW', NULL),
  ('10000000-0000-0000-0000-000000000001', 'Domain Renewal', '2027-01-26', 'current', TRUE, 'annual', 'estatevisionmgmt.com - Hostinger', 15.00),

  -- Derricks Transport
  ('10000000-0000-0000-0000-000000000002', 'Registered Agent Renewal', '2027-02-27', 'current', TRUE, 'annual', 'Registered Agents Inc - NM', 49.00),
  ('10000000-0000-0000-0000-000000000002', 'NM Annual Report', '2027-02-27', 'current', TRUE, 'annual', 'File with NM Secretary of State', 0.00),
  ('10000000-0000-0000-0000-000000000002', 'Virtual Office Renewal', '2027-02-27', 'current', TRUE, 'annual', 'DaVinci Virtual Office - 4801 Lang Ave NE', NULL),
  ('10000000-0000-0000-0000-000000000002', 'Domain Renewal', '2027-02-27', 'current', TRUE, 'annual', 'derricktransport.com - Hostinger', 15.00),

  -- Ventangari
  ('10000000-0000-0000-0000-000000000004', 'CA-WY Domestication Filing', '2026-04-15', 'upcoming', FALSE, NULL, 'Complete California to Wyoming domestication', 500.00),
  ('10000000-0000-0000-0000-000000000004', 'Back Tax Filing', '2026-04-15', 'upcoming', FALSE, NULL, 'File back taxes with CPA before April 15 deadline', NULL),
  ('10000000-0000-0000-0000-000000000004', 'WY Annual Report', '2027-04-01', 'current', TRUE, 'annual', 'After domestication completes', 52.00)
ON CONFLICT DO NOTHING;
