import { supabase } from './supabase'
import { db } from './db'
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


export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Places
  getPlaces(): Promise<Place[]>;
  getPlace(id: number): Promise<Place | undefined>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlace(id: number, place: Partial<InsertPlace>): Promise<Place>;
  deletePlace(id: number): Promise<void>;

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
  getActivityStats(): Promise<{ date: string; trips: number; playlists: number }[]>;
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
    return await db.select().from(places).orderBy(desc(places.createdAt));
  }
  async getPlace(id: number): Promise<Place | undefined> {
    const [place] = await db.select().from(places).where(eq(places.id, id));
    return place;
  }
  async createPlace(place: InsertPlace): Promise<Place> {
    const [newPlace] = await db.insert(places).values(place).returning();
    return newPlace;
  }
  async updatePlace(id: number, updates: Partial<InsertPlace>): Promise<Place> {
    const [updated] = await db.update(places).set(updates).where(eq(places.id, id)).returning();
    return updated;
  }
  async deletePlace(id: number): Promise<void> {
    await db.delete(places).where(eq(places.id, id));
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
      activeUsers: allUsers.filter(u => u.status === 'active').length,
      pendingReviews: allReviews.filter(r => r.status === 'pending').length,
    };
  }

  async getActivityStats(): Promise<{ date: string; trips: number; playlists: number }[]> {
    // Mock activity data
    const dates = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
    return dates.map(date => ({
      date,
      trips: Math.floor(Math.random() * 50) + 10,
      playlists: Math.floor(Math.random() * 20) + 5,
    }));
  }
}

export const storage = new DatabaseStorage();
