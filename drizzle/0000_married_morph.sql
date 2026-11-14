CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`player1` text NOT NULL,
	`player2` text,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`expires` integer NOT NULL
);
