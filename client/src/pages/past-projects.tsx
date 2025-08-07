import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import { VideoPopup } from "@/components/video-popup";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

export function PastProjectsPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <MainHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD700] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
          </div>
        </div>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <MainHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12 px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Past <span className="text-[#FFD700]">Projects</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See how we've helped coaches and businesses automate their processes, 
            generate more leads, and scale their operations with custom automation solutions.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-6 md:mb-8 px-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black w-full sm:w-auto text-sm md:text-base">
                Back to Home
              </Button>
            </Link>
            <Link href="/chat" className="w-full sm:w-auto">
              <Button 
                className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 w-full sm:w-auto text-sm md:text-base"
                onClick={async () => {
                  // Clear any existing session data when starting new analysis
                  sessionStorage.removeItem('websiteUrl');
                  sessionStorage.removeItem('lastWebsiteUrl');
                  
                  // Reset consultation on server
                  try {
                    await fetch('/api/consultation/reset', { method: 'POST' });
                  } catch (error) {
                    console.error('Failed to reset consultation:', error);
                  }
                }}
              >
                Start New Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {projects
              .filter(project => project.isActive)
              .sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0))
              .map((project) => {
                const youtubeId = project.youtubeUrl ? extractYouTubeId(project.youtubeUrl) : null;
                
                return (
                  <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-4">
                      {/* Thumbnail or Video Preview */}
                      <div className="relative overflow-hidden rounded-lg mb-4 aspect-video bg-gray-100 dark:bg-gray-800">
                        {youtubeId ? (
                          <div className="relative w-full h-full">
                            <img
                              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                  onClick={() => setSelectedVideo({ url: project.youtubeUrl || "", title: project.title })}
                                  size="lg"
                                  className="rounded-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 shadow-lg"
                                >
                                  <Play className="h-6 w-6" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : project.thumbnail ? (
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-sm">No preview available</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
                          {project.category}
                        </Badge>
                        {project.industry && (
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-600">
                            {project.industry}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#FFD700] transition-colors">
                        {project.title}
                      </CardTitle>
                      
                      {project.clientName && (
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Client: {project.clientName}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {project.results && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            Results: {project.results}
                          </p>
                        </div>
                      )}

                      {project.youtubeUrl && (
                        <Button
                          onClick={() => setSelectedVideo({ url: project.youtubeUrl || "", title: project.title })}
                          className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Case Study
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We're working on showcasing our amazing automation projects. Check back soon!
            </p>
            <Link href="/chat">
              <Button className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                Start Your Project
              </Button>
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-8 md:mt-16 text-center bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-xl md:rounded-2xl p-4 md:p-8 border border-[#FFD700]/20 mx-2 md:mx-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
            Ready to Automate Your Business?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-4 md:mb-6 max-w-2xl mx-auto px-2">
            Exactly what you need to save time & grow.
            Automate DMs, bookings, reminders & check-ins — built for coaches like you.
          </p>
          <div className="flex flex-col gap-3 md:gap-4 justify-center">
            <Link href="/chat" className="w-full sm:w-auto">
              <Button size="lg" className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 px-6 md:px-8 w-full sm:w-auto">
                Get Your Free Analysis
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open("https://wa.me/8801919201192", "_blank")}
              className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black px-6 md:px-8 w-full sm:w-auto"
            >
              <span className="hidden sm:inline">WhatsApp: +8801919201192</span>
              <span className="sm:hidden">WhatsApp Chat</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Video Popup */}
      <VideoPopup
        youtubeUrl={selectedVideo?.url || null}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo?.title || ""}
      />
      
      <MainFooter />
    </div>
  );
}