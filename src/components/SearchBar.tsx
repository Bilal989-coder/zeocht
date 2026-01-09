import { useState } from "react";
import { Search, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface SearchFilters {
  location: string;
  date: Date | undefined;
  duration: string;
}

interface SearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [whereOpen, setWhereOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [where, setWhere] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [duration, setDuration] = useState<string>("");

  const suggestedDestinations = [
    {
      title: "Nearby",
      subtitle: "Find what's around you",
      icon: <Navigation className="h-5 w-5" />,
    },
    {
      title: "Paris, France",
      subtitle: "Experience the City of Light",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: "Tokyo, Japan",
      subtitle: "Explore modern and traditional",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: "New York, USA",
      subtitle: "The city that never sleeps",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      title: "Rome, Italy",
      subtitle: "Ancient history comes alive",
      icon: <MapPin className="h-5 w-5" />,
    },
  ];

  const durationOptions = [
    { value: "", label: "Any length" },
    { value: "30", label: "30 min or less" },
    { value: "60", label: "Up to 1 hour" },
    { value: "90", label: "Up to 1.5 hours" },
    { value: "120", label: "2+ hours" },
  ];

  return (
    <div className="border border-border rounded-full shadow-sm hover:shadow-md transition-shadow bg-card max-w-4xl mx-auto">
      <div className="flex items-center">
        {/* Where to */}
        <Popover open={whereOpen} onOpenChange={setWhereOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="flex-1 px-6 py-3.5 border-r border-border cursor-pointer hover:bg-muted/50 rounded-l-full transition-colors text-left">
              <div className="text-xs font-semibold text-foreground mb-0.5">Where to</div>
              <div className="text-sm text-muted-foreground">{where || "Search destinations"}</div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-card z-50" align="start">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Suggested destinations</h3>
              <div className="space-y-1">
                {suggestedDestinations.map((destination, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (destination.title === "Nearby") {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            console.log("User location:", position.coords);
                          });
                        }
                        setWhere("Nearby");
                      } else {
                        setWhere(destination.title);
                      }
                      setWhereOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="text-muted-foreground">
                      {destination.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{destination.title}</div>
                      <div className="text-xs text-muted-foreground">{destination.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* When */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="flex-1 px-6 py-3.5 border-r border-border cursor-pointer hover:bg-muted/50 transition-colors text-left">
              <div className="text-xs font-semibold text-foreground mb-0.5">When</div>
              <div className="text-sm text-muted-foreground">
                {date ? format(date, "MMM dd") : "Add dates"}
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setDateOpen(false);
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        {/* Duration */}
        <Popover open={durationOpen} onOpenChange={setDurationOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="flex-1 px-6 py-3.5 cursor-pointer hover:bg-muted/50 rounded-r-full transition-colors flex items-center justify-between gap-2">
              <div className="flex-1 text-left">
                <div className="text-xs font-semibold text-foreground mb-0.5">Duration</div>
                <div className="text-sm text-muted-foreground">
                  {duration ? durationOptions.find(d => d.value === duration)?.label : "Any length"}
                </div>
              </div>
              <Button 
                type="button"
                size="icon" 
                className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearch?.({
                    location: where,
                    date: date,
                    duration: duration
                  });
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 bg-card z-50" align="end">
            <div className="p-2">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDuration(option.value);
                    setDurationOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm",
                    duration === option.value && "bg-muted font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default SearchBar;
