import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { LeadGenField } from "@shared/schema";

interface NewFieldData {
  fieldName: string;
  fieldType: "text" | "email" | "phone" | "number" | "select" | "textarea";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string;
  order: number;
}

export function LeadGenFieldsConfig() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState<Partial<NewFieldData>>({
    fieldType: "text",
    required: true,
  });

  // Fetch lead gen fields
  const { data: fields = [], isLoading } = useQuery<LeadGenField[]>({
    queryKey: ["/api/chatbot-modes/lead-gen-fields"],
  });

  // Create field mutation
  const createField = useMutation({
    mutationFn: async (data: NewFieldData) => {
      await apiRequest("/api/chatbot-modes/lead-gen-fields", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot-modes/lead-gen-fields"] });
      toast({
        title: "Success",
        description: "Lead generation field created successfully",
      });
      setShowAddForm(false);
      setNewField({ fieldType: "text", required: true });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create field",
        variant: "destructive",
      });
    },
  });

  // Update field mutation
  const updateField = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<LeadGenField> }) => {
      await apiRequest(`/api/chatbot-modes/lead-gen-fields/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot-modes/lead-gen-fields"] });
      toast({
        title: "Success",
        description: "Field updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    },
  });

  // Delete field mutation
  const deleteField = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/chatbot-modes/lead-gen-fields/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot-modes/lead-gen-fields"] });
      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    },
  });

  const handleCreateField = () => {
    if (!newField.fieldName || !newField.label) {
      toast({
        title: "Error",
        description: "Field name and label are required",
        variant: "destructive",
      });
      return;
    }

    createField.mutate({
      fieldName: newField.fieldName,
      fieldType: newField.fieldType || "text",
      label: newField.label,
      placeholder: newField.placeholder,
      required: newField.required ?? true,
      options: newField.options,
      order: fields.length + 1,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Lead Generation Fields
        </CardTitle>
        <CardDescription>
          Configure the fields to collect from leads when using Lead Gen mode
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Add new field button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Field
          </Button>
        )}

        {/* Add new field form */}
        {showAddForm && (
          <Card className="mb-6 border-dashed">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Name (internal)</Label>
                  <Input
                    value={newField.fieldName || ""}
                    onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                    placeholder="e.g., firstName"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label (display)</Label>
                  <Input
                    value={newField.label || ""}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                    placeholder="e.g., First Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={newField.fieldType}
                    onValueChange={(value) => setNewField({ ...newField, fieldType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input
                    value={newField.placeholder || ""}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                    placeholder="e.g., Enter your first name"
                  />
                </div>
              </div>

              {newField.fieldType === "select" && (
                <div className="space-y-2">
                  <Label>Options (comma-separated)</Label>
                  <Input
                    value={newField.options || ""}
                    onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                    placeholder="e.g., Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={newField.required ?? true}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                />
                <Label htmlFor="required">Required field</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateField}
                  disabled={createField.isPending}
                >
                  {createField.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Field"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewField({ fieldType: "text", required: true });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fields table */}
        {fields.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Order</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.sort((a, b) => a.order - b.order).map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {field.order}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{field.fieldName}</TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell className="capitalize">{field.fieldType}</TableCell>
                  <TableCell>
                    <Switch
                      checked={field.isRequired}
                      onCheckedChange={(checked) => {
                        updateField.mutate({
                          id: field.id,
                          updates: { isRequired: checked }
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={field.isActive}
                      onCheckedChange={(checked) => {
                        updateField.mutate({
                          id: field.id,
                          updates: { isActive: checked }
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteField.mutate(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No lead generation fields configured yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}