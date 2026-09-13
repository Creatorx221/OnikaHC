CREATE TABLE `editor_requests` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`reviewed_by` text
);
--> statement-breakpoint
CREATE TABLE `research_materials` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`object_key` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL,
	`uploaded_by` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `research_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `research_materials_object_key_unique` ON `research_materials` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_materials_post` ON `research_materials` (`post_id`);--> statement-breakpoint
CREATE TABLE `research_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_revision` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `research_posts_slug_unique` ON `research_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_research_status_date` ON `research_posts` (`status`,`published_at`);