/**
 * Migration: add start_date, end_date, poster_url, is_closed to events table
 * Run once: node add_event_date_columns.js
 */
const pool = require('./config/db')

;(async () => {
  try {
    await pool.query(`
      ALTER TABLE public.events
        ADD COLUMN IF NOT EXISTS start_date  TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS end_date    TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS poster_url  TEXT,
        ADD COLUMN IF NOT EXISTS is_closed   BOOLEAN DEFAULT FALSE
    `)
    console.log('✅ Columns added: start_date, end_date, poster_url, is_closed')

    // Backfill: copy existing date → start_date for all rows
    const { rowCount } = await pool.query(`
      UPDATE public.events
        SET start_date = date::TIMESTAMPTZ
        WHERE start_date IS NULL AND date IS NOT NULL
    `)
    console.log(`✅ Backfilled start_date for ${rowCount} existing events`)

    const r = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'events'
        AND column_name IN ('start_date','end_date','poster_url','is_closed')
      ORDER BY column_name
    `)
    console.log('✅ Verified columns:', r.rows.map(x => x.column_name))
    process.exit(0)
  } catch (e) {
    console.error('❌ Migration failed:', e.message)
    process.exit(1)
  }
})()
