import { AlertCircle, ExternalLink } from "lucide-react";

export function HelpMessage() {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-4 mx-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold text-sm mb-2">
            Make.com Configuration Help
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed mb-3">
            If you're getting "Accepted" responses, your Make.com scenario needs to be configured for immediate execution:
          </p>
          <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 list-disc list-inside">
            <li>Set your webhook to respond immediately (synchronous mode)</li>
            <li>Add a "Webhook Response" module after your AI processing</li>
            <li>Configure it to return JSON: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{"{"}"reply": "Your response here"{"}"}</code></li>
          </ul>
          <a 
            href="https://www.make.com/en/help/modules/webhooks" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 text-sm font-medium mt-2"
          >
            Make.com Webhook Documentation
            <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}