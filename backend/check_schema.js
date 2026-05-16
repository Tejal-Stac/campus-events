const pool = require('./config/db');
(async () => {
  try {
    const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='events'`);
    console.log('Events:', res.rows.map(r => r.column_name));
    const res2 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='registrations'`);
    console.log('Registrations:', res2.rows.map(r => r.column_name));
    process.exit(0);
  } catch(e) { console.error(e); process.exit(1); }
})();
