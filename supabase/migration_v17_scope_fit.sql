-- ============================================================
-- ScopeCheck v17: Scope Fit Assessment — gates + weighted signal
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add scope_fit_config column to investors table
-- Stores gate/preference settings and weight allocations as JSON
--
-- Structure:
-- {
--   "criteria": {
--     "stages":       { "mode": "gate" | "preference", "weight": 0 },
--     "sectors":      { "mode": "gate" | "preference", "weight": 0 },
--     "geographies":  { "mode": "gate" | "preference", "weight": 0 },
--     "ticket_size":  { "mode": "gate" | "preference", "weight": 0 },
--     "requires_lead":{ "mode": "gate" | "preference", "weight": 0 }
--   },
--   "custom_fields": {
--     "<field_id>": { "included": true, "weight": 0 }
--   }
-- }
--
-- Gates are pass/fail — fail one, out of scope.
-- Preferences contribute to the fit signal via weights (must sum to 100).

ALTER TABLE investors ADD COLUMN IF NOT EXISTS scope_fit_config jsonb DEFAULT '{
  "criteria": {
    "stages":        { "mode": "preference", "weight": 20 },
    "sectors":       { "mode": "preference", "weight": 20 },
    "geographies":   { "mode": "preference", "weight": 20 },
    "ticket_size":   { "mode": "preference", "weight": 20 },
    "requires_lead": { "mode": "preference", "weight": 20 }
  },
  "custom_fields": {}
}'::jsonb;
