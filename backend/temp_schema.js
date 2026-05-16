const pool = require('./config/db');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='events'")
  .then(r => { console.log(r.rows.map(x => x.column_name)); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
