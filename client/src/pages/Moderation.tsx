import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAllReviews,
  useApproveReview,
  useRejectReview,
  useDeleteReview,
  usePhotos,
  usePhotoAction,
} from "@/hooks/use-moderation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Star, ImageIcon, MessageSquare, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { Review } from "@shared/schema";

// ---------------------------------------------------------------------------
// Top-level page
// ---------------------------------------------------------------------------

export default function Moderation() {
  return (
    <Layout title="Moderation">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="mb-8 p-1 bg-white border border-border rounded-xl">
          <TabsTrigger
            value="reviews"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <ReviewsSection />
        </TabsContent>

        <TabsContent value="photos">
          <PhotosList />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

// ---------------------------------------------------------------------------
// Reviews section — three status sub-tabs
// ---------------------------------------------------------------------------

function ReviewsSection() {
  const { data: allReviews, isLoading, isError } = useAllReviews();

  const pending  = allReviews?.filter((r) => r.status === "pending")  ?? [];
  const approved = allReviews?.filter((r) => r.status === "approved") ?? [];
  const rejected = allReviews?.filter((r) => r.status === "rejected") ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading reviews…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load reviews. Please refresh.</span>
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="mb-6 p-1 bg-secondary/50 border border-border rounded-xl">
        <TabsTrigger
          value="pending"
          className="rounded-lg data-[state=active]:bg-yellow-500 data-[state=active]:text-white px-5 gap-2"
        >
          Pending
          {pending.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0">
              {pending.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="approved"
          className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white px-5 gap-2"
        >
          Approved
          {approved.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1.5 py-0">
              {approved.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="rejected"
          className="rounded-lg data-[state=active]:bg-red-600 data-[state=active]:text-white px-5 gap-2"
        >
          Rejected
          {rejected.length > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs px-1.5 py-0">
              {rejected.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <ReviewList
          reviews={pending}
          emptyMessage="No pending reviews — you're all caught up!"
        />
      </TabsContent>
      <TabsContent value="approved">
        <ReviewList
          reviews={approved}
          emptyMessage="No approved reviews yet."
        />
      </TabsContent>
      <TabsContent value="rejected">
        <ReviewList
          reviews={rejected}
          emptyMessage="No rejected reviews."
        />
      </TabsContent>
    </Tabs>
  );
}

// ---------------------------------------------------------------------------
// Review list
// ---------------------------------------------------------------------------

function ReviewList({
  reviews,
  emptyMessage,
}: {
  reviews: Review[];
  emptyMessage: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reject dialog
// ---------------------------------------------------------------------------

function RejectDialog({
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject review</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Reason <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="e.g. Inappropriate language, off-topic content…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Rejecting…</>
            ) : (
              <><X className="h-4 w-4 mr-2" /> Reject</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Review card
// ---------------------------------------------------------------------------

function ReviewCard({ review }: { review: Review }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const approve = useApproveReview();
  const reject  = useRejectReview();
  const remove  = useDeleteReview();

  const isBusy = approve.isPending || reject.isPending || remove.isPending;

  const handleApprove = () => {
    approve.mutate(
      { id: review.id, approvedBy: user?.email },
      {
        onSuccess: () => toast({ title: "Review approved", description: `"${review.placeName}" is now visible to the community.` }),
        onError:   () => toast({ title: "Failed to approve review", variant: "destructive" }),
      },
    );
  };

  const handleReject = (reason: string) => {
    reject.mutate(
      { id: review.id, reason: reason || undefined },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          toast({ title: "Review rejected" });
        },
        onError: () => toast({ title: "Failed to reject review", variant: "destructive" }),
      },
    );
  };

  const handleDelete = () => {
    remove.mutate(
      { id: review.id },
      {
        onSuccess: () => toast({ title: "Review deleted" }),
        onError:   () => toast({ title: "Failed to delete review", variant: "destructive" }),
      },
    );
  };

  return (
    <>
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{review.placeName || "Unknown place"}</h4>
                  <StatusBadge status={review.status ?? "pending"} />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : ""}
                </span>
              </div>

              {/* Rating + author */}
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Number(review.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  by {review.userName || "Anonymous"}
                </span>
              </div>

              {/* Optional title */}
              {review.title && (
                <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>
              )}

              {/* Body */}
              {review.content && (
                <p className="text-sm text-foreground/80 leading-relaxed bg-secondary/50 p-3 rounded-lg">
                  "{review.content}"
                </p>
              )}

              {/* Audit trail */}
              {review.status === "approved" && review.approvedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Approved by <span className="font-medium">{review.approvedBy ?? "admin"}</span>{" "}
                  on {format(new Date(review.approvedAt), "MMM d, yyyy")}
                </p>
              )}
              {review.status === "rejected" && review.rejectionReason && (
                <p className="text-xs text-muted-foreground mt-2">
                  Reason: <span className="font-medium">{review.rejectionReason}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4 border-l pl-4 border-border/50 shrink-0">
              {review.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={handleApprove}
                    disabled={isBusy}
                  >
                    {approve.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Check className="h-4 w-4 mr-1.5" /> Approve</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={isBusy}
                  >
                    <X className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </>
              )}

              {review.status === "approved" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={isBusy}
                  >
                    <X className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5 w-full"
                    onClick={handleDelete}
                    disabled={isBusy}
                  >
                    {remove.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Trash2 className="h-4 w-4 mr-1.5" /> Delete</>
                    )}
                  </Button>
                </>
              )}

              {review.status === "rejected" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={handleApprove}
                    disabled={isBusy}
                  >
                    {approve.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Check className="h-4 w-4 mr-1.5" /> Approve</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/5 w-full"
                    onClick={handleDelete}
                    disabled={isBusy}
                  >
                    {remove.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Trash2 className="h-4 w-4 mr-1.5" /> Delete</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleReject}
        isPending={reject.isPending}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
        Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-medium">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs font-medium">
      Pending
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Photos section (unchanged behaviour)
// ---------------------------------------------------------------------------

function PhotosList() {
  const { data: photos, isLoading } = usePhotos();
  const action = usePhotoAction();
  const { toast } = useToast();

  const handleAction = (id: number, status: "approved" | "rejected") => {
    action.mutate(
      { id, status },
      { onSuccess: () => toast({ title: `Photo ${status}` }) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading photos…</span>
      </div>
    );
  }

  if (!photos?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>No pending photos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden border-border shadow-md">
          <div className="aspect-video bg-gray-100 relative">
            <img
              src={photo.url}
              alt="User upload"
              className="w-full h-full object-cover"
            />
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
              onClick={() => handleAction(photo.id, "approved")}
              disabled={action.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleAction(photo.id, "rejected")}
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
