import { Card, CardContent } from "@/components/ui/card";
import { Play, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Booked 3 discovery calls my first week—while I was on vacation.",
    author: "Samira",
    role: "Business Coach",
    tldr: "+3 bookings in 7 days",
    hasVideo: true
  },
  {
    quote: "Onboarding emails now send in 20 seconds, not 20 minutes.",
    author: "Marcus",
    role: "Online Fitness Coach", 
    tldr: "95% time savings",
    hasVideo: true
  },
  {
    quote: "My DMs don't feel overwhelming anymore—they actually book calls for me.",
    author: "Rachel",
    role: "Life Coach",
    tldr: "Zero DM stress",
    hasVideo: false
  }
];

export function Testimonials() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          What Coaches Are Saying
        </h2>
        <div className="flex items-center justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-2 text-gray-600 dark:text-gray-300">
            Trusted by coaches in 17 countries
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="glass-card hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6">
              {testimonial.hasVideo && (
                <div className="relative mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg aspect-video flex items-center justify-center cursor-pointer group">
                  <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    TL;DW: {testimonial.tldr}
                  </div>
                </div>
              )}
              
              <blockquote className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-black font-semibold text-sm">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              
              {!testimonial.hasVideo && (
                <div className="mt-4 text-center">
                  <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full">
                    {testimonial.tldr}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}