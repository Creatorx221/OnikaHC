import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const researchPosts = sqliteTable(
  'research_posts',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    draftJson: text('draft_json').notNull(),
    publishedJson: text('published_json'),
    status: text('status').notNull().default('draft'),
    revision: integer('revision').notNull().default(1),
    publishedRevision: integer('published_revision'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    publishedAt: text('published_at'),
    updatedBy: text('updated_by').notNull(),
  },
  (t) => [index('idx_research_status_date').on(t.status, t.publishedAt)],
);
export const researchMaterials = sqliteTable(
  'research_materials',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => researchPosts.id),
    objectKey: text('object_key').notNull().unique(),
    name: text('name').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    createdAt: text('created_at').notNull(),
    uploadedBy: text('uploaded_by').notNull(),
  },
  (t) => [index('idx_materials_post').on(t.postId)],
);
export const editorRequests = sqliteTable('editor_requests', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  reviewedBy: text('reviewed_by'),
});
