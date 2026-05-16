const pool = require('./config/db');

(async () => {
  try {
    await pool.query(`
      ALTER TABLE public.events
        ADD COLUMN IF NOT EXISTS club_name TEXT,
        ADD COLUMN IF NOT EXISTS audience_type TEXT DEFAULT 'All'
    `);
    console.log('✅ Columns added: club_name, audience_type');

    const r = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'events'
        AND column_name IN ('club_name', 'audience_type')
    `);
    console.log('✅ Verified columns:', r.rows.map(x => x.column_name));
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  }
})();
