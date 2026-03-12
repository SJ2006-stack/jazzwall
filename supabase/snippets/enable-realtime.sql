-- ============================================================
-- Enable Supabase Realtime on the tables that the meeting page
-- subscribes to. Run this in the Supabase SQL Editor once.
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================

-- 1. Enable Realtime on the transcripts table (live transcript chunks)
ALTER PUBLICATION supabase_realtime ADD TABLE transcripts;

-- 2. Enable Realtime on the summaries table (AI summary + action items)
ALTER PUBLICATION supabase_realtime ADD TABLE summaries;

-- 3. Enable Realtime on the meetings table (status changes: active → completed)
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;

-- Verify — should list all three tables:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
