import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios";

// Modal & Tabs
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/admin-login', { email, password });

      if (response.data.success) {
        localStorage.setItem("isAuthenticated", "true");
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Login failed.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Shoe Admin</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>

          {/* Add Admin Button */}
          <Button variant="outline" onClick={() => setShowModal(true)} className="mt-2">
            Add Admin
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AdminModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Login;


// ====================== ADMIN MODAL COMPONENT ======================

const AdminModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const fetchAdmins = async () => {
    try {
      const res = await axiosInstance.get("/all-admins");
      
      setAdmins(res.data.admin || []);
    } catch {
      toast({ title: "Error", description: "Unable to fetch admins", variant: "destructive" });
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/add-admin", { name, email: adminEmail, password: pwd });
      toast({ title: "Admin Added Successfully" });
      fetchAdmins();
      setName("");
      setAdminEmail("");
      setPwd("");
    } catch {
      toast({ title: "Error", description: "Failed to add admin", variant: "destructive" });
    }
  };

  const deleteAdmin = async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/delete-admin/${id}`);

      if(response.data.success){
        
        toast({ title: "Admin Deleted" });
      }
      else{
        toast({ title: "Delete error" });
        
      }

      fetchAdmins();
    } catch {
      toast({ title: "Error", description: "Failed to delete admin", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (open) fetchAdmins();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Admins</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="add">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="add">Add Admin</TabsTrigger>
            <TabsTrigger value="view">View Admins</TabsTrigger>
          </TabsList>

          {/* Add Admin Form */}
          <TabsContent value="add" className="space-y-4 mt-4">
            <form onSubmit={handleAddAdmin} className="space-y-3">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              <Input placeholder="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
              <Button className="w-full" type="submit">Add Admin</Button>
            </form>
          </TabsContent>

          {/* View Admins */}
          <TabsContent value="view" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => deleteAdmin(admin._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
