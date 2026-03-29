import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreatePlace } from "@/hooks/use-places";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AMENITIES = [
  "Parking", "Restrooms", "Food Available", "Drinking Water",
  "Camping", "Guided Tours", "WiFi", "First Aid"
];

const BEST_TIMES = ["Early Morning", "Morning", "Afternoon", "Evening", "Sunset", "Night", "Anytime"];

const CATEGORIES = ["Beach", "Waterfall", "Cultural", "Nature", "Adventure", "Religious", "Historical", "Wildlife", "Mountain", "Other"];

const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Difficult", "Expert"];

interface FormData {
  name: string;
  location: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string;
  difficulty: string;
  entryFee: string;
  imageUrl: string;
}

export default function AddPlace() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreatePlace();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedBestTimes, setSelectedBestTimes] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      location: "",
      category: "",
      latitude: "",
      longitude: "",
      description: "",
      difficulty: "",
      entryFee: "",
      imageUrl: "",
    }
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleBestTime = (time: string) => {
    setSelectedBestTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const onSubmit = (data: FormData) => {
    const placeData = {
      name: data.name,
      description: data.description,
      location: data.location,
      category: data.category,
      imageUrl: data.imageUrl || undefined,
      status: "active" as const,
      rating: "0",
      coordinates: data.latitude && data.longitude
        ? JSON.stringify({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) })
        : undefined,
      amenities: JSON.stringify(selectedAmenities),
      difficulty: data.difficulty || undefined,
      bestTime: selectedBestTimes.join(", ") || undefined,
      entryFee: data.entryFee || undefined,
    };

    createMutation.mutate(placeData, {
      onSuccess: () => {
        toast({ title: "Place created successfully" });
        navigate("/places");
      },
      onError: (error: unknown) => {
        toast({
          title: "Failed to create place",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/places")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Add New Place</h1>
              <p className="text-sm text-muted-foreground">Add a hidden gem to the Seygo database</p>
            </div>
          </div>
          <Button onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Publishing..." : "Publish Place"}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Place Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Secret Beach Cove"
                    {...register("name", { required: "Place name is required" })}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mirissa, South Coast"
                    {...register("location", { required: "Location is required" })}
                  />
                  {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(val) => setValue("category", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">GPS Coordinates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" placeholder="e.g., 5.9485" {...register("latitude")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" placeholder="e.g., 80.5353" {...register("longitude")} />
                  </div>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  Use Google Maps to find exact coordinates
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Place Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what makes this place special, what visitors can expect..."
                    rows={5}
                    {...register("description", { required: "Description is required" })}
                  />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Visitor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Best Time to Visit</Label>
                  <div className="flex flex-wrap gap-2">
                    {BEST_TIMES.map(time => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedBestTimes.includes(time) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleBestTime(time)}
                        className="rounded-full"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select onValueChange={(val) => setValue("difficulty", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee</Label>
                  <Input id="entryFee" placeholder="e.g., Free or LKR 500" {...register("entryFee")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Amenities & Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="mb-3 block">Available Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(amenity => (
                    <Button
                      key={amenity}
                      type="button"
                      variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAmenity(amenity)}
                      className="rounded-full"
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
