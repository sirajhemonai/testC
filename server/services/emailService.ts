import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.maileroo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'webinfo@dac855e7e99f76e0.maileroo.org',
        pass: '1af7d5423a9f51abbbada4a1',
      },
    });
  }

  async sendSessionData(sessionData: any) {
    const mailOptions = {
      from: '"SellSpark AI" <webinfo@dac855e7e99f76e0.maileroo.org>',
      to: 'sirajhemonai@gmail.com',
      subject: `New Session Data - ${sessionData.businessName || 'Unknown Business'}`,
      html: this.formatSessionEmail(sessionData),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Session data email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending session email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private formatSessionEmail(sessionData: any): string {
    const timestamp = new Date().toLocaleString();
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700; background: #0F172A; padding: 20px; margin: 0;">
          SellSpark AI - New Session Data
        </h2>
        
        <div style="background: #f5f5f5; padding: 20px;">
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          <p><strong>Session ID:</strong> ${sessionData.id || 'N/A'}</p>
          
          <h3 style="color: #333; margin-top: 20px;">Business Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: white;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sessionData.businessName || 'N/A'}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Website:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sessionData.websiteUrl || 'N/A'}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sessionData.email || 'N/A'}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Type:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${sessionData.businessType || 'N/A'}</td>
            </tr>
          </table>
          
          ${sessionData.websiteAnalysis ? `
            <h3 style="color: #333; margin-top: 20px;">Website Analysis</h3>
            <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              <p><strong>Business Name:</strong> ${sessionData.websiteAnalysis.businessName || 'N/A'}</p>
              <p><strong>Business Type:</strong> ${sessionData.websiteAnalysis.businessType || 'N/A'}</p>
              <p><strong>Target Audience:</strong> ${sessionData.websiteAnalysis.targetAudience || 'N/A'}</p>
              <p><strong>Services:</strong> ${sessionData.websiteAnalysis.services?.join(', ') || 'N/A'}</p>
              <p><strong>Challenges:</strong> ${sessionData.websiteAnalysis.challenges?.join(', ') || 'N/A'}</p>
            </div>
          ` : ''}
          
          ${sessionData.consultationData ? `
            <h3 style="color: #333; margin-top: 20px;">Consultation Details</h3>
            <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
              <p><strong>Pain Matrix:</strong> ${JSON.stringify(sessionData.consultationData.painMatrix || {})}</p>
              <p><strong>Persona:</strong> ${sessionData.consultationData.persona || 'N/A'}</p>
              <p><strong>Completion Status:</strong> ${sessionData.consultationData.isComplete ? 'Completed' : 'In Progress'}</p>
            </div>
          ` : ''}
          
          ${sessionData.messages && sessionData.messages.length > 0 ? `
            <h3 style="color: #333; margin-top: 20px;">Chat History</h3>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: white;">
              ${sessionData.messages.map((msg: any) => `
                <div style="margin-bottom: 10px; padding: 10px; background: ${msg.isUser ? '#e3f2fd' : '#f5f5f5'}; border-radius: 5px;">
                  <strong>${msg.isUser ? 'User' : 'AI'}:</strong> ${msg.content}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  async sendAIAgentExpertRequest(data: any) {
    // Send to admin
    const adminMailOptions = {
      from: '"SellSpark AI" <webinfo@dac855e7e99f76e0.maileroo.org>',
      to: 'sirajhemonai@gmail.com',
      subject: `New AI Agent Expert Request - ${data.businessName}`,
      html: this.formatAIAgentEmail(data),
    };

    // Send to customer
    const customerMailOptions = {
      from: '"SellSpark AI Team" <webinfo@dac855e7e99f76e0.maileroo.org>',
      to: data.email,
      subject: `${data.businessName.split(' ')[0]}, Your Free AI Automation Plan is Almost Ready! 🎉`,
      html: this.formatCustomerConfirmationEmail(data),
    };

    try {
      // Send both emails
      const [adminInfo, customerInfo] = await Promise.all([
        this.transporter.sendMail(adminMailOptions),
        this.transporter.sendMail(customerMailOptions)
      ]);
      
      console.log('AI Agent Expert email sent to admin:', adminInfo.messageId);
      console.log('Confirmation email sent to customer:', customerInfo.messageId);
      
      return { success: true, adminMessageId: adminInfo.messageId, customerMessageId: customerInfo.messageId };
    } catch (error) {
      console.error('Error sending AI Agent Expert emails:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private formatAIAgentEmail(data: any): string {
    const timestamp = new Date().toLocaleString();
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700; background: #0F172A; padding: 20px; margin: 0;">
          SellSpark AI - AI Agent Expert Request
        </h2>
        
        <div style="background: #f5f5f5; padding: 20px;">
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          
          <h3 style="color: #333;">Business Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: white;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Name:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.businessName}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Website:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.website}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.email}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Type:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.businessType}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Team Size:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.teamSize}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Budget Range:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.budget}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Automation Details</h3>
          <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <p><strong>Automation Goal:</strong></p>
            <p style="margin-left: 20px;">${data.automationGoal}</p>
            
            <p><strong>Current Process:</strong></p>
            <p style="margin-left: 20px;">${data.currentProcess}</p>
            
            <p><strong>Time Spent Daily:</strong> ${data.timeSpent}</p>
            
            <p><strong>Main Challenges:</strong></p>
            <p style="margin-left: 20px;">${data.painPoints}</p>
          </div>
          
          <h3 style="color: #333; margin-top: 20px;">What happens next?</h3>
          <ol style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <li>Our AI expert will analyze the requirements within 24 hours</li>
            <li>A personalized Loom video will be created with recommendations</li>
            <li>A detailed PDF action plan will be prepared</li>
            <li>The client will receive everything via email</li>
          </ol>
        </div>
      </div>
    `;
  }

  private formatCustomerConfirmationEmail(data: any): string {
    const firstName = data.businessName.split(' ')[0];
    
    return `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with Logo -->
        <div style="background: #FFD700; padding: 30px; text-align: center;">
          <h1 style="color: #0F172A; margin: 0; font-size: 32px;">SellSpark AI</h1>
          <p style="color: #0F172A; margin: 5px 0 0 0; font-size: 16px;">Your AI Automation Partner</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0F172A; font-size: 24px; margin-bottom: 20px;">
            Hey ${firstName}! 👋
          </h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Great news!</strong> We've received your request for a custom AI automation plan, and our team is super excited to help transform your coaching business!
          </p>
          
          <div style="background: #F8F9FA; border-left: 4px solid #FFD700; padding: 20px; margin: 25px 0;">
            <p style="color: #333; font-size: 16px; margin: 0;">
              <strong>Quick favor:</strong> To fast-track your FREE custom plan, just send us a quick WhatsApp message. It takes 10 seconds and helps us prioritize active coaches like you!
            </p>
          </div>
          
          <!-- WhatsApp CTA -->
          <div style="background: #25D366; border-radius: 10px; padding: 25px; margin: 30px 0; text-align: center;">
            <p style="color: white; font-size: 18px; margin: 0 0 15px 0;">
              <strong>Tap to confirm via WhatsApp:</strong>
            </p>
            <a href="https://wa.me/8801919201192?text=Hi%20SellSpark!%20This%20is%20${encodeURIComponent(firstName)}%20from%20${encodeURIComponent(data.businessName)}.%20I%20just%20submitted%20my%20AI%20automation%20request%20with%20this%20email:%20${encodeURIComponent(data.email)}" 
               style="display: inline-block; background: white; color: #25D366; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold;">
              📱 Message Us on WhatsApp
            </a>
            <p style="color: white; font-size: 14px; margin: 15px 0 0 0;">
              Or message: +880 1919 201192
            </p>
          </div>
          
          <!-- What to Send -->
          <div style="background: #FFF9E6; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">
              <strong>What to send us:</strong>
            </p>
            <p style="color: #666; font-size: 15px; margin: 0; font-style: italic;">
              "Hi, this is ${firstName} from ${data.businessName}. I submitted my request with ${data.email}"
            </p>
          </div>
          
          <!-- Benefits -->
          <h3 style="color: #0F172A; font-size: 20px; margin: 30px 0 15px 0;">
            Why the quick WhatsApp message?
          </h3>
          <ul style="color: #333; font-size: 15px; line-height: 1.8;">
            <li>✅ Confirms you're a real coach (not a bot!)</li>
            <li>✅ Moves you to our priority queue</li>
            <li>✅ Opens direct line for any quick questions</li>
            <li>✅ 100% FREE - no strings attached!</li>
          </ul>
          
          <!-- Reassurance -->
          <div style="background: #F0F4F8; border-radius: 10px; padding: 20px; margin: 30px 0;">
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin: 0;">
              <strong>No pressure, no sales pitch!</strong> We genuinely want to help coaches like you save 10+ hours per week with smart automation. This quick message just helps us serve you better and faster. 
            </p>
          </div>
          
          <!-- Next Steps -->
          <h3 style="color: #0F172A; font-size: 20px; margin: 30px 0 15px 0;">
            What happens after you message us:
          </h3>
          <ol style="color: #333; font-size: 15px; line-height: 1.8;">
            <li>We'll send a friendly "Got it!" confirmation</li>
            <li>Our AI experts analyze your specific coaching needs</li>
            <li>Within 24 hours, you receive your custom automation roadmap</li>
            <li>We'll show you exactly how to save those 10+ hours weekly!</li>
          </ol>
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E5E5E5;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Questions? Just reply to this email or WhatsApp us anytime. We're real people who love helping coaches succeed!
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 20px;">
              P.S. - If WhatsApp isn't your thing, just reply to this email with "Confirmed" and we'll process your request. But WhatsApp is faster! 😊
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #0F172A; padding: 20px; text-align: center;">
          <p style="color: #FFD700; font-size: 14px; margin: 0;">
            © 2025 SellSpark AI - Helping Coaches Scale with AI
          </p>
        </div>
      </div>
    `;
  }

  async sendAdminNotificationEmail(subject: string, htmlContent: string) {
    const mailOptions = {
      from: '"SellSpark AI" <webinfo@dac855e7e99f76e0.maileroo.org>',
      to: 'sirajhemonai@gmail.com',
      subject,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Admin notification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendConfirmationEmail(toEmail: string, textContent: string) {
    const mailOptions = {
      from: '"SellSpark AI Team" <webinfo@dac855e7e99f76e0.maileroo.org>',
      to: toEmail,
      subject: 'Your Free Automation Build Request Confirmed! 🎉',
      text: textContent,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FFD700; background: #0F172A; padding: 20px; margin: 0;">
          SellSpark AI - Free Build Confirmed
        </h2>
        <div style="background: #f5f5f5; padding: 20px;">
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${textContent}</pre>
        </div>
      </div>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to customer:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const emailService = new EmailService();