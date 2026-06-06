DROP POLICY IF EXISTS "Public insert nps_responses" ON nps_responses;
DROP POLICY IF EXISTS "allow_insert_nps" ON nps_responses;
DROP POLICY IF EXISTS "allow_select_nps" ON nps_responses;

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_nps" ON nps_responses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_select_nps" ON nps_responses FOR SELECT TO service_role USING (true);