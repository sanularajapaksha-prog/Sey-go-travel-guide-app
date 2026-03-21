import { Layout } from "@/components/Layout";
import { useUsers, useUpdateUserStatus, useDeleteUser } from "@/hooks/use-users";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ban, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();

  const handleToggleStatus = (id: number, currentStatus: string | null) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => toast({ title: `User ${newStatus}` }),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this user permanently?")) {
      deleteUser.mutate(id, {
        onSuccess: () => toast({ title: "User deleted" }),
      });
    }
  };

  return (
    <Layout title="Users">
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
            ) : users?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">No users found</TableCell></TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-secondary rounded text-xs font-medium uppercase tracking-wide">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.joinedAt ? format(new Date(user.joinedAt), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1.5 text-sm ${user.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.status === 'active' ? 'Active' : 'Disabled'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={user.status === 'active' ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                      onClick={() => handleToggleStatus(user.id, user.status)}
                    >
                      {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
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
