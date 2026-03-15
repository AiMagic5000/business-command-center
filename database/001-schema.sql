-- Business Command Center - Database Schema
-- Target: R740xd Supabase (Postgres 5433)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- TABLE: business_owners
-- ============================================
CREATE TABLE IF NOT EXISTS business_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  home_address TEXT,
  ssn_encrypted TEXT,
  dob_encrypted TEXT,
  pin_hash TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owners_clerk ON business_owners(clerk_id);
CREATE INDEX idx_owners_email ON business_owners(email);

-- ============================================
-- TABLE: entities
-- ============================================
CREATE TYPE entity_type AS ENUM ('llc', 'corp', 'trust', 'dba', 'shelf_corp', 'personal');
CREATE TYPE entity_status AS ENUM ('active', 'pending', 'dissolved', 'in_progress');

CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES business_owners(id) ON DELETE CASCADE,
  type entity_type NOT NULL,
  name TEXT NOT NULL,
  legal_name TEXT,
  jurisdiction TEXT,
  state TEXT,
  county TEXT,
  ein_encrypted TEXT,
  formation_date DATE,
  status entity_status DEFAULT 'active',
  industry TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entities_owner ON entities(owner_id);
CREATE INDEX idx_entities_type ON entities(type);

-- ============================================
-- TABLE: entity_addresses
-- ============================================
CREATE TYPE address_type AS ENUM ('virtual', 'ra', 'mailing', 'physical');

CREATE TABLE IF NOT EXISTS entity_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  type address_type NOT NULL,
  provider_name TEXT,
  street TEXT NOT NULL,
  suite TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  login_url TEXT,
  username TEXT,
  password_encrypted TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_entity ON entity_addresses(entity_id);

-- ============================================
-- TABLE: entity_credentials
-- ============================================
CREATE TYPE credential_category AS ENUM ('email', 'hosting', 'government', 'financial', 'registrar', 'other');

CREATE TABLE IF NOT EXISTS entity_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_url TEXT,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  notes TEXT,
  category credential_category DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credentials_entity ON entity_credentials(entity_id);

-- ============================================
-- TABLE: entity_documents
-- ============================================
CREATE TABLE IF NOT EXISTS entity_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_entity ON entity_documents(entity_id);

-- ============================================
-- TABLE: entity_contacts
-- ============================================
CREATE TABLE IF NOT EXISTS entity_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  organization TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_entity ON entity_contacts(entity_id);

-- ============================================
-- TABLE: relationships (graph edges)
-- ============================================
CREATE TYPE relationship_type AS ENUM (
  'owns', 'manages', 'trustee_of', 'beneficiary_of',
  'provides_service', 'subsidiary_of', 'dba_of', 'grantor_of'
);

CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship_type relationship_type NOT NULL,
  label TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rel_source ON relationships(source_id);
CREATE INDEX idx_rel_target ON relationships(target_id);

-- ============================================
-- TABLE: communications (email history)
-- ============================================
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES business_owners(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  from_addr TEXT NOT NULL,
  to_addr TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  date TIMESTAMPTZ,
  folder TEXT,
  source_account TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comms_owner ON communications(owner_id);
CREATE INDEX idx_comms_entity ON communications(entity_id);
CREATE INDEX idx_comms_date ON communications(date DESC);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue');

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES business_owners(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  invoice_number TEXT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  service_category TEXT,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  status payment_status DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_owner ON payments(owner_id);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);

-- ============================================
-- TABLE: compliance_calendar
-- ============================================
CREATE TYPE compliance_status AS ENUM ('current', 'upcoming', 'overdue', 'completed');

CREATE TABLE IF NOT EXISTS compliance_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  status compliance_status DEFAULT 'upcoming',
  recurring BOOLEAN DEFAULT FALSE,
  frequency TEXT,
  notes TEXT,
  cost_estimate DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_entity ON compliance_calendar(entity_id);
CREATE INDEX idx_compliance_date ON compliance_calendar(due_date);

-- ============================================
-- TABLE: graph_layouts
-- ============================================
CREATE TABLE IF NOT EXISTS graph_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES business_owners(id) ON DELETE CASCADE,
  layout_json JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_layout_owner ON graph_layouts(owner_id);

-- ============================================
-- TABLE: audit_log
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES business_owners(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_time ON audit_log(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE business_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (for API routes)
-- Anon key policies: owners see own data, admins see all

CREATE POLICY "owners_see_own" ON business_owners FOR SELECT
  USING (id = auth.uid() OR is_admin = TRUE);

CREATE POLICY "entities_owner_access" ON entities FOR ALL
  USING (owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE));

CREATE POLICY "addresses_via_entity" ON entity_addresses FOR ALL
  USING (entity_id IN (SELECT id FROM entities WHERE owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE)));

CREATE POLICY "credentials_via_entity" ON entity_credentials FOR ALL
  USING (entity_id IN (SELECT id FROM entities WHERE owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE)));

CREATE POLICY "documents_via_entity" ON entity_documents FOR ALL
  USING (entity_id IN (SELECT id FROM entities WHERE owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE)));

CREATE POLICY "contacts_via_entity" ON entity_contacts FOR ALL
  USING (entity_id IN (SELECT id FROM entities WHERE owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE)));

CREATE POLICY "comms_owner_access" ON communications FOR ALL
  USING (owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE));

CREATE POLICY "payments_owner_access" ON payments FOR ALL
  USING (owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE));

CREATE POLICY "compliance_via_entity" ON compliance_calendar FOR ALL
  USING (entity_id IN (SELECT id FROM entities WHERE owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE)));

CREATE POLICY "layout_owner_access" ON graph_layouts FOR ALL
  USING (owner_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE));

CREATE POLICY "audit_owner_access" ON audit_log FOR SELECT
  USING (user_id IN (SELECT id FROM business_owners WHERE clerk_id = auth.uid() OR is_admin = TRUE));

CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (TRUE);
