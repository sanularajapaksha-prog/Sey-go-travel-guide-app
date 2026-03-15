import { supabase } from './supabase'
import { db, pool } from './db'
import { eq, desc } from 'drizzle-orm'
import {
  users, places, playlists, trips, reviews, photos,
  type User, type InsertUser,
  type Place, type InsertPlace,
  type Playlist, type InsertPlaylist,
  type Trip, type InsertTrip,
  type Review, type InsertReview,
  type Photo, type InsertPhoto,
  type StatsResponse
} from "@shared/schema";

const placesTableName = process.env.SUPABASE_PLACES_TABLE ?? "places";
const placePhotosBucket = process.env.SUPABASE_PLACE_PHOTOS_BUCKET ?? "place-photos";
const placePhotosArePrivate = process.env.SUPABASE_PLACE_PHOTOS_PRIVATE === "true";

type ExternalPlaceRow = {
  place_id: string;
  name: string;
  primary_category: string | null;
  categories: unknown;
  lat: number | null;
  lng: number | null;
  address: string | null;
  avg_rating: string | number | null;
  photo_storage_paths: string[] | null;
  status: string | null;
  created_at: string | Date | null;
};

function toPlaceId(id: string | number): string {
  return String(id);
}

function buildPlaceImageUrl(photoPaths: string[] | null): string | null {
  const firstPath = photoPaths?.[0];
  if (!firstPath) return null;
  if (placePhotosArePrivate) return null;
  const { data } = supabase.storage.from(placePhotosBucket).getPublicUrl(firstPath);
  return data.publicUrl || null;
}

function mapExternalPlace(row: ExternalPlaceRow): Place {
  return {
    id: row.place_id as unknown as number,
    name: row.name,
    description: null,
    location: row.address,
    category: row.primary_category,
    imageUrl: buildPlaceImageUrl(row.photo_storage_paths),
    rating: row.avg_rating == null ? "0" : String(row.avg_rating),
    status: row.status ?? "active",
    coordinates:
      row.lat != null && row.lng != null
        ? JSON.stringify({ lat: row.lat, lng: row.lng })
        : null,
    amenities: Array.isArray(row.categories) ? JSON.stringify(row.categories) : null,
    difficulty: null,
    bestTime: null,
    entryFee: null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  };
}

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Places
  getPlaces(): Promise<Place[]>;
  getPlace(id: string | number): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlace(id: string | number, place: Partial<InsertPlace>): Promise<Place>;
  deletePlace(id: string | number): Promise<void>;

  // Playlists
  getPlaylists(): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylistStatus(id: number, status: string): Promise<Playlist>;

  // Trips (for stats)
  getTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;

  // Reviews
  getReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewStatus(id: number, status: string): Promise<Review>;

  // Photos
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhotoStatus(id: number, status: string): Promise<Photo>;

  // Dashboard Stats
  getDashboardStats(): Promise<StatsResponse>;
  getActivityStats(): Promise<{ date: string; trips: number; playlists: number; users: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.joinedAt));
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  async updateUserStatus(id: number, status: string): Promise<User> {
    const [updated] = await db.update(users).set({ status }).where(eq(users.id, id)).returning();
    return updated;
  }
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Places
  async getPlaces(): Promise<Place[]> {
    const result = await pool.query(
      `select place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status, created_at
       from public.${placesTableName}
       order by created_at desc nulls last, place_id asc`,
    );
    return result.rows.map((row) => mapExternalPlace(row as ExternalPlaceRow));
  }
  async getPlace(id: string | number): Promise<Place | undefined> {
    const result = await pool.query(
      `select place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status, created_at
       from public.${placesTableName}
       where place_id = $1
       limit 1`,
      [toPlaceId(id)],
    );
    const row = result.rows[0] as ExternalPlaceRow | undefined;
    return row ? mapExternalPlace(row) : undefined;
  }
  async createPlace(place: InsertPlace): Promise<Place> {
    const placeId = `PLC${Date.now()}`;
    const coordinates = place.coordinates ? JSON.parse(place.coordinates) : null;
    const categories = place.amenities ? JSON.parse(place.amenities) : [];
    const result = await pool.query(
      `insert into public.${placesTableName}
       (place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status)
       values ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb, $10)
       returning place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status, created_at`,
      [
        placeId,
        place.name,
        place.category ?? null,
        JSON.stringify(categories),
        coordinates?.lat ?? null,
        coordinates?.lng ?? null,
        place.location ?? null,
        place.rating ?? "0",
        JSON.stringify([]),
        place.status ?? "active",
      ],
    );
    return mapExternalPlace(result.rows[0] as ExternalPlaceRow);
  }
  async updatePlace(id: string | number, updates: Partial<InsertPlace>): Promise<Place> {
    const existing = await this.getPlace(id);
    if (!existing) {
      throw new Error("Place not found");
    }

    const coordinates = updates.coordinates
      ? JSON.parse(updates.coordinates)
      : existing.coordinates
        ? JSON.parse(existing.coordinates)
        : null;
    const categories = updates.amenities
      ? JSON.parse(updates.amenities)
      : existing.amenities
        ? JSON.parse(existing.amenities)
        : [];

    const result = await pool.query(
      `update public.${placesTableName}
       set name = $2,
           primary_category = $3,
           categories = $4::jsonb,
           lat = $5,
           lng = $6,
           address = $7,
           avg_rating = $8,
           status = $9
       where place_id = $1
       returning place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status, created_at`,
      [
        toPlaceId(id),
        updates.name ?? existing.name,
        updates.category ?? existing.category,
        JSON.stringify(categories),
        coordinates?.lat ?? null,
        coordinates?.lng ?? null,
        updates.location ?? existing.location,
        updates.rating ?? existing.rating,
        updates.status ?? existing.status,
      ],
    );
    return mapExternalPlace(result.rows[0] as ExternalPlaceRow);
  }
  async deletePlace(id: string | number): Promise<void> {
    await pool.query(`delete from public.${placesTableName} where place_id = $1`, [toPlaceId(id)]);
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    return await db.select().from(playlists).orderBy(desc(playlists.createdAt));
  }
  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }
  async updatePlaylistStatus(id: number, status: string): Promise<Playlist> {
    const [updated] = await db.update(playlists).set({ status }).where(eq(playlists.id, id)).returning();
    return updated;
  }

  // Trips
  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }
  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
  async updateReviewStatus(id: number, status: string): Promise<Review> {
    const [updated] = await db.update(reviews).set({ status }).where(eq(reviews.id, id)).returning();
    return updated;
  }

  // Photos
  async getPhotos(): Promise<Photo[]> {
    return await db.select().from(photos).orderBy(desc(photos.createdAt));
  }
  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }
  async updatePhotoStatus(id: number, status: string): Promise<Photo> {
    const [updated] = await db.update(photos).set({ status }).where(eq(photos.id, id)).returning();
    return updated;
  }

  // Stats
  async getDashboardStats(): Promise<StatsResponse> {
    // In a real app, use count() queries. For now, fetch all is fine for mock scale
    const allTrips = await this.getTrips();
    const allPlaylists = await this.getPlaylists();
    const allPlaces = await this.getPlaces();
    const allUsers = await this.getUsers();
    const allReviews = await this.getReviews();

    return {
      totalTrips: allTrips.length,
      totalPlaylists: allPlaylists.length,
      totalPlaces: allPlaces.length,
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === 'active').length,
      pendingReviews: allReviews.filter(r => r.status === 'pending').length,
    };
  }

  async getActivityStats(): Promise<{ date: string; trips: number; playlists: number; users: number }[]> {
    const [allTrips, allPlaylists, allUsers] = await Promise.all([
      this.getTrips(),
      this.getPlaylists(),
      this.getUsers(),
    ]);

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return { date, key };
    });

    const countByMonth = (items: Array<{ createdAt?: Date | null; joinedAt?: Date | null }>, field: "createdAt" | "joinedAt") => {
      const counts = new Map<string, number>();
      for (const item of items) {
        const value = item[field];
        if (!value) continue;
        const date = new Date(value);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return counts;
    };

    const tripCounts = countByMonth(allTrips, "createdAt");
    const playlistCounts = countByMonth(allPlaylists, "createdAt");
    const userCounts = countByMonth(allUsers, "joinedAt");

    let cumulativeUsers = 0;
    return months.map(({ key }) => {
      cumulativeUsers += userCounts.get(key) ?? 0;
      return {
        date: key,
        trips: tripCounts.get(key) ?? 0,
        playlists: playlistCounts.get(key) ?? 0,
        users: cumulativeUsers,
      };
    });
  }
}

export const storage = new DatabaseStorage();
