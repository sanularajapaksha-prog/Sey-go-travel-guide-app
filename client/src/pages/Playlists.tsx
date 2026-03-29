import { Layout } from "@/components/Layout";
import { usePlaylists, useCreatePlaylist, useUpdatePlaylistStatus, useDeletePlaylist } from "@/hooks/use-playlists";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Plus, Music, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlaylistSchema, type InsertPlaylist } from "../../../server/shared/schema";

export default function Playlists() {
  const { data: playlists, isLoading } = usePlaylists();
  const updateStatus = useUpdatePlaylistStatus();
  const deletePlaylist = useDeletePlaylist();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: 'approved' | 'rejected') => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: `Playlist ${status}` }),
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    deletePlaylist.mutate(id, {
      onSuccess: () => toast({ title: "Playlist deleted" }),
      onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
    });
  };

  return (
    <Layout 
      title="Playlists"
      action={<CreatePlaylistDialog />}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>Playlist Name</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Places</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
            ) : playlists?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No playlists found</TableCell></TableRow>
            ) : (
              playlists?.map((playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-violet-100 text-violet-600 flex items-center justify-center">
                        <Music className="h-4 w-4" />
                      </div>
                      {playlist.name}
                    </div>
                  </TableCell>
                  <TableCell>{playlist.creatorName || 'Admin'}</TableCell>
                  <TableCell>{playlist.placesCount} places</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                      playlist.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                      playlist.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                      {playlist.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {playlist.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => handleStatusChange(playlist.id, 'approved')}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleStatusChange(playlist.id, 'rejected')}
                          disabled={updateStatus.isPending}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(playlist.id, playlist.name)}
                      disabled={deletePlaylist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}

function CreatePlaylistDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreatePlaylist();
  
  const form = useForm<InsertPlaylist>({
    resolver: zodResolver(insertPlaylistSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "approved",
      visibility: "public",
      isFeatured: false,
    }
  });

  const onSubmit = (data: InsertPlaylist) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Playlist created" });
        setOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "Failed to create", variant: "destructive" })
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" /> Create Playlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
