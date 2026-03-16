import { defineConfig } from '@prisma/cli'

export default defineConfig({
  migrations: {
    seed: 'node ./prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
