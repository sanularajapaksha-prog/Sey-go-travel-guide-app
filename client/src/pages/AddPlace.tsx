import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, AlertTriangle, MapPin, Link as LinkIcon } from "lucide-react";
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

const CATEGORIES = ["Beach", "Waterfall", "Cultural", "Nature", "Adventure", "Religious", "Historical", "Wildlife"];

const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Difficult", "Expert"];

interface FormData {
  name: string;
  locationArea: string;
  city: string;
  province: string;
  category: string;
  latitude: string;
  longitude: string;
  description: string;
  bestTime: string[];
  visitDuration: string;
  difficulty: string;
  entryFee: string;
  amenities: string[];
  howToReach: string;
  safetyNotes: string;
  imageUrl: string;
}

export default function AddPlace() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreatePlace();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedBestTimes, setSelectedBestTimes] = useState<string[]>([]);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      locationArea: "",
      city: "",
      province: "",
      category: "",
      latitude: "",
      longitude: "",
      description: "",
      visitDuration: "",
      difficulty: "",
      entryFee: "",
      howToReach: "",
      safetyNotes: "",
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
      location: `${data.locationArea}, ${data.city}`,
      category: data.category,
      imageUrl: data.imageUrl || undefined,
      status: "active" as const,
      rating: "0",
      coordinates: data.latitude && data.longitude 
        ? { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) }
        : undefined,
      amenities: selectedAmenities,
      difficulty: data.difficulty || undefined,
      bestTime: selectedBestTimes.join(", ") || undefined,
      entryFee: data.entryFee || undefined,
    };

    createMutation.mutate(placeData, {
      onSuccess: () => {
        toast({ title: "Place created successfully" });
        navigate("/places");
      },
      onError: () => {
        toast({ title: "Failed to create place", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/places")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Add New Place</h1>
              <p className="text-sm text-muted-foreground">Add a hidden gem to the Seygo database</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/places")} data-testid="button-save-draft">
              Save as Draft
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending} data-testid="button-publish">
              {createMutation.isPending ? "Publishing..." : "Publish Place"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    data-testid="input-place-name"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="locationArea">Location/Area *</Label>
                  <Input 
                    id="locationArea" 
                    placeholder="e.g., Near Mirissa Beach" 
                    {...register("locationArea", { required: "Location is required" })}
                    data-testid="input-location-area"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="e.g., Mirissa" {...register("city")} data-testid="input-city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Input id="province" {...register("province")} data-testid="input-province" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(val) => setValue("category", val)}>
                    <SelectTrigger data-testid="select-category">
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
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input id="latitude" placeholder="e.g., 5.9485" {...register("latitude")} data-testid="input-latitude" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input id="longitude" placeholder="e.g., 80.5353" {...register("longitude")} data-testid="input-longitude" />
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Place Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what makes this place special, what visitors can expect..." 
                    rows={5}
                    {...register("description", { required: "Description is required" })}
                    data-testid="textarea-description"
                  />
                  <p className="text-xs text-muted-foreground">0 characters</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Or paste image URL</Label>
                    <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} data-testid="input-image-url" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                        data-testid={`button-time-${time.toLowerCase().replace(' ', '-')}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitDuration">Average Visit Duration</Label>
                  <Input id="visitDuration" placeholder="e.g., 2-3 hours" {...register("visitDuration")} data-testid="input-duration" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select onValueChange={(val) => setValue("difficulty", val)}>
                    <SelectTrigger data-testid="select-difficulty">
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
                  <Input id="entryFee" placeholder="e.g., Free or LKR 500" {...register("entryFee")} data-testid="input-entry-fee" />
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
                      data-testid={`button-amenity-${amenity.toLowerCase().replace(' ', '-')}`}
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accessibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="howToReach">How to Reach</Label>
                  <Textarea 
                    id="howToReach" 
                    placeholder="Describe road conditions, vehicle requirements, walking distance..."
                    rows={3}
                    {...register("howToReach")}
                    data-testid="textarea-how-to-reach"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-100 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Safety Notes & Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="safetyNotes" className="text-red-700">Safety Information</Label>
                  <Textarea 
                    id="safetyNotes" 
                    placeholder="Include any safety warnings, weather considerations, physical requirements..."
                    rows={3}
                    {...register("safetyNotes")}
                    className="border-red-200 focus:border-red-300"
                    data-testid="textarea-safety-notes"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
