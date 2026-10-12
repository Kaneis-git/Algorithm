import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const searchHistory = sqliteTable("SearchHistory", {
  userId: text("user_id").notNull(), queryKey: text("query_key").notNull(), query: text("query").notNull(), searchedAt: integer("searched_at").notNull(), count: integer("count").notNull().default(1),
}, (table) => [primaryKey({ columns: [table.userId, table.queryKey] })]);
export const favorites = sqliteTable("Favorite", {
  userId: text("user_id").notNull(), id: text("id").notNull(), url: text("url").notNull(), type: text("type").notNull(), payload: text("payload").notNull(), createdAt: integer("created_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.id] }), uniqueIndex("favorite_user_url").on(table.userId, table.url)]);
export const searchCache = sqliteTable("SearchCache", {
  userId: text("user_id").notNull(), key: text("key").notNull(), payload: text("payload").notNull(), expiresAt: integer("expires_at").notNull(), createdAt: integer("created_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.key] }), index("cache_user_expiry").on(table.userId, table.expiresAt)]);
