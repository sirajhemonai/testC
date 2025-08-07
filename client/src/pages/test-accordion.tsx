import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

export default function TestAccordion() {
  const { theme } = useTheme();

  useEffect(() => {
    // Define the toggleAccordion function globally
    (window as any).toggleAccordion = function(trigger: HTMLElement) {
      console.log('toggleAccordion called', trigger);
      const content = trigger.nextElementSibling as HTMLElement;
      const arrow = trigger.querySelector('span');
      
      console.log('Content element:', content);
      console.log('Arrow element:', arrow);
      
      if (content && arrow) {
        const isHidden = content.style.display === 'none' || content.style.display === '';
        console.log('Is hidden:', isHidden);
        
        if (isHidden) {
          content.style.display = 'block';
          content.style.maxHeight = 'none';
          arrow.textContent = '▲';
          console.log('Showing content');
        } else {
          content.style.display = 'none';
          arrow.textContent = '▼';
          console.log('Hiding content');
        }
      } else {
        console.log('Missing content or arrow element');
      }
    };
    
    return () => {
      delete (window as any).toggleAccordion;
    };
  }, []);

  const analysisHTML = `
<div style="background-color: var(--bg-primary, #fff7e6); color: var(--text-primary, #333333); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--border-color, #e0e0e0);">
  <h2 style="color: var(--text-primary, #333333); margin: 0 0 15px 0;">🎯 Your Automation Opportunities</h2>
  <p style="color: var(--text-primary, #333333); margin: 0;">Hi John! Based on your e-commerce business and interest in lead generation and customer support, here are proven automation strategies that can save you 10+ hours per week:</p>
</div>

<div style="margin-bottom: 16px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); padding: 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; color: var(--text-primary, #333333);">🚀 Lead Qualification & Follow-up Automation</h3>
    <span style="font-size: 18px; color: var(--text-primary, #333333); user-select: none;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 8px 8px; display: none; overflow: hidden;">
    <div style="padding: 16px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 10px 0;"><strong>Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 10px 20px;">
        <li>Set up automated lead scoring based on website behavior</li>
        <li>Create personalized follow-up sequences based on lead source</li>
        <li>Implement instant notification system for high-priority leads</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0;"><strong>Results:</strong> Save 8-12 hours weekly while converting 35% more leads into customers.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 16px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); padding: 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; color: var(--text-primary, #333333);">💬 Customer Support Automation</h3>
    <span style="font-size: 18px; color: var(--text-primary, #333333); user-select: none;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 8px 8px; display: none; overflow: hidden;">
    <div style="padding: 16px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 10px 0;"><strong>Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 10px 20px;">
        <li>Deploy AI chatbot for 24/7 first-line support</li>
        <li>Create automated ticket routing by issue type</li>
        <li>Set up instant escalation for complex issues</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0;"><strong>Results:</strong> Reduce response time by 80% and handle 70% of inquiries automatically.</p>
    </div>
  </div>
</div>

<div style="margin-bottom: 16px;">
  <div onclick="toggleAccordion(this)" style="background-color: var(--bg-secondary, #ffffff); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); padding: 16px; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0; color: var(--text-primary, #333333);">📊 Data Collection & Analysis</h3>
    <span style="font-size: 18px; color: var(--text-primary, #333333); user-select: none;">▼</span>
  </div>
  <div style="background-color: var(--bg-tertiary, #f8f9fa); color: var(--text-primary, #333333); border: 1px solid var(--border-color, #e0e0e0); border-top: none; padding: 0; border-radius: 0 0 8px 8px; display: none; overflow: hidden;">
    <div style="padding: 16px;">
      <p style="color: var(--text-primary, #333333); margin: 0 0 10px 0;"><strong>Implementation:</strong></p>
      <ul style="color: var(--text-primary, #333333); margin: 0 0 10px 20px;">
        <li>Automate customer data collection from multiple touchpoints</li>
        <li>Create real-time performance dashboards</li>
        <li>Set up automated reporting and alerts</li>
      </ul>
      <p style="color: var(--text-primary, #333333); margin: 0;"><strong>Results:</strong> Eliminate manual data entry and get instant insights for better decision-making.</p>
    </div>
  </div>
</div>

<div style="background-color: var(--bg-primary, #fff7e6); color: var(--text-primary, #333333); padding: 20px; border-radius: 12px; margin-top: 20px; border: 1px solid var(--border-color, #e0e0e0);">
  <h3 style="color: var(--text-primary, #333333); margin: 0 0 10px 0;">🎯 Ready to Get Started?</h3>
  <p style="color: var(--text-primary, #333333); margin: 0;">These automations can save you 10+ hours per week while growing your business. Click on each section above to see detailed implementation steps!</p>
</div>
`;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accordion Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Click on any accordion header to test the expand/collapse functionality. 
            Check the browser console (F12) for debugging information.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Debug Info:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Theme: {theme} | toggleAccordion function: {typeof (window as any).toggleAccordion}
            </p>
          </div>
        </div>
        
        <div 
          className="prose prose-sm max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300"
          dangerouslySetInnerHTML={{ __html: analysisHTML }}
        />
      </div>
    </div>
  );
}