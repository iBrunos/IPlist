import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 10)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bip.com',
      password: hashedPassword,
      equipe: 'TI',
      role: 'super_admin',
    },
  })

  console.log('✅ Usuário admin criado!')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())