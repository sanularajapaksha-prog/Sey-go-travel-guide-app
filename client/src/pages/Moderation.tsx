import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReviews, useReviewAction, usePhotos, usePhotoAction } from "@/hooks/use-moderation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Star, ImageIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Moderation() {
  return (
    <Layout title="Moderation">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="mb-8 p-1 bg-white border border-border rounded-xl">
          <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6">
            <MessageSquare className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="photos" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6">
            <ImageIcon className="w-4 h-4 mr-2" />
            Photos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews">
          <ReviewsList />
        </TabsContent>
        
        <TabsContent value="photos">
          <PhotosList />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function ReviewsList() {
  const { data: reviews, isLoading } = useReviews();
  const action = useReviewAction();
  const { toast } = useToast();

  const handleAction = (id: number, status: 'approved' | 'rejected') => {
    action.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Review ${status}` }),
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!reviews?.length) return <div className="text-center py-12 text-muted-foreground">No pending reviews</div>;

  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-border shadow-sm">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{review.placeName}</h4>
                <span className="text-xs text-muted-foreground">
                  {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : ''}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Number(review.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">by {review.userName}</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed bg-secondary/50 p-3 rounded-lg">
                "{review.content}"
              </p>
            </div>
            <div className="flex flex-col gap-2 ml-4 border-l pl-4 border-border/50">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white w-full"
                onClick={() => handleAction(review.id, 'approved')}
                disabled={action.isPending}
              >
                <Check className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                onClick={() => handleAction(review.id, 'rejected')}
                disabled={action.isPending}
              >
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PhotosList() {
  const { data: photos, isLoading } = usePhotos();
  const action = usePhotoAction();
  const { toast } = useToast();

  const handleAction = (id: number, status: 'approved' | 'rejected') => {
    action.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Photo ${status}` }),
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!photos?.length) return <div className="text-center py-12 text-muted-foreground">No pending photos</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden border-border shadow-md">
          <div className="aspect-video bg-gray-100 relative">
            <img src={photo.url} alt="User upload" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div className="text-white text-sm">
                <p className="font-medium">{photo.uploaderName}</p>
                <p className="text-xs opacity-80">{photo.caption || "No caption"}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4 flex gap-2">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleAction(photo.id, 'approved')}
              disabled={action.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={() => handleAction(photo.id, 'rejected')}
              disabled={action.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
