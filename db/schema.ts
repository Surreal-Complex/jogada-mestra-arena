import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', {
 code: text('code').primaryKey(),
 player1: text('player1').notNull(),
 player2: text('player2'),
 state: text('state').notNull(),
 version: integer('version').notNull().default(0),
 expires: integer('expires').notNull()
});


export const activities = sqliteTable('activities', {
 code: text('code').primaryKey(), title: text('title').notNull(), open: integer('open').notNull().default(1), created_at: integer('created_at').notNull()
});
export const roomMeta = sqliteTable('room_meta', {
 code: text('code').primaryKey(), activity_code: text('activity_code'), nickname1: text('nickname1').notNull(), nickname2: text('nickname2'), created_at: integer('created_at').notNull()
});
export const roomHistory = sqliteTable('room_history', {
 room_code: text('room_code').notNull(), version: integer('version').notNull(), state: text('state').notNull(), player: integer('player'), created_at: integer('created_at').notNull()
},table=>[primaryKey({columns:[table.room_code,table.version]})]);
export const submissions = sqliteTable('submissions', {
 room_code: text('room_code').notNull(), player: integer('player').notNull(), nickname: text('nickname').notNull(), reason: text('reason').notNull(), strategy: text('strategy').notNull(), submitted_at: integer('submitted_at').notNull()
},table=>[primaryKey({columns:[table.room_code,table.player]})]);
export const teacherAttempts = sqliteTable('teacher_attempts', {
 key: text('key').primaryKey(), failures: integer('failures').notNull().default(0), expires: integer('expires').notNull()
});
