const pool = require('./config/db')
const bcrypt = require('bcryptjs')

async function create() {
  const hods = [
    { email: 'hod.cs@vit.edu', dept: 'CS', firstName: 'HOD', lastName: 'CS' },
    { email: 'hod.mech@vit.edu', dept: 'Mechanical', firstName: 'HOD', lastName: 'Mechanical' },
    { email: 'hod.aiml@vit.edu', dept: 'AI ML', firstName: 'HOD', lastName: 'AIML' },
    { email: 'hod.civil@vit.edu', dept: 'Civil', firstName: 'HOD', lastName: 'Civil' },
    { email: 'hod.cse@vit.edu', dept: 'CSE', firstName: 'HOD', lastName: 'CSE' },
  ]

  const pass = await bcrypt.hash('hod123456', 10)

  for (const h of hods) {
    await pool.query(
      `INSERT INTO users 
        (first_name, last_name, email, password, role, department, college_type, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET role = $5, department = $6`,
      [h.firstName, h.lastName, h.email, pass, 'hod', h.dept, 'vitian', true]
    )
    console.log('✅ Created HOD:', h.email, '| Dept:', h.dept)
  }

  console.log('\n🎉 All HOD accounts ready!')
  console.log('Password for all: hod123456')
  process.exit(0)
}

create().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})