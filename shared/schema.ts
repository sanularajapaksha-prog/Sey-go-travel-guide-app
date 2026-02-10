import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user"), // 'admin' | 'user'
  status: text("status").default("active"), // 'active' | 'disabled'
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const places = pgTable("places", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  category: text("category"),
  imageUrl: text("image_url"),
  rating: numeric("rating").default("0"),
  status: text("status").default("active"), // 'active' | 'draft' | 'deleted'
  coordinates: text("coordinates"),
  amenities: text("amenities"),
  difficulty: text("difficulty"),
  bestTime: text("best_time"),
  entryFee: numeric("entry_fee"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").references(() => users.id),
  creatorName: text("creator_name"), // Denormalized for simpler list display
  status: text("status").default("active"), // Changed from 'pending' to 'active'
  placesCount: integer("places_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  visibility: text("visibility").default("public"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  destination: text("destination"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("planned"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name"),
  placeId: integer("place_id").references(() => places.id),
  placeName: text("place_name"),
  content: text("content"),
  rating: numeric("rating").default("0"),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  uploaderId: integer("uploader_id").references(() => users.id),
  uploaderName: text("uploader_name"),
  url: text("url").notNull(),
  caption: text("caption"),
  relatedType: text("related_type"), // 'place' | 'playlist'
  relatedId: integer("related_id"),
  status: text("status").default("active"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

// === OPTIONAL ADDITIONAL TABLES ===

export const playlistPlaces = pgTable("playlist_places", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").references(() => playlists.id),
  placeId: integer("place_id").references(() => places.id),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: integer("target_id"),
  moderatorId: integer("moderator_id").references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, joinedAt: true });
export const insertPlaceSchema = createInsertSchema(places).omit({ id: true, createdAt: true });
export const insertPlaylistSchema = createInsertSchema(playlists).omit({ id: true, createdAt: true });
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true, createdAt: true });
export const insertPlaylistPlaceSchema = createInsertSchema(playlistPlaces).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Place = typeof places.$inferSelect;
export type InsertPlace = z.infer<typeof insertPlaceSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type PlaylistPlace = typeof playlistPlaces.$inferSelect;
export type InsertPlaylistPlace = z.infer<typeof insertPlaylistPlaceSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// === API CONTRACT TYPES ===

export type StatsResponse = {
  totalTrips: number;
  totalPlaylists: number;
  totalPlaces: number;
  activeUsers: number;
  pendingReviews: number;
};

// Export auth models
export * from "./models/auth";
