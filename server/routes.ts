import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";





async function seedDatabase() {
  try {
    const users = await storage.getUsers();
    if (users.length === 0) {
      console.log("Seeding database...");
    
    // Seed Users
    const user1 = await storage.createUser({ name: "Sarah Miller", email: "sarah@example.com", role: "user", status: "active" });
    const user2 = await storage.createUser({ name: "John Doe", email: "john@example.com", role: "user", status: "active" });
    const user3 = await storage.createUser({ name: "TravelSL", email: "travel@example.com", role: "admin", status: "active" });
    const user4 = await storage.createUser({ name: "Mike Smith", email: "mike@example.com", role: "user", status: "disabled" });

    // Seed Places
    const place1 = await storage.createPlace({
      name: "Secret Beach Cove",
      description: "A hidden gem with pristine white sand and turquoise waters.",
      location: "Mirissa, South Coast",
      category: "Beach",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      rating: "4.8",
      status: "active",
      amenities: JSON.stringify(["Parking", "WiFi", "Restrooms"]),
      coordinates: JSON.stringify({ lat: 5.9485, lng: 80.5353 })
    });
    const place2 = await storage.createPlace({
      name: "Hidden Waterfall Trail",
      description: "A scenic hike leading to a breathtaking waterfall.",
      location: "Ella, Hill Country",
      category: "Nature",
      imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9",
      rating: "4.9",
      status: "active",
      amenities: JSON.stringify(["Guide Available", "Hiking"]),
      coordinates: JSON.stringify({ lat: 6.8667, lng: 81.0466 })
    });
    const place3 = await storage.createPlace({
      name: "Ancient Temple Ruins",
      description: "Historical ruins dating back to the 5th century.",
      location: "Anuradhapura",
      category: "Cultural",
      imageUrl: "https://images.unsplash.com/photo-1588596623667-27e163b96c9c",
      rating: "4.7",
      status: "active",
      amenities: JSON.stringify(["Guide Available"]),
      coordinates: JSON.stringify({ lat: 8.3114, lng: 80.4037 })
    });

    // Seed Playlists
    await storage.createPlaylist({
      name: "Southern Coast Adventure",
      description: "Explore the best beaches and coastal towns.",
      creatorId: user3.id,
      creatorName: user3.name,
      status: "approved",
      placesCount: 8,
      isFeatured: true,
      visibility: "public"
    });
    await storage.createPlaylist({
      name: "Hill Country Hikes",
      description: "Best hiking trails in Ella and Nuwara Eliya.",
      creatorId: user2.id,
      creatorName: user2.name,
      status: "pending",
      placesCount: 6,
      isFeatured: false,
      visibility: "public"
    });

    // Seed Trips (for stats)
    await storage.createTrip({ userId: user1.id, destination: "Sri Lanka", status: "completed" });
    await storage.createTrip({ userId: user2.id, destination: "Maldives", status: "planned" });
    await storage.createTrip({ userId: user1.id, destination: "Japan", status: "completed" });
    
    // Seed Reviews
    await storage.createReview({
      userId: user1.id,
      userName: user1.name,
      placeId: place1.id,
      placeName: place1.name,
      content: "Absolutely stunning place! Must visit.",
      rating: "5",
      status: "pending"
    });
    await storage.createReview({
      userId: user2.id,
      userName: user2.name,
      placeId: place2.id,
      placeName: place2.name,
      content: "A bit hard to find, but worth the hike.",
      rating: "4",
      status: "approved"
    });

    // Seed Photos
    await storage.createPhoto({
      uploaderId: user1.id,
      uploaderName: user1.name,
      url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21",
      caption: "Sunset at the beach",
      relatedType: "place",
      relatedId: place1.id,
      status: "pending"
    });
    
    console.log("Database seeded successfully!");
    }
  } catch (err) {
    console.warn('Database seeding failed (DB may be offline):', err instanceof Error ? err.message : String(err));
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication (BEFORE other routes)


  // Seed DB
  await seedDatabase();

  // Dashboard
  app.get(api.dashboard.stats.path, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });
  app.get(api.dashboard.activity.path, async (_req, res) => {
    const activity = await storage.getActivityStats();
    res.json(activity);
  });

  // Places
  app.get(api.places.list.path, async (_req, res) => {
    const places = await storage.getPlaces();
    res.json(places);
  });
  app.get(api.places.get.path, async (req, res) => {
    const place = await storage.getPlace(Number(req.params.id));
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  });
  app.post(api.places.create.path, async (req, res) => {
    try {
      const body = req.body;
      // Convert coordinates object to JSON string if needed
      if (body.coordinates && typeof body.coordinates === 'object') {
        body.coordinates = JSON.stringify(body.coordinates);
      }
      // Convert amenities array to JSON string if needed
      if (body.amenities && Array.isArray(body.amenities)) {
        body.amenities = JSON.stringify(body.amenities);
      }
      const input = api.places.create.input.parse(body);
      const place = await storage.createPlace(input);
      res.status(201).json(place);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.put(api.places.update.path, async (req, res) => {
    const updated = await storage.updatePlace(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ message: "Place not found" });
    res.json(updated);
  });
  app.delete(api.places.delete.path, async (req, res) => {
    await storage.deletePlace(Number(req.params.id));
    res.status(204).end();
  });

  // Playlists
  app.get(api.playlists.list.path, async (_req, res) => {
    const playlists = await storage.getPlaylists();
    res.json(playlists);
  });
  app.post(api.playlists.create.path, async (req, res) => {
    const input = api.playlists.create.input.parse(req.body);
    const playlist = await storage.createPlaylist(input);
    res.status(201).json(playlist);
  });
  app.patch(api.playlists.updateStatus.path, async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updatePlaylistStatus(Number(req.params.id), status);
    res.json(updated);
  });

  // Users
  app.get(api.users.list.path, async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });
  app.patch(api.users.updateStatus.path, async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updateUserStatus(Number(req.params.id), status);
    res.json(updated);
  });
  app.delete(api.users.delete.path, async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.status(204).end();
  });

  // Moderation
  app.get(api.moderation.reviews.list.path, async (_req, res) => {
    const reviews = await storage.getReviews();
    // Filter for pending by default if specified in real logic, but here return all for demo or filter in storage
    const pending = reviews.filter(r => r.status === 'pending');
    res.json(pending);
  });
  app.patch(api.moderation.reviews.action.path, async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updateReviewStatus(Number(req.params.id), status);
    res.json(updated);
  });

  app.get(api.moderation.photos.list.path, async (_req, res) => {
    const photos = await storage.getPhotos();
    const pending = photos.filter(p => p.status === 'pending');
    res.json(pending);
  });
  app.patch(api.moderation.photos.action.path, async (req, res) => {
    const { status } = req.body;
    const updated = await storage.updatePhotoStatus(Number(req.params.id), status);
    res.json(updated);
  });

  return httpServer;
}
