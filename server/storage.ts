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
  type Notification,
  type InsertNotification,
} from "./shared/schema";

const placesTableName = process.env.SUPABASE_PLACES_TABLE ?? "tourist_places";
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
  id: string;                         // UUID in actual Supabase DB
  user_id: string | null;             // UUID
  user_name: string | null;
  user_badge: string | null;
  place_id: string | null;
  place_name: string | null;
  title: string | null;
  review_text: string | null;         // actual column name (not 'content')
  rating: string | number | null;
  likes_count: number | null;
  comments_count: number | null;
  status: string | null;
  created_at: string | Date | null;
  updated_at: string | Date | null;
  approved_at: string | Date | null;
  approved_by: string | null;
  rejection_reason: string | null;
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

type DbNotificationRow = {
  id: string | number;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean | null;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTouristPlace(row: any): Place {
  // Resolve image: prefer direct image_url, fall back to photo_storage_paths bucket URL
  let imageUrl: string | null = row.image_url ?? null;
  if (!imageUrl && Array.isArray(row.photo_storage_paths) && row.photo_storage_paths.length > 0 && !placePhotosArePrivate) {
    const { data } = supabase.storage.from(placePhotosBucket).getPublicUrl(row.photo_storage_paths[0]);
    imageUrl = data.publicUrl || null;
  }

  const lat = row.lat ?? null;
  const lng = row.lng ?? null;

  return {
    id: row.id ?? row.place_id,
    name: row.name ?? "",
    description: row.description ?? null,
    location: row.location ?? row.address ?? null,
    category: row.category ?? row.primary_category ?? row.type ?? null,
    imageUrl,
    rating: row.rating ?? row.avg_rating ?? "0",
    status: row.status ?? "active",
    coordinates: lat != null && lng != null ? JSON.stringify({ lat, lng }) : (row.coordinates ?? null),
    amenities: Array.isArray(row.amenities) ? JSON.stringify(row.amenities) : (row.amenities ?? null),
    difficulty: row.difficulty ?? null,
    bestTime: row.best_time ?? null,
    entryFee: row.entry_fee ?? null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
  };
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
    // id and userId are UUIDs in the real DB; cast through unknown to satisfy
    // the Drizzle-derived Review type which expects number.
    id: row.id as unknown as number,
    userId: row.user_id as unknown as number | null,
    userName: row.user_name,
    placeId: (row.place_id ?? "") as unknown as number,
    placeName: row.place_name,
    title: row.title ?? null,
    content: row.review_text,          // actual DB column is review_text
    rating: row.rating == null ? "0" : String(row.rating),
    status: row.status ?? "pending",
    createdAt: asDate(row.created_at),
    updatedAt: asDate(row.updated_at),
    approvedAt: asDate(row.approved_at),
    approvedBy: row.approved_by ?? null,
    rejectionReason: row.rejection_reason ?? null,
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

function mapNotification(row: DbNotificationRow): Notification {
  return {
    id: asNumber(row.id),
    title: row.title,
    message: row.message,
    type: row.type ?? "info",
    isRead: row.is_read ?? false,
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
  deletePlaylist(id: number): Promise<void>;
  getTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  getReviews(status?: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewStatus(id: string | number, status: string): Promise<Review>;
  approveReview(id: string | number, approvedBy?: string): Promise<Review>;
  rejectReview(id: string | number, reason?: string): Promise<Review>;
  deleteReview(id: string | number): Promise<void>;
  getPhotos(status?: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhotoStatus(id: number, status: string): Promise<Photo>;
  getDashboardStats(): Promise<StatsResponse>;
  getActivityStats(): Promise<
    { date: string; trips: number; playlists: number; users: number }[]
  >;
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationsAsRead(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    // Fetch real authenticated users from Supabase Auth
    const { data: authData, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) throw error;

    // Fetch role/status from public.users keyed by email
    const dbResult = await pool.query(
      `select id, email, name, role, status, joined_at from public.users`,
    ).catch(() => ({ rows: [] as any[] }));
    const dbByEmail = new Map(
      (dbResult.rows as DbUserRow[]).map((r) => [r.email, r]),
    );

    return authData.users.map((authUser, index) => {
      const db = dbByEmail.get(authUser.email ?? "");
      return {
        id: db ? asNumber(db.id) : index + 1,
        name:
          db?.name ||
          (authUser.user_metadata?.name as string | undefined) ||
          authUser.email?.split("@")[0] ||
          "Unknown",
        email: authUser.email ?? "",
        role: (db?.role ?? (authUser.user_metadata?.role as string | undefined) ?? "user") as string,
        status: (db?.status ?? "active") as string,
        joinedAt: new Date(authUser.created_at),
      } as User;
    });
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
    const updated = mapUser(result.rows[0] as DbUserRow);

    // Also update the Supabase Auth account so the session is actually banned/unbanned.
    // Look up the auth UUID by email, then set ban_duration accordingly.
    try {
      const { data: authList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const authUser = authList?.users.find((u) => u.email === updated.email);
      if (authUser) {
        await supabase.auth.admin.updateUserById(authUser.id, {
          ban_duration: status === "disabled" ? "876600h" : "none", // 100 years or lift ban
        });
      }
    } catch {
      // Non-fatal: DB record is updated; log and continue
      console.warn(`[storage] Could not update Supabase Auth ban state for user ${id}`);
    }

    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    // Look up the user's email before deleting the DB row so we can find their auth UUID
    const row = await this.getUser(id);
    await pool.query(`delete from public.users where id = $1`, [id]);

    // Also delete the Supabase Auth account so they cannot log in at all
    if (row?.email) {
      try {
        const { data: authList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const authUser = authList?.users.find((u) => u.email === row.email);
        if (authUser) {
          await supabase.auth.admin.deleteUser(authUser.id);
        }
      } catch {
        console.warn(`[storage] Could not delete Supabase Auth account for user ${id}`);
      }
    }
  }

  async getPlaces(): Promise<Place[]> {
    const pageSize = 1000;
    let all: unknown[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from(placesTableName)
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return all.map(mapTouristPlace);
  }

  async getPlace(id: string | number): Promise<Place | undefined> {
    const { data, error } = await supabase
      .from(placesTableName)
      .select("*")
      .eq("id", String(id))
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapTouristPlace(data) : undefined;
  }

  async createPlace(place: InsertPlace): Promise<Place> {
    let coordinates: { lat?: number; lng?: number } | null = null;
    try { coordinates = place.coordinates ? JSON.parse(place.coordinates) : null; } catch { coordinates = null; }
    const { data, error } = await supabase
      .from(placesTableName)
      .insert({
        name: place.name,
        description: place.description ?? null,
        location: place.location ?? null,
        category: place.category ?? null,
        image_url: place.imageUrl ?? null,
        rating: place.rating ?? "0",
        status: place.status ?? "active",
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
        amenities: place.amenities ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapTouristPlace(data);
  }

  async updatePlace(id: string | number, updates: Partial<InsertPlace>): Promise<Place> {
    let coordinates: { lat?: number; lng?: number } | null = null;
    try { coordinates = updates.coordinates ? JSON.parse(updates.coordinates) : null; } catch { coordinates = null; }
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.location !== undefined) patch.location = updates.location;
    if (updates.category !== undefined) patch.category = updates.category;
    if ((updates as any).imageUrl !== undefined) patch.image_url = (updates as any).imageUrl;
    if (updates.rating !== undefined) patch.rating = updates.rating;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.amenities !== undefined) patch.amenities = updates.amenities;
    if (coordinates?.lat !== undefined) patch.lat = coordinates.lat;
    if (coordinates?.lng !== undefined) patch.lng = coordinates.lng;

    const { data, error } = await supabase
      .from(placesTableName)
      .update(patch)
      .eq("id", String(id))
      .select("*")
      .single();
    if (error) throw error;
    return mapTouristPlace(data);
  }

  async deletePlace(id: string | number): Promise<void> {
    const { error } = await supabase
      .from(placesTableName)
      .delete()
      .eq("id", String(id));
    if (error) throw error;
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

  async deletePlaylist(id: number): Promise<void> {
    await pool.query(`delete from public.playlists where id = $1`, [id]);
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

  private static readonly reviewCols = `
    id, user_id, user_name, user_badge, place_id, place_name, title, review_text,
    rating, likes_count, comments_count, status,
    created_at, updated_at, approved_at, approved_by, rejection_reason
  `;

  async getReviews(status?: string): Promise<Review[]> {
    const result = status
      ? await pool.query(
          `select ${DatabaseStorage.reviewCols} from public.reviews
           where status = $1
           order by created_at desc nulls last, id desc`,
          [status],
        )
      : await pool.query(
          `select ${DatabaseStorage.reviewCols} from public.reviews
           order by created_at desc nulls last, id desc`,
        );
    return result.rows.map((row) => mapReview(row as DbReviewRow));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await pool.query(
      `insert into public.reviews
       (user_id, user_name, place_id, place_name, title, review_text, rating, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning ${DatabaseStorage.reviewCols}`,
      [
        review.userId ?? null,
        review.userName ?? null,
        review.placeId == null ? null : String(review.placeId),
        review.placeName ?? null,
        (review as any).title ?? null,
        review.content ?? null,
        review.rating ?? "0",
        review.status ?? "pending",
      ],
    );
    return mapReview(result.rows[0] as DbReviewRow);
  }

  // All review update methods accept string (UUID) or number IDs.
  async updateReviewStatus(id: string | number, status: string): Promise<Review> {
    const result = await pool.query(
      `update public.reviews
       set status = $2, updated_at = now()
       where id = $1::text::uuid
       returning ${DatabaseStorage.reviewCols}`,
      [String(id), status],
    );
    return mapReview(result.rows[0] as DbReviewRow);
  }

  async approveReview(id: string | number, approvedBy: string = "admin"): Promise<Review> {
    const result = await pool.query(
      `update public.reviews
       set status = 'approved', approved_at = now(), approved_by = $2, updated_at = now()
       where id = $1::text::uuid
       returning ${DatabaseStorage.reviewCols}`,
      [String(id), approvedBy],
    );
    return mapReview(result.rows[0] as DbReviewRow);
  }

  async rejectReview(id: string | number, reason?: string): Promise<Review> {
    const result = await pool.query(
      `update public.reviews
       set status = 'rejected', rejection_reason = $2, updated_at = now()
       where id = $1::text::uuid
       returning ${DatabaseStorage.reviewCols}`,
      [String(id), reason ?? null],
    );
    return mapReview(result.rows[0] as DbReviewRow);
  }

  async deleteReview(id: string | number): Promise<void> {
    await pool.query(
      `delete from public.reviews where id = $1::text::uuid`,
      [String(id)],
    );
  }

  async getPhotos(status?: string): Promise<Photo[]> {
    const result = status
      ? await pool.query(
          `select id, uploader_id, uploader_name, url, caption, related_type, related_id, status, created_at
           from public.photos
           where status = $1
           order by created_at desc nulls last, id desc`,
          [status],
        )
      : await pool.query(
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
    // Use SQL aggregates instead of fetching all rows to JS and counting there
    const [tripsRes, playlistsRes, reviewsRes, usersRes] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM public.trips`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*)::int AS count FROM public.playlists`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`
        SELECT
          COUNT(*)::int                                          AS total,
          COUNT(*) FILTER (WHERE status = 'pending')::int       AS pending
        FROM public.reviews
      `).catch(() => ({ rows: [{ total: 0, pending: 0 }] })),
      pool.query(`
        SELECT
          COUNT(*)::int                                          AS total,
          COUNT(*) FILTER (WHERE status = 'active')::int        AS active
        FROM public.users
      `).catch(() => ({ rows: [{ total: 0, active: 0 }] })),
    ]);

    // Places still come from Supabase — use a COUNT query via the JS client
    let totalPlaces = 0;
    try {
      const { count } = await supabase
        .from(placesTableName)
        .select("*", { count: "exact", head: true });
      totalPlaces = count ?? 0;
    } catch {
      totalPlaces = 0;
    }

    return {
      totalTrips:     tripsRes.rows[0]?.count     ?? 0,
      totalPlaylists: playlistsRes.rows[0]?.count ?? 0,
      totalPlaces,
      totalUsers:     usersRes.rows[0]?.total     ?? 0,
      activeUsers:    usersRes.rows[0]?.active    ?? 0,
      pendingReviews: reviewsRes.rows[0]?.pending ?? 0,
    };
  }

  async getActivityStats(): Promise<
    { date: string; trips: number; playlists: number; users: number }[]
  > {
    const [allTrips, allPlaylists, allUsers] = await Promise.all([
      this.getTrips().catch(() => [] as Trip[]),
      this.getPlaylists().catch(() => [] as Playlist[]),
      this.getUsers().catch(() => [] as User[]),
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

  async getNotifications(): Promise<Notification[]> {
    const result = await pool.query(
      `select id, title, message, type, is_read, created_at
       from public.notifications
       order by created_at desc nulls last
       limit 50`,
    );
    return result.rows.map((row) => mapNotification(row as DbNotificationRow));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await pool.query(
      `insert into public.notifications
       (title, message, type, is_read)
       values ($1, $2, $3, false)
       returning id, title, message, type, is_read, created_at`,
      [notification.title, notification.message, notification.type ?? "info"],
    );
    return mapNotification(result.rows[0] as DbNotificationRow);
  }

  async markNotificationsAsRead(): Promise<void> {
    await pool.query(
      `update public.notifications set is_read = true where is_read = false`
    );
  }
}

export const storage = new DatabaseStorage();
