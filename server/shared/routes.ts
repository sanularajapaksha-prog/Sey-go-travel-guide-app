import { z } from 'zod';
import { 
  insertUserSchema, users,
  insertPlaceSchema, places,
  insertPlaylistSchema, playlists,
  insertReviewSchema, reviews,
  insertPhotoSchema, photos,
  insertTripSchema, trips
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats',
      responses: {
        200: z.object({
          totalTrips: z.number(),
          totalPlaylists: z.number(),
          totalPlaces: z.number(),
          totalUsers: z.number(),
          activeUsers: z.number(),
          pendingReviews: z.number(),
        }),
      },
    },
    activity: {
      method: 'GET' as const,
      path: '/api/dashboard/activity',
      responses: {
        200: z.array(z.object({
          date: z.string(),
          trips: z.number(),
          playlists: z.number(),
          users: z.number(),
        })),
      },
    }
  },
  places: {
    list: {
      method: 'GET' as const,
      path: '/api/places',
      input: z.object({ search: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof places.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/places/:id',
      responses: {
        200: z.custom<typeof places.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/places',
      input: insertPlaceSchema,
      responses: {
        201: z.custom<typeof places.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/places/:id',
      input: insertPlaceSchema.partial(),
      responses: {
        200: z.custom<typeof places.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/places/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  playlists: {
    list: {
      method: 'GET' as const,
      path: '/api/playlists',
      input: z.object({ status: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof playlists.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/playlists',
      input: insertPlaylistSchema,
      responses: {
        201: z.custom<typeof playlists.$inferSelect>(),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/playlists/:id/status',
      input: z.object({ status: z.enum(['pending', 'approved', 'rejected']) }),
      responses: {
        200: z.custom<typeof playlists.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users',
      input: z.object({ search: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/users/:id/status',
      input: z.object({ status: z.enum(['active', 'disabled']) }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  reviews: {
    list: {
      method: 'GET' as const,
      path: '/api/reviews',
      input: z.object({ status: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
      },
    },
    action: {
      method: 'PATCH' as const,
      path: '/api/reviews/:id',
      input: z.object({ status: z.enum(['approved', 'rejected']) }),
      responses: {
        200: z.custom<typeof reviews.$inferSelect>(),
      },
    },
  },
  photos: {
    list: {
      method: 'GET' as const,
      path: '/api/photos',
      input: z.object({ status: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof photos.$inferSelect>()),
      },
    },
    action: {
      method: 'PATCH' as const,
      path: '/api/photos/:id',
      input: z.object({ status: z.enum(['approved', 'rejected']) }),
      responses: {
        200: z.custom<typeof photos.$inferSelect>(),
      },
    },
  },
  moderation: {
    reviews: {
      list: {
        method: 'GET' as const,
        path: '/api/moderation/reviews',
        input: z.object({ status: z.string().optional() }).optional(),
        responses: {
          200: z.array(z.custom<typeof reviews.$inferSelect>()),
        },
      },
      action: {
        method: 'PATCH' as const,
        path: '/api/moderation/reviews/:id',
        input: z.object({ status: z.enum(['approved', 'rejected']) }),
        responses: {
          200: z.custom<typeof reviews.$inferSelect>(),
        },
      },
    },
    photos: {
      list: {
        method: 'GET' as const,
        path: '/api/moderation/photos',
        input: z.object({ status: z.string().optional() }).optional(),
        responses: {
          200: z.array(z.custom<typeof photos.$inferSelect>()),
        },
      },
      action: {
        method: 'PATCH' as const,
        path: '/api/moderation/photos/:id',
        input: z.object({ status: z.enum(['approved', 'rejected']) }),
        responses: {
          200: z.custom<typeof photos.$inferSelect>(),
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
