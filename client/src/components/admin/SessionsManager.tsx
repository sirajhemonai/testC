import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Eye, 
  ExternalLink, 
  Search, 
  Filter, 
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ConsultationSession } from "@shared/schema";

interface SessionWithStats extends ConsultationSession {
  totalResponses?: number;
  messagesCount?: number;
}

export function SessionsManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "incomplete">("all");
  const [selectedSession, setSelectedSession] = useState<SessionWithStats | null>(null);

  // Fetch all consultation sessions
  const { data: sessions = [], isLoading, refetch } = useQuery<SessionWithStats[]>({
    queryKey: ["/api/admin/sessions"],
  });

  // Delete session mutation
  const deleteSession = useMutation({
    mutationFn: async (sessionId: number) => {
      await apiRequest(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportData = useMutation({
    mutationFn: async (format: "csv" | "json") => {
      const response = await fetch(`/api/admin/sessions/export?format=${format}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `consultation-sessions.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to export data",
        variant: "destructive",
      });
    },
  });

  // Filter sessions based on search term and status
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.businessSummary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toString().includes(searchTerm);

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "complete" && session.isComplete) ||
      (statusFilter === "incomplete" && !session.isComplete);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBusinessName = (summary: string) => {
    try {
      const parsed = JSON.parse(summary);
      return parsed.businessName || "Unknown Business";
    } catch {
      return "Unknown Business";
    }
  };

  const getUserResponses = (responses: string) => {
    try {
      const parsed = JSON.parse(responses);
      return Object.entries(parsed).map(([key, value]) => ({ key, value }));
    } catch {
      return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Consultation Sessions
        </CardTitle>
        <CardDescription>
          View and manage all consultation sessions and user responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by website, business name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData.mutate("csv")}
              disabled={exportData.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData.mutate("json")}
              disabled={exportData.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Loading sessions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sessions found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">#{session.id}</TableCell>
                    <TableCell className="max-w-48">
                      <div className="truncate">
                        {session.businessSummary ? getBusinessName(session.businessSummary) : "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-64">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={session.websiteUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {session.websiteUrl || "No URL"}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={session.isComplete ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {session.isComplete ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {session.isComplete ? "Complete" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {session.currentStep}/6
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(session.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSession(session)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Session Details #{session.id}</DialogTitle>
                              <DialogDescription>
                                Complete consultation session information and user responses
                              </DialogDescription>
                            </DialogHeader>
                            
                            <ScrollArea className="h-[60vh] pr-4">
                              <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Basic Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Business:</strong> {session.businessSummary ? getBusinessName(session.businessSummary) : "Unknown"}</div>
                                      <div><strong>Website:</strong> {session.websiteUrl || "Not provided"}</div>
                                      <div><strong>Status:</strong> {session.isComplete ? "Complete" : "In Progress"}</div>
                                      <div><strong>Current Step:</strong> {session.currentStep}/6</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Timestamps</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Created:</strong> {formatDate(session.createdAt)}</div>
                                      <div><strong>Updated:</strong> {formatDate(session.updatedAt)}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Business Summary */}
                                {session.businessSummary && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Business Analysis</h4>
                                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                      {JSON.stringify(JSON.parse(session.businessSummary), null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* User Responses */}
                                {session.userResponses && session.userResponses !== "{}" && (
                                  <div>
                                    <h4 className="font-semibold mb-2">User Responses</h4>
                                    <div className="space-y-3">
                                      {getUserResponses(session.userResponses).map(({ key, value }, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded">
                                          <div className="font-medium text-sm text-gray-600 mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                          </div>
                                          <div className="text-sm">{value as string}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Final Analysis */}
                                {session.finalAnalysis && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Final Analysis</h4>
                                    <div className="bg-gray-50 p-4 rounded max-h-96 overflow-auto">
                                      <div dangerouslySetInnerHTML={{ __html: session.finalAnalysis }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSession.mutate(session.id)}
                          disabled={deleteSession.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
            <div className="text-sm text-blue-800">Total Sessions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.isComplete).length}
            </div>
            <div className="text-sm text-green-800">Completed</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {sessions.filter(s => !s.isComplete).length}
            </div>
            <div className="text-sm text-yellow-800">In Progress</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => {
                const sessionDate = typeof s.createdAt === 'string' ? new Date(s.createdAt) : s.createdAt;
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return sessionDate > oneDayAgo;
              }).length}
            </div>
            <div className="text-sm text-purple-800">Last 24h</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}