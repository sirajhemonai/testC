import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoPopupProps {
  youtubeUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function VideoPopup({ youtubeUrl, isOpen, onClose, title }: VideoPopupProps) {
  if (!youtubeUrl) return null;

  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  if (!embedUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full p-0 overflow-hidden m-2 sm:m-4">
        <DialogHeader className="sr-only">
          <DialogTitle>{title} - Project Video</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-1 right-1 md:top-2 md:right-2 z-10 bg-black/50 hover:bg-black/70 text-white h-8 w-8 md:h-10 md:w-10"
          >
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}