-- Function to call webhook when a new record is inserted
CREATE OR REPLACE FUNCTION public.call_ingest_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := TG_ARGV[0];
  webhook_secret TEXT := TG_ARGV[1];
  payload JSONB;
BEGIN
  -- Create the payload with the new record
  payload := jsonb_build_object(
    'record', row_to_json(NEW)::jsonb,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'event', TG_OP
  );

  -- Call the webhook using pg_net extension (requires enabling pg_net in Supabase)
  PERFORM net.http_post(
    webhook_url,
    payload,
    'application/json',
    ARRAY[
      ('Authorization', 'Bearer ' || webhook_secret)::net.http_header
    ]
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_report_created ON public.reports_lyd;

-- Create the trigger
-- Replace the placeholder URL with your actual deployed webhook URL
-- The webhook secret should match WEBHOOK_SECRET in your .env.local file
CREATE TRIGGER on_report_created
AFTER INSERT ON public.reports_lyd
FOR EACH ROW
EXECUTE FUNCTION public.call_ingest_webhook('https://YOUR_DEPLOYED_URL/api/ingest/webhook', current_setting('app.webhook_secret'));

-- Important: You need to enable the pg_net extension in Supabase to use this feature
-- Run this once: CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set the webhook secret in Supabase to match your environment variable
-- Run this once (replace with your actual secret from .env.local):
-- ALTER DATABASE postgres SET app.webhook_secret TO 'your-secure-webhook-secret'; 