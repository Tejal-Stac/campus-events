const pool = require('./config/db')

async function migrate() {
  try {
    console.log('Running migration...')

    // Step 1: Fix role constraint
    await pool.query(`ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check`)
    console.log('✅ Dropped old role constraint')

    await pool.query(`
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('student', 'faculty', 'hod', 'dean', 'coordinator', 'volunteer', 'admin'))
    `)
    console.log('✅ Added new role constraint with HOD')

    // Step 2: Check what columns exist in users table
    const cols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY column_name
    `)
    console.log('📋 Users columns:', cols.rows.map(r => r.column_name).join(', '))

    // Step 3: Check what columns exist in events table
    const ecols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'events' AND table_schema = 'public'
      ORDER BY column_name
    `)
    console.log('📋 Events columns:', ecols.rows.map(r => r.column_name).join(', '))

    // Step 4: Create indexes only if columns exist
    const userCols = cols.rows.map(r => r.column_name)
    const eventCols = ecols.rows.map(r => r.column_name)

    if (userCols.includes('department')) {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department)`)
      console.log('✅ Index on users.department created')
    } else {
      console.log('⚠️  users.department column not found - skipping index')
    }

    if (eventCols.includes('department')) {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_department ON public.events(department)`)
      console.log('✅ Index on events.department created')
    } else {
      console.log('⚠️  events.department column not found - skipping index')
    }

    console.log('✅ Migration completed!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  }
}

migrate()