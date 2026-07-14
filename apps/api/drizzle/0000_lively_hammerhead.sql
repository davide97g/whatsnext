CREATE TYPE "public"."item_source" AS ENUM('manual', 'youtube');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('idea', 'planned', 'in_progress', 'scheduled', 'published', 'live', 'done');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('video', 'live');--> statement-breakpoint
CREATE TABLE "roadmap_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "item_type" DEFAULT 'video' NOT NULL,
	"status" "item_status" DEFAULT 'planned' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"youtube_video_id" text,
	"youtube_url" text,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"source" "item_source" DEFAULT 'manual' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_items_youtube_video_id_unique" UNIQUE("youtube_video_id")
);
--> statement-breakpoint
CREATE INDEX "roadmap_items_status_idx" ON "roadmap_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "roadmap_items_type_idx" ON "roadmap_items" USING btree ("type");--> statement-breakpoint
CREATE INDEX "roadmap_items_scheduled_at_idx" ON "roadmap_items" USING btree ("scheduled_at");