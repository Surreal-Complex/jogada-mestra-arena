CREATE TABLE IF NOT EXISTS `activities` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`open` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `room_history` (
	`room_code` text NOT NULL,
	`version` integer NOT NULL,
	`state` text NOT NULL,
	`player` integer,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`room_code`, `version`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `room_meta` (
	`code` text PRIMARY KEY NOT NULL,
	`activity_code` text,
	`nickname1` text NOT NULL,
	`nickname2` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `submissions` (
	`room_code` text NOT NULL,
	`player` integer NOT NULL,
	`nickname` text NOT NULL,
	`reason` text NOT NULL,
	`strategy` text NOT NULL,
	`submitted_at` integer NOT NULL,
	PRIMARY KEY(`room_code`, `player`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `teacher_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`expires` integer NOT NULL
);

--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS arena_history_initial
AFTER INSERT ON room_meta
WHEN NEW.activity_code IS NOT NULL
BEGIN
 INSERT INTO room_history (room_code,version,state,player,created_at)
 SELECT code,version,state,NULL,NEW.created_at FROM rooms WHERE code=NEW.code;
END;
--> statement-breakpoint
CREATE TRIGGER IF NOT EXISTS arena_history_move
AFTER UPDATE OF state ON rooms
WHEN EXISTS (SELECT 1 FROM room_meta WHERE code=NEW.code AND activity_code IS NOT NULL)
BEGIN
 INSERT INTO room_history (room_code,version,state,player,created_at)
 VALUES (NEW.code,NEW.version,NEW.state,json_extract(NEW.state,'$.lastMove.player'),CAST(strftime('%s','now') AS INTEGER)*1000);
END;
