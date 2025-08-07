import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Download, Settings, FileSpreadsheet } from "lucide-react";

export default function SheetsAdmin() {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const { toast } = useToast();

  const handleSetupSheets = async () => {
    if (!spreadsheetId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets ID",
        variant: "destructive",
      });
      return;
    }

    setIsSetupLoading(true);
    try {
      const response = await fetch('/api/sheets/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: spreadsheetId.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setSetupComplete(true);
        toast({
          title: "Success",
          description: "Google Sheets structure created successfully!",
        });
      } else {
        toast({
          title: "Setup Failed",
          description: result.error || "Failed to setup Google Sheets",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSetupLoading(false);
    }
  };

  const handleSaveAllSessions = async () => {
    if (!spreadsheetId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets ID",
        variant: "destructive",
      });
      return;
    }

    setIsSaveLoading(true);
    try {
      const response = await fetch('/api/sheets/save-all-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: spreadsheetId.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Sessions Saved",
          description: `${result.successCount} sessions saved successfully. ${result.errorCount} errors.`,
        });
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save sessions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <FileSpreadsheet className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Google Sheets Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Export consultation data to Google Sheets for analysis and follow-up
          </p>
        </div>

        <div className="grid gap-6">
          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Required Environment Variables:
                </h3>
                <div className="space-y-2 text-sm">
                  <p><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">GOOGLE_SERVICE_ACCOUNT_KEY</code> - Your Google Service Account JSON key</p>
                  <p><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">GOOGLE_SHEETS_ID</code> - (Optional) Default spreadsheet ID for auto-save</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Setup Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>Create a new Google Cloud Project at <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 hover:underline">console.cloud.google.com</a></li>
                  <li>Enable the Google Sheets API</li>
                  <li>Create a Service Account with Google Sheets access</li>
                  <li>Download the Service Account JSON key file</li>
                  <li>Add the JSON content as the GOOGLE_SERVICE_ACCOUNT_KEY secret</li>
                  <li>Create a new Google Sheet and share it with the Service Account email</li>
                  <li>Copy the Google Sheet ID from the URL</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Spreadsheet Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Google Sheets Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Sheets ID
                </label>
                <Input
                  type="text"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="mb-4"
                />
                <p className="text-xs text-gray-500 mb-4">
                  Find this in your Google Sheets URL: docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSetupSheets}
                  disabled={isSetupLoading || !spreadsheetId.trim()}
                  className="flex-1"
                >
                  {isSetupLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Setup Sheets Structure
                    </>
                  )}
                </Button>

                {setupComplete && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span className="text-sm">Ready</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Export all consultation sessions and chat histories to your Google Sheet.
              </p>

              <Button
                onClick={handleSaveAllSessions}
                disabled={isSaveLoading || !spreadsheetId.trim()}
                className="w-full"
                variant="outline"
              >
                {isSaveLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export All Sessions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Data Structure Info */}
          <Card>
            <CardHeader>
              <CardTitle>Data Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Sessions Sheet:</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Contains summary data for each consultation including email, website, business type, 
                    pain matrix scores, persona assignment, and ROI calculations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Messages Sheet:</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Contains individual chat messages with timestamps, linked to sessions for 
                    detailed conversation analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}