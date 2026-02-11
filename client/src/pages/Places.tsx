import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { usePlaces, useDeletePlace } from "@/hooks/use-places";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, MapPin, MoreHorizontal, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Places() {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { data: places, isLoading } = usePlaces(search);
  const { toast } = useToast();
  const deleteMutation = useDeletePlace();

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
          data-testid="button-add-place"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Place
        </Button>
      }
    >
      <div className="mb-6 max-w-sm">
        <Input 
          placeholder="Search places..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border-none shadow-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
            ) : places?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No places found</TableCell></TableRow>
            ) : (
              places?.map((place) => (
                <TableRow key={place.id} className="hover:bg-secondary/10">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {place.imageUrl ? (
                          <img src={place.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <MapPin className="h-5 w-5 m-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground">{place.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{place.location}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                      {place.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      place.status === 'active' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                      {place.status}
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(place.id)}
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
      </div>
    </Layout>
  );
}
