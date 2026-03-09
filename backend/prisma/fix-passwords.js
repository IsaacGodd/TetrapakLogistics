require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Contraseñas visibles en Railway — se hashean con bcrypt
  const updates = [
    { email: 'admin@tetrapak.mx',    password: 'admin123'    },
    { email: 'empleado@tetrapak.mx', password: 'empleado123' },
    { email: 'juan@tetrapak.mx',     password: 'juan123'     },
    { email: 'maria@tetrapak.mx',    password: 'maria123'    },
  ]

  for (const { email, password } of updates) {
    const hash = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { email }, data: { password: hash } })
    console.log(`✅ ${email} → hash actualizado`)
  }
  console.log('\n🎉 Contraseñas corregidas.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
