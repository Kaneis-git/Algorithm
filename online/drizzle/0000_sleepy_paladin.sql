CREATE TABLE `Favorite` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `favorite_user_url` ON `Favorite` (`user_id`,`url`);--> statement-breakpoint
CREATE TABLE `SearchCache` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`payload` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `key`)
);
--> statement-breakpoint
CREATE INDEX `cache_user_expiry` ON `SearchCache` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `SearchHistory` (
	`user_id` text NOT NULL,
	`query_key` text NOT NULL,
	`query` text NOT NULL,
	`searched_at` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user_id`, `query_key`)
);
