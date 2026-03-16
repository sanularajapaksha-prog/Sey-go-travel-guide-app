import { supabase } from "./supabase";
import { pool } from "./db";
import {
  type User,
  type InsertUser,
  type Place,
  type InsertPlace,
  type Playlist,
  type InsertPlaylist,
  type Trip,
  type InsertTrip,
  type Review,
  type InsertReview,
  type Photo,
  type InsertPhoto,
  type StatsResponse,
} from "./shared/schema";

const placesTableName = process.env.SUPABASE_PLACES_TABLE ?? "plcses";
const placePhotosBucket =
  process.env.SUPABASE_PLACE_PHOTOS_BUCKET ?? "place-photos";
const placePhotosArePrivate =
  process.env.SUPABASE_PLACE_PHOTOS_PRIVATE === "true";

type DbUserRow = {
  id: string | number;
  name: string;
  email: string;
  role: string | null;
  status: string | null;
  joined_at: string | Date | null;
};

type DbPlaceRow = {
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

type DbPlaylistRow = {
  id: string | number;
  name: string;
  description: string | null;
  creator_id: string | number | null;
  creator_name: string | null;
  status: string | null;
  places_count: number | null;
  is_featured: boolean | null;
  visibility: string | null;
  created_at: string | Date | null;
};

type DbTripRow = {
  id: string | number;
  user_id: string | number | null;
  destination: string | null;
  start_date: string | Date | null;
  end_date: string | Date | null;
  status: string | null;
  created_at: string | Date | null;
};

type DbReviewRow = {
  id: string | number;
  user_id: string | number | null;
  user_name: string | null;
  place_id: string | null;
  place_name: string | null;
  content: string | null;
  rating: string | number | null;
  status: string | null;
  created_at: string | Date | null;
};

type DbPhotoRow = {
  id: string | number;
  uploader_id: string | number | null;
  uploader_name: string | null;
  url: string;
  caption: string | null;
  related_type: string | null;
  related_id: string | null;
  status: string | null;
  created_at: string | Date | null;
};

function asNumber(value: string | number | null | undefined): number {
  return Number(value ?? 0);
}

function asDate(value: string | Date | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

function toPlaceId(value: string | number): string {
  return String(value);
}

function buildPlaceImageUrl(photoPaths: string[] | null): string | null {
  const firstPath = photoPaths?.[0];
  if (!firstPath || placePhotosArePrivate) return null;
  const { data } = supabase.storage.from(placePhotosBucket).getPublicUrl(firstPath);
  return data.publicUrl || null;
}

function mapUser(row: DbUserRow): User {
  return {
    id: asNumber(row.id),
    name: row.name,
    email: row.email,
    role: row.role ?? "user",
    status: row.status ?? "active",
    joinedAt: asDate(row.joined_at),
  };
}

function mapPlace(row: DbPlaceRow): Place {
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
    createdAt: asDate(row.created_at),
  };
}

function mapPlaylist(row: DbPlaylistRow): Playlist {
  return {
    id: asNumber(row.id),
    name: row.name,
    description: row.description,
    creatorId: row.creator_id == null ? null : asNumber(row.creator_id),
    creatorName: row.creator_name,
    status: row.status ?? "active",
    placesCount: row.places_count ?? 0,
    isFeatured: row.is_featured ?? false,
    visibility: row.visibility ?? "public",
    createdAt: asDate(row.created_at),
  };
}

function mapTrip(row: DbTripRow): Trip {
  return {
    id: asNumber(row.id),
    userId: row.user_id == null ? null : asNumber(row.user_id),
    destination: row.destination,
    startDate: asDate(row.start_date),
    endDate: asDate(row.end_date),
    status: row.status ?? "planned",
    createdAt: asDate(row.created_at),
  };
}

function mapReview(row: DbReviewRow): Review {
  return {
    id: asNumber(row.id),
    userId: row.user_id == null ? null : asNumber(row.user_id),
    userName: row.user_name,
    placeId: (row.place_id ?? "") as unknown as number,
    placeName: row.place_name,
    content: row.content,
    rating: row.rating == null ? "0" : String(row.rating),
    status: row.status ?? "pending",
    createdAt: asDate(row.created_at),
  };
}

function mapPhoto(row: DbPhotoRow): Photo {
  return {
    id: asNumber(row.id),
    uploaderId: row.uploader_id == null ? null : asNumber(row.uploader_id),
    uploaderName: row.uploader_name,
    url: row.url,
    caption: row.caption,
    relatedType: row.related_type,
    relatedId: (row.related_id ?? "") as unknown as number,
    status: row.status ?? "active",
    createdAt: asDate(row.created_at),
  };
}

export interface IStorage {
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getPlaces(): Promise<Place[]>;
  getPlace(id: string | number): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlace(id: string | number, place: Partial<InsertPlace>): Promise<Place>;
  deletePlace(id: string | number): Promise<void>;
  getPlaylists(): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylistStatus(id: number, status: string): Promise<Playlist>;
  getTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  getReviews(): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewStatus(id: number, status: string): Promise<Review>;
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhotoStatus(id: number, status: string): Promise<Photo>;
  getDashboardStats(): Promise<StatsResponse>;
  getActivityStats(): Promise<
    { date: string; trips: number; playlists: number; users: number }[]
  >;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    const result = await pool.query(
      `select id, name, email, role, status, joined_at
       from public.users
       order by joined_at desc nulls last, id desc`,
    );
    return result.rows.map((row) => mapUser(row as DbUserRow));
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await pool.query(
      `select id, name, email, role, status, joined_at
       from public.users
       where id = $1
       limit 1`,
      [id],
    );
    const row = result.rows[0] as DbUserRow | undefined;
    return row ? mapUser(row) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await pool.query(
      `insert into public.users (name, email, role, status)
       values ($1, $2, $3, $4)
       returning id, name, email, role, status, joined_at`,
      [user.name, user.email, user.role ?? "user", user.status ?? "active"],
    );
    return mapUser(result.rows[0] as DbUserRow);
  }

  async updateUserStatus(id: number, status: string): Promise<User> {
    const result = await pool.query(
      `update public.users
       set status = $2
       where id = $1
       returning id, name, email, role, status, joined_at`,
      [id, status],
    );
    return mapUser(result.rows[0] as DbUserRow);
  }

  async deleteUser(id: number): Promise<void> {
    await pool.query(`delete from public.users where id = $1`, [id]);
  }

  async getPlaces(): Promise<Place[]> {
    const result = await pool.query(
      `select place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status, created_at
       from public.${placesTableName}
       order by created_at desc nulls last, place_id asc`,
    );
    return result.rows.map((row) => mapPlace(row as DbPlaceRow));
  }

  async getPlace(id: string | number): Promise<Place | undefined> {
    const result = await pool.query(
      `select place_id, name, primary_category, categories, lat, lng, address, avg_rating, photo_storage_paths, status, created_at
       from public.${placesTableName}
       where place_id = $1
       limit 1`,
      [toPlaceId(id)],
    );
    const row = result.rows[0] as DbPlaceRow | undefined;
    return row ? mapPlace(row) : undefined;
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
    return mapPlace(result.rows[0] as DbPlaceRow);
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
    return mapPlace(result.rows[0] as DbPlaceRow);
  }

  async deletePlace(id: string | number): Promise<void> {
    await pool.query(`delete from public.${placesTableName} where place_id = $1`, [
      toPlaceId(id),
    ]);
  }

  async getPlaylists(): Promise<Playlist[]> {
    const result = await pool.query(
      `select id, name, description, creator_id, creator_name, status, places_count, is_featured, visibility, created_at
       from public.playlists
       order by created_at desc nulls last, id desc`,
    );
    return result.rows.map((row) => mapPlaylist(row as DbPlaylistRow));
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const result = await pool.query(
      `insert into public.playlists
       (name, description, creator_id, creator_name, status, places_count, is_featured, visibility)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id, name, description, creator_id, creator_name, status, places_count, is_featured, visibility, created_at`,
      [
        playlist.name,
        playlist.description ?? null,
        playlist.creatorId ?? null,
        playlist.creatorName ?? null,
        playlist.status ?? "active",
        playlist.placesCount ?? 0,
        playlist.isFeatured ?? false,
        playlist.visibility ?? "public",
      ],
    );
    return mapPlaylist(result.rows[0] as DbPlaylistRow);
  }

  async updatePlaylistStatus(id: number, status: string): Promise<Playlist> {
    const result = await pool.query(
      `update public.playlists
       set status = $2
       where id = $1
       returning id, name, description, creator_id, creator_name, status, places_count, is_featured, visibility, created_at`,
      [id, status],
    );
    return mapPlaylist(result.rows[0] as DbPlaylistRow);
  }

  async getTrips(): Promise<Trip[]> {
    const result = await pool.query(
      `select id, user_id, destination, start_date, end_date, status, created_at
       from public.trips
       order by created_at desc nulls last, id desc`,
    );
    return result.rows.map((row) => mapTrip(row as DbTripRow));
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const result = await pool.query(
      `insert into public.trips (user_id, destination, start_date, end_date, status)
       values ($1, $2, $3, $4, $5)
       returning id, user_id, destination, start_date, end_date, status, created_at`,
      [
        trip.userId ?? null,
        trip.destination ?? null,
        trip.startDate ?? null,
        trip.endDate ?? null,
        trip.status ?? "planned",
      ],
    );
    return mapTrip(result.rows[0] as DbTripRow);
  }

  async getReviews(): Promise<Review[]> {
    const result = await pool.query(
      `select id, user_id, user_name, place_id, place_name, content, rating, status, created_at
       from public.reviews
       order by created_at desc nulls last, id desc`,
    );
    return result.rows.map((row) => mapReview(row as DbReviewRow));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await pool.query(
      `insert into public.reviews
       (user_id, user_name, place_id, place_name, content, rating, status)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id, user_id, user_name, place_id, place_name, content, rating, status, created_at`,
      [
        review.userId ?? null,
        review.userName ?? null,
        review.placeId == null ? null : String(review.placeId),
        review.placeName ?? null,
        review.content ?? null,
        review.rating ?? "0",
        review.status ?? "pending",
      ],
    );
    return mapReview(result.rows[0] as DbReviewRow);
  }

  async updateReviewStatus(id: number, status: string): Promise<Review> {
    const result = await pool.query(
      `update public.reviews
       set status = $2
       where id = $1
       returning id, user_id, user_name, place_id, place_name, content, rating, status, created_at`,
      [id, status],
    );
    return mapReview(result.rows[0] as DbReviewRow);
  }

  async getPhotos(): Promise<Photo[]> {
    const result = await pool.query(
      `select id, uploader_id, uploader_name, url, caption, related_type, related_id, status, created_at
       from public.photos
       order by created_at desc nulls last, id desc`,
    );
    return result.rows.map((row) => mapPhoto(row as DbPhotoRow));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const result = await pool.query(
      `insert into public.photos
       (uploader_id, uploader_name, url, caption, related_type, related_id, status)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id, uploader_id, uploader_name, url, caption, related_type, related_id, status, created_at`,
      [
        photo.uploaderId ?? null,
        photo.uploaderName ?? null,
        photo.url,
        photo.caption ?? null,
        photo.relatedType ?? null,
        photo.relatedId == null ? null : String(photo.relatedId),
        photo.status ?? "active",
      ],
    );
    return mapPhoto(result.rows[0] as DbPhotoRow);
  }

  async updatePhotoStatus(id: number, status: string): Promise<Photo> {
    const result = await pool.query(
      `update public.photos
       set status = $2
       where id = $1
       returning id, uploader_id, uploader_name, url, caption, related_type, related_id, status, created_at`,
      [id, status],
    );
    return mapPhoto(result.rows[0] as DbPhotoRow);
  }

  async getDashboardStats(): Promise<StatsResponse> {
    const [allTrips, allPlaylists, allPlaces, allUsers, allReviews] =
      await Promise.all([
        this.getTrips(),
        this.getPlaylists(),
        this.getPlaces(),
        this.getUsers(),
        this.getReviews(),
      ]);

    return {
      totalTrips: allTrips.length,
      totalPlaylists: allPlaylists.length,
      totalPlaces: allPlaces.length,
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((user) => user.status === "active").length,
      pendingReviews: allReviews.filter((review) => review.status === "pending")
        .length,
    };
  }

  async getActivityStats(): Promise<
    { date: string; trips: number; playlists: number; users: number }[]
  > {
    const [allTrips, allPlaylists, allUsers] = await Promise.all([
      this.getTrips(),
      this.getPlaylists(),
      this.getUsers(),
    ]);

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      return { key };
    });

    const countByMonth = (
      items: Array<{ createdAt?: Date | null; joinedAt?: Date | null }>,
      field: "createdAt" | "joinedAt",
    ) => {
      const counts = new Map<string, number>();

      for (const item of items) {
        const value = item[field];
        if (!value) continue;
        const date = new Date(value);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0",
        )}`;
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
