import { google } from 'googleapis';
import type { ConsultationSession, Message } from '@shared/schema';

export class GoogleSheetsService {
  private sheets: any;
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Skip Google Sheets initialization if no credentials provided
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        console.log('Google Sheets integration disabled - no service account key provided');
        return;
      }

      // Use service account credentials from environment variable
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      console.log('Google Sheets integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sheets auth:', error);
    }
  }

  async saveSessionToSheet(
    session: ConsultationSession,
    messages: Message[],
    spreadsheetId: string
  ): Promise<boolean> {
    try {
      if (!this.sheets) {
        console.error('Google Sheets not initialized');
        return false;
      }

      // Prepare session data
      const sessionData = this.prepareSessionData(session, messages);
      
      // Save to main sessions sheet
      await this.appendToSheet(spreadsheetId, 'Sessions', sessionData.sessionRow);
      
      // Save individual messages to messages sheet
      for (const messageRow of sessionData.messageRows) {
        await this.appendToSheet(spreadsheetId, 'Messages', messageRow);
      }

      console.log(`Successfully saved session ${session.id} to Google Sheets`);
      return true;
    } catch (error) {
      console.error('Failed to save session to Google Sheets:', error);
      return false;
    }
  }

  private prepareSessionData(session: ConsultationSession, messages: Message[]) {
    // Parse stored JSON data
    const userResponses = JSON.parse(session.userResponses || '{}');
    const painMatrix = JSON.parse(session.painMatrix || '{}');
    const confidenceScores = JSON.parse(session.confidenceScores || '{}');
    const websiteAnalysis = session.websiteAnalysis ? JSON.parse(session.websiteAnalysis) : {};

    // Session summary row
    const sessionRow = [
      session.id,
      session.email || '',
      session.websiteUrl || '',
      websiteAnalysis.businessName || '',
      websiteAnalysis.businessType || '',
      websiteAnalysis.targetAudience || '',
      (websiteAnalysis.services || []).join(', '),
      (websiteAnalysis.challenges || []).join(', '),
      session.persona || '',
      Object.entries(painMatrix).map(([bucket, score]) => `${bucket}: ${score}`).join(', '),
      Object.entries(confidenceScores).map(([automation, score]) => `${automation}: ${score}`).join(', '),
      session.isComplete,
      session.createdAt?.toISOString() || '',
      session.updatedAt?.toISOString() || '',
      messages.length,
      this.extractUserName(messages),
      this.calculateSessionDuration(messages),
      this.getTopPainPoints(painMatrix),
      this.getTopAutomations(confidenceScores)
    ];

    // Individual message rows
    const messageRows = messages.map(msg => [
      session.id, // Session ID for linking
      msg.id,
      msg.isUser ? 'User' : 'AI',
      msg.content,
      msg.messageType || 'text',
      (msg.quickReplies || []).join(', '),
      msg.timestamp?.toISOString() || '',
      session.email || '',
      websiteAnalysis.businessName || ''
    ]);

    return { sessionRow, messageRows };
  }

  private async appendToSheet(spreadsheetId: string, sheetName: string, values: any[]) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      resource: {
        values: [values],
      },
    });
  }

  private extractUserName(messages: Message[]): string {
    // Look for the first user message after the greeting
    const userMessages = messages.filter(msg => msg.isUser && msg.content.trim().length > 0);
    return userMessages.length > 0 ? userMessages[0].content.split(' ')[0] : '';
  }

  private calculateSessionDuration(messages: Message[]): string {
    if (messages.length < 2) return '0 min';
    
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    
    if (!firstMessage.timestamp || !lastMessage.timestamp) return '0 min';
    
    const durationMs = new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime();
    const durationMin = Math.round(durationMs / (1000 * 60));
    
    return `${durationMin} min`;
  }

  private getTopPainPoints(painMatrix: any): string {
    const sorted = Object.entries(painMatrix)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    return sorted.map(([bucket, score]) => `${bucket} (${score})`).join(', ');
  }

  private getTopAutomations(confidenceScores: any): string {
    const sorted = Object.entries(confidenceScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    return sorted.map(([automation, score]) => `${automation} (${score})`).join(', ');
  }

  async createSheetsStructure(spreadsheetId: string): Promise<boolean> {
    try {
      if (!this.sheets) {
        console.error('Google Sheets not initialized');
        return false;
      }

      // Create Sessions sheet header
      const sessionsHeader = [
        'Session ID', 'Email', 'Website URL', 'Business Name', 'Business Type', 
        'Target Audience', 'Services', 'Challenges', 'Persona', 'Pain Matrix', 
        'Confidence Scores', 'Is Complete', 'Created At', 'Updated At', 
        'Message Count', 'User Name', 'Duration', 'Top Pain Points', 'Top Automations'
      ];

      // Create Messages sheet header
      const messagesHeader = [
        'Session ID', 'Message ID', 'Sender', 'Content', 'Message Type', 
        'Quick Replies', 'Timestamp', 'User Email', 'Business Name'
      ];

      // Add headers to both sheets
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sessions!A1:S1',
        valueInputOption: 'RAW',
        resource: {
          values: [sessionsHeader],
        },
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Messages!A1:I1',
        valueInputOption: 'RAW',
        resource: {
          values: [messagesHeader],
        },
      });

      console.log('Successfully created Google Sheets structure');
      return true;
    } catch (error) {
      console.error('Failed to create sheets structure:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();