CREATE TABLE `website_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`uploaded_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `website_assets_object_key_unique` ON `website_assets` (`object_key`);--> statement-breakpoint
CREATE TABLE `website_content` (
	`key` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_revision` integer,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `research_materials` ADD `archived` integer DEFAULT 0 NOT NULL;