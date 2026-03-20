import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { usePlaces, useDeletePlace, useUpdatePlace } from "@/hooks/use-places";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, MapPin, MoreHorizontal, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Place } from "../../../server/shared/schema";

const PAGE_SIZE = 50;

const CATEGORIES = [
  "Beach", "Waterfall", "Cultural", "Nature", "Adventure",
  "Religious", "Historical", "Wildlife", "Mountain", "Other",
];

interface EditForm {
  name: string;
  location: string;
  category: string;
  image_url: string;
  description: string;
  status: string;
}

export default function Places() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editPlace, setEditPlace] = useState<Place | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "", location: "", category: "", image_url: "", description: "", status: "active",
  });

  const [, navigate] = useLocation();
  const { data: places, isLoading } = usePlaces();
  const { toast } = useToast();
  const deleteMutation = useDeletePlace();
  const updateMutation = useUpdatePlace();

  const filtered = (places ?? []).filter((p) =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openEdit = (place: Place) => {
    setEditPlace(place);
    setEditForm({
      name: place.name ?? "",
      location: place.location ?? "",
      category: place.category ?? "",
      image_url: place.imageUrl ?? "",
      description: place.description ?? "",
      status: place.status ?? "active",
    });
  };

  const handleSave = () => {
    if (!editPlace) return;
    updateMutation.mutate(
      {
        id: editPlace.id as number,
        data: {
          name: editForm.name,
          location: editForm.location,
          category: editForm.category,
          imageUrl: editForm.image_url,
          description: editForm.description,
          status: editForm.status,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Place updated" });
          setEditPlace(null);
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this place?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast({ title: "Place deleted" }),
        onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
      });
    }
  };

  return (
    <Layout
      title="Places"
      action={
        <Button
          className="rounded-full shadow-lg shadow-primary/25"
          onClick={() => navigate("/places/new")}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Place
        </Button>
      }
    >
      {/* Search + count */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="max-w-sm w-full">
          <Input
            placeholder="Search places..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-white border-none shadow-sm"
          />
        </div>
        {!isLoading && (
          <span className="text-sm text-muted-foreground shrink-0">
            {filtered.length.toLocaleString()} place{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-[320px]">Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading places…</TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No places found</TableCell>
              </TableRow>
            ) : (
              paginated.map((place) => (
                <TableRow key={String(place.id)} className="hover:bg-secondary/10">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {place.imageUrl ? (
                          <img
                            src={place.imageUrl}
                            alt={place.name ?? ""}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <MapPin className="h-5 w-5 m-3 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight">{place.name}</p>
                        {place.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{place.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{place.location ?? "—"}</TableCell>
                  <TableCell>
                    {place.category ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                        {place.category}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      place.status === "active"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {place.status ?? "active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(place)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(place.id as number)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">{currentPage} / {totalPages}</span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editPlace} onOpenChange={(open) => { if (!open) setEditPlace(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image preview */}
            {editForm.image_url && (
              <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 border">
                <img
                  src={editForm.image_url}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Place name"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Image URL</Label>
                <Input
                  value={editForm.image_url}
                  onChange={(e) => setEditForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g., Mirissa, South Coast"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(val) => setEditForm((f) => ({ ...f, category: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm((f) => ({ ...f, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe this place..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlace(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
