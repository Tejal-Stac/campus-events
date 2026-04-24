const pool = require('./config/db')

async function upgradeToHOD() {
  try {
    // Upgrade sandeep to HOD with Computer Engineering department
    const result = await pool.query(
      'UPDATE users SET role = $1, department = $2 WHERE email = $3 RETURNING email, role, department',
      ['hod', 'Computer Engineering', 'sandeep@vit.edu']
    )

    if (result.rows.length === 0) {
      console.log('❌ User not found: sandeep@vit.edu')
    } else {
      console.log('✅ Upgraded to HOD:', result.rows[0])
    }

    // Also show all HOD users now
    const hods = await pool.query(
      'SELECT id, email, role, department FROM users WHERE role = $1 ORDER BY department',
      ['hod']
    )
    console.log('\n📋 All HOD accounts:')
    hods.rows.forEach(h => {
      console.log(`  - ${h.email} | Dept: ${h.department}`)
    })

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

upgradeToHOD()