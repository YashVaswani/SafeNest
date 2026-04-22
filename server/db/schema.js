const { mysqlTable, serial, varchar, timestamp } = require('drizzle-orm/mysql-core');

const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

module.exports = { users };
