import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, Edit, Trash2, Plus, Key, FileText, Upload, Database, Bot, UserPlus } from "lucide-react";
import type { Prompt, ApiKey, InsertPrompt, InsertApiKey, TrainingFile, TrainingContext, Project, InsertProject } from "@shared/schema";
import { ChatbotModeConfig } from "@/components/admin/ChatbotModeConfig";
import { LeadGenFieldsConfig } from "@/components/admin/LeadGenFieldsConfig";
import { SessionsManager } from "@/components/admin/SessionsManager";
import { ProjectsManager } from "@/components/projects-manager";

export default function AdminPage() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Simple password check for admin access
  useEffect(() => {
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    // Simple password check - in production, use proper authentication
    if (password === "sellspark2024") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
      toast({
        title: "Success",
        description: "Logged in to admin panel",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-[400px]">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter admin password"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">Manage prompts and API keys for the SellSpark consultation tool</p>
        </div>

        <Tabs defaultValue="prompts" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="prompts" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <FileText className="h-4 w-4" />
              <span className="text-sm sm:text-base">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Key className="h-4 w-4" />
              <span className="text-sm sm:text-base">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Database className="h-4 w-4" />
              <span className="text-sm sm:text-base">Training Data</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot-mode" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Bot className="h-4 w-4" />
              <span className="text-sm sm:text-base">ChatBot Mode</span>
            </TabsTrigger>
            <TabsTrigger value="lead-fields" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm sm:text-base">Lead Fields</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Database className="h-4 w-4" />
              <span className="text-sm sm:text-base">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <FileText className="h-4 w-4" />
              <span className="text-sm sm:text-base">Projects</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompts">
            <PromptsManager />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysManager />
          </TabsContent>
          
          <TabsContent value="training">
            <TrainingDataManager />
          </TabsContent>
          
          <TabsContent value="chatbot-mode">
            <ChatbotModeConfig />
          </TabsContent>
          
          <TabsContent value="lead-fields">
            <LeadGenFieldsConfig />
          </TabsContent>
          
          <TabsContent value="sessions">
            <SessionsManager />
          </TabsContent>
          
          <TabsContent value="projects">
            <ProjectsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PromptsManager() {
  const { toast } = useToast();
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: prompts = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ["/api/admin/prompts"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPrompt) => apiRequest("/api/admin/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      setIsDialogOpen(false);
      setEditingPrompt(null);
      toast({
        title: "Success",
        description: "Prompt created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPrompt> }) =>
      apiRequest(`/api/admin/prompts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      setIsDialogOpen(false);
      setEditingPrompt(null);
      toast({
        title: "Success",
        description: "Prompt updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/prompts/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompts"] });
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (formData: FormData) => {
    const data = {
      key: formData.get("key") as string,
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      content: formData.get("content") as string,
      description: formData.get("description") as string || null,
      isActive: formData.get("isActive") === "true",
    };

    if (editingPrompt) {
      updateMutation.mutate({ id: editingPrompt.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const categoryColors = {
    gemini: "bg-blue-100 text-blue-800",
    perplexity: "bg-purple-100 text-purple-800",
    system: "bg-gray-100 text-gray-800",
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading prompts...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prompt Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPrompt(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="key">Prompt Key</Label>
                <Input
                  id="key"
                  name="key"
                  defaultValue={editingPrompt?.key}
                  placeholder="e.g., consultation_system"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPrompt?.name}
                  placeholder="e.g., Consultation System Prompt"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingPrompt?.category || "system"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="perplexity">Perplexity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingPrompt?.description || ""}
                  placeholder="Brief description of this prompt"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Prompt Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingPrompt?.content}
                  placeholder="Enter the prompt content..."
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  value="true"
                  defaultChecked={editingPrompt?.isActive ?? true}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPrompt ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No prompts found. Create your first prompt to get started.
            </div>
          ) : (
            prompts.map((prompt) => (
              <div key={prompt.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{prompt.name}</h3>
                      <Badge className={categoryColors[prompt.category as keyof typeof categoryColors] || "bg-gray-100"}>
                        {prompt.category}
                      </Badge>
                      {!prompt.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Key: {prompt.key}</p>
                    {prompt.description && (
                      <p className="text-sm text-gray-500">{prompt.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPrompt(prompt);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this prompt?")) {
                          deleteMutation.mutate(prompt.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{prompt.content.substring(0, 200)}...</pre>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeysManager() {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/admin/api-keys"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertApiKey) => apiRequest("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      setIsDialogOpen(false);
      setEditingKey(null);
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertApiKey> }) =>
      apiRequest(`/api/admin/api-keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      setIsDialogOpen(false);
      setEditingKey(null);
      toast({
        title: "Success",
        description: "API key updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/api-keys/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      service: formData.get("service") as string,
      value: formData.get("value") as string,
      description: formData.get("description") as string || null,
      isActive: formData.get("isActive") === "true",
    };

    if (editingKey) {
      updateMutation.mutate({ id: editingKey.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const serviceColors = {
    gemini: "bg-blue-100 text-blue-800",
    perplexity: "bg-purple-100 text-purple-800",
    brightdata: "bg-green-100 text-green-800",
    pinecone: "bg-orange-100 text-orange-800",
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading API keys...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Key Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingKey(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Edit API Key" : "Create New API Key"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingKey?.name}
                  placeholder="e.g., GEMINI_API_KEY"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={editingKey?.displayName}
                  placeholder="e.g., Gemini API Key"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="service">Service</Label>
                <Select name="service" defaultValue={editingKey?.service || "gemini"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="perplexity">Perplexity</SelectItem>
                    <SelectItem value="brightdata">BrightData</SelectItem>
                    <SelectItem value="pinecone">Pinecone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingKey?.description || ""}
                  placeholder="Brief description of this API key"
                />
              </div>
              
              <div>
                <Label htmlFor="value">API Key Value</Label>
                <Input
                  id="value"
                  name="value"
                  type="password"
                  placeholder={editingKey ? "Enter new value to change" : "Enter API key value"}
                  required={!editingKey}
                />
                {editingKey && (
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep current value</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  value="true"
                  defaultChecked={editingKey?.isActive ?? true}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingKey ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No API keys found. Add your first API key to get started.
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{apiKey.displayName}</h3>
                      <Badge className={serviceColors[apiKey.service as keyof typeof serviceColors] || "bg-gray-100"}>
                        {apiKey.service}
                      </Badge>
                      {!apiKey.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Key: {apiKey.name}</p>
                    {apiKey.description && (
                      <p className="text-sm text-gray-500">{apiKey.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Value:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded">{apiKey.value}</code>
                    </div>
                    {apiKey.lastUsed && (
                      <p className="text-xs text-gray-400">
                        Last used: {new Date(apiKey.lastUsed).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingKey(apiKey);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this API key?")) {
                          deleteMutation.mutate(apiKey.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {apiKeys.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Security Notice</p>
                <p>API keys are masked for security. Store them securely and never share them publicly.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Training Data Manager Component
function TrainingDataManager() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTrainingFile, setSelectedTrainingFile] = useState<TrainingFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Query training files
  const { data: trainingFiles = [], isLoading: filesLoading } = useQuery<TrainingFile[]>({
    queryKey: ["/api/training/files"],
  });
  
  // Query training contexts
  const { data: contexts = [], isLoading: contextsLoading } = useQuery<TrainingContext[]>({
    queryKey: ["/api/training/contexts", selectedTrainingFile?.id],
    queryFn: selectedTrainingFile 
      ? async () => {
          const response = await apiRequest(`/api/training/contexts?fileId=${selectedTrainingFile.id}`);
          return response.json();
        }
      : undefined,
    enabled: !!selectedTrainingFile,
  });
  
  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/training/files/upload", {
        method: "POST",
        headers: {
          "x-user-id": "1", // Admin user
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/files"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });
  
  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/training/files/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/files"] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      setSelectedTrainingFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });
  
  // Delete context mutation
  const deleteContextMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/training/contexts/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/contexts"] });
      toast({
        title: "Success",
        description: "Context deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete context",
        variant: "destructive",
      });
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Files Section */}
      <Card>
        <CardHeader>
          <CardTitle>Training Files</CardTitle>
        </CardHeader>
        <CardContent>
          {/* File Upload */}
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="file-upload">Upload Training File</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>
          
          {/* Files List */}
          <div className="space-y-2">
            {filesLoading ? (
              <div className="text-center py-4">Loading files...</div>
            ) : trainingFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No training files uploaded yet
              </div>
            ) : (
              trainingFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTrainingFile?.id === file.id
                      ? "border-[#FFD700] bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTrainingFile(file)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{file.originalName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(file.uploadedAt).toLocaleDateString()} • 
                        {(file.size / 1024).toFixed(2)} KB • 
                        {file.status}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this file?")) {
                          deleteFileMutation.mutate(file.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Contexts Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Training Contexts
            {selectedTrainingFile && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                from {selectedTrainingFile.originalName}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedTrainingFile ? (
            <div className="text-center py-8 text-gray-500">
              Select a file to view its contexts
            </div>
          ) : contextsLoading ? (
            <div className="text-center py-4">Loading contexts...</div>
          ) : contexts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contexts found for this file
            </div>
          ) : (
            <div className="space-y-3">
              {contexts.map((context) => (
                <div
                  key={context.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{context.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {context.content}
                      </p>
                      {context.keywords && context.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {context.keywords.slice(0, 5).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this context?")) {
                          deleteContextMutation.mutate(context.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}