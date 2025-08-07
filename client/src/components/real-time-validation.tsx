import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

const notifications = [
  { name: "Sarah", type: "Life Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Marcus", type: "Business Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Emma", type: "Mindset Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "David", type: "Health Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Lisa", type: "Career Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Anna", type: "Wellness Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Mike", type: "Performance Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Jake", type: "Fitness Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Sophia", type: "Business Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Tyler", type: "Life Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Mia", type: "Health Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Ryan", type: "Career Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Zoe", type: "Wellness Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Alex", type: "Performance Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Grace", type: "Mindset Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Noah", type: "Fitness Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Chloe", type: "Business Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Ethan", type: "Life Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Ava", type: "Health Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Mason", type: "Career Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Isabella", type: "Wellness Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Logan", type: "Performance Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Madison", type: "Mindset Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Lucas", type: "Fitness Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Harper", type: "Business Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Jackson", type: "Life Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Evelyn", type: "Health Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Aiden", type: "Career Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Abigail", type: "Wellness Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Carter", type: "Performance Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Emily", type: "Mindset Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Owen", type: "Fitness Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Elizabeth", type: "Business Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Wyatt", type: "Life Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Sofia", type: "Health Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Sebastian", type: "Career Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Avery", type: "Wellness Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Jack", type: "Performance Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Scarlett", type: "Mindset Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Julian", type: "Fitness Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Victoria", type: "Business Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Henry", type: "Life Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Aria", type: "Health Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Leo", type: "Career Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Luna", type: "Wellness Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Gabriel", type: "Performance Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Layla", type: "Mindset Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Grayson", type: "Fitness Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Mila", type: "Business Coach", action: "unlocked her 3-step Automation Plan" },
  { name: "Liam", type: "Life Coach", action: "unlocked his 3-step Automation Plan" },
  { name: "Aubrey", type: "Health Coach", action: "unlocked her 3-step Automation Plan" }
];

export function RealTimeValidation() {
  const [currentNotification, setCurrentNotification] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentNotification((prev) => (prev + 1) % notifications.length);
        }, 500);
      }, 3000);
    }, 5000);

    // Show first notification after 2 seconds
    setTimeout(() => setIsVisible(true), 2000);

    return () => clearInterval(interval);
  }, []);

  const notification = notifications[currentNotification];

  return (
    <div className="fixed top-20 right-4 z-50">
      <div 
        className={`bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-3 shadow-lg max-w-xs transition-all duration-500 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-gray-900 dark:text-white">
              {notification.name}
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              {` (${notification.type}) just ${notification.action}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}