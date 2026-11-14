import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', {
 code: text('code').primaryKey(),
 player1: text('player1').notNull(),
 player2: text('player2'),
 state: text('state').notNull(),
 version: integer('version').notNull().default(0),
 expires: integer('expires').notNull()
});
