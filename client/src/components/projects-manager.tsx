import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Project, InsertProject } from "@shared/schema";

export function ProjectsManager() {
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Project created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProject> }) =>
      apiRequest(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Project updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    }
  });

  const handleSubmit = (formData: FormData) => {
    const data: InsertProject = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      thumbnail: formData.get("thumbnail") as string || null,
      youtubeUrl: formData.get("youtubeUrl") as string || null,
      category: formData.get("category") as string,
      clientName: formData.get("clientName") as string || null,
      industry: formData.get("industry") as string || null,
      results: formData.get("results") as string || null,
      isActive: formData.get("isActive") === "true",
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading projects...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProject(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingProject?.title}
                    placeholder="e.g., Lead Generation Automation for Fitness Coach"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingProject?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                      <SelectItem value="Email Automation">Email Automation</SelectItem>
                      <SelectItem value="CRM Integration">CRM Integration</SelectItem>
                      <SelectItem value="Marketing Funnel">Marketing Funnel</SelectItem>
                      <SelectItem value="Sales Automation">Sales Automation</SelectItem>
                      <SelectItem value="Customer Support">Customer Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingProject?.description}
                  placeholder="Detailed description of the project, what was implemented, and how it helped the client"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    defaultValue={editingProject?.clientName || ""}
                    placeholder="e.g., FitLife Coaching"
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select name="industry" defaultValue={editingProject?.industry || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coaching">Coaching</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  defaultValue={editingProject?.thumbnail || ""}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div>
                <Label htmlFor="youtubeUrl">YouTube Video URL</Label>
                <Input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  defaultValue={editingProject?.youtubeUrl || ""}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                />
              </div>

              <div>
                <Label htmlFor="results">Results Achieved</Label>
                <Textarea
                  id="results"
                  name="results"
                  defaultValue={editingProject?.results || ""}
                  placeholder="e.g., Increased leads by 300%, Saved 20 hours/week, Improved conversion rate by 45%"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    defaultValue={editingProject?.sortOrder || 0}
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    value="true"
                    defaultChecked={editingProject?.isActive ?? true}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active (visible on website)</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge variant={project.isActive ? "default" : "secondary"}>
                        {project.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{project.category}</Badge>
                      {project.industry && (
                        <Badge variant="outline">{project.industry}</Badge>
                      )}
                    </div>
                    
                    {project.clientName && (
                      <p className="text-sm text-gray-600 mb-1">Client: {project.clientName}</p>
                    )}
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{project.description}</p>
                    
                    {project.results && (
                      <p className="text-sm text-green-600 font-medium">Results: {project.results}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Sort: {project.sortOrder}</span>
                      {project.youtubeUrl && <span>🎥 Video</span>}
                      {project.thumbnail && <span>🖼️ Thumbnail</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProject(project);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this project?")) {
                          deleteMutation.mutate(project.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No projects found. Create your first project to showcase your work.
          </div>
        )}
      </CardContent>
    </Card>
  );
}