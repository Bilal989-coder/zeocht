import exp1 from "@/assets/experience-1.jpg";
import exp2 from "@/assets/experience-2.jpg";
import exp3 from "@/assets/experience-3.jpg";
import exp4 from "@/assets/experience-4.jpg";

export interface Experience {
  id: string;
  image: string;
  title: string;
  guide: string;
  location: string;
  coordinates: { lat: number; lng: number };
  price: number;
  rating: number;
  reviews: number;
  type: "live" | "recorded" | "both" | "popular" | "originals";
  isGuestFavorite: boolean;
  hostAvatar: string;
}

export const popularExperiences: Experience[] = [
  {
    id: "1",
    image: exp1,
    title: "Sunset Tour of Santorini",
    guide: "Maria K.",
    location: "Santorini, Greece",
    coordinates: { lat: 36.3932, lng: 25.4615 },
    price: 45,
    rating: 4.9,
    reviews: 127,
    type: "both",
    isGuestFavorite: true,
    hostAvatar: exp1,
  },
  {
    id: "2",
    image: exp2,
    title: "Tokyo Street Food Night Walk",
    guide: "Kenji T.",
    location: "Tokyo, Japan",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    price: 35,
    rating: 4.8,
    reviews: 189,
    type: "live",
    isGuestFavorite: true,
    hostAvatar: exp2,
  },
  {
    id: "3",
    image: exp3,
    title: "African Safari Experience",
    guide: "David M.",
    location: "Serengeti, Tanzania",
    coordinates: { lat: -2.3333, lng: 34.8333 },
    price: 65,
    rating: 5.0,
    reviews: 203,
    type: "both",
    isGuestFavorite: true,
    hostAvatar: exp3,
  },
  {
    id: "4",
    image: exp4,
    title: "Northern Lights Adventure",
    guide: "Erik J.",
    location: "Reykjavik, Iceland",
    coordinates: { lat: 64.1466, lng: -21.9426 },
    price: 55,
    rating: 4.9,
    reviews: 156,
    type: "recorded",
    isGuestFavorite: true,
    hostAvatar: exp4,
  },
  {
    id: "5",
    image: exp1,
    title: "Mediterranean Cooking Class",
    guide: "Sofia R.",
    location: "Athens, Greece",
    coordinates: { lat: 37.9838, lng: 23.7275 },
    price: 40,
    rating: 4.7,
    reviews: 92,
    type: "live",
    isGuestFavorite: false,
    hostAvatar: exp1,
  },
  {
    id: "6",
    image: exp2,
    title: "Traditional Tea Ceremony",
    guide: "Yuki M.",
    location: "Kyoto, Japan",
    coordinates: { lat: 35.0116, lng: 135.7681 },
    price: 30,
    rating: 4.9,
    reviews: 145,
    type: "both",
    isGuestFavorite: true,
    hostAvatar: exp2,
  },
];

export const followingGuides: Experience[] = [
  {
    id: "7",
    image: exp1,
    title: "Virtual Walking Tours",
    guide: "Maria K.",
    location: "Santorini, Greece",
    coordinates: { lat: 36.3932, lng: 25.4615 },
    price: 45,
    rating: 4.9,
    reviews: 1234,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp1,
  },
  {
    id: "8",
    image: exp2,
    title: "Cultural Food Experiences",
    guide: "Kenji T.",
    location: "Tokyo, Japan",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    price: 35,
    rating: 4.8,
    reviews: 892,
    type: "originals",
    isGuestFavorite: true,
    hostAvatar: exp2,
  },
  {
    id: "9",
    image: exp3,
    title: "Wildlife Safari Tours",
    guide: "David M.",
    location: "Serengeti, Tanzania",
    coordinates: { lat: -2.3333, lng: 34.8333 },
    price: 120,
    rating: 5.0,
    reviews: 2103,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp3,
  },
];

export const popularGuides: Experience[] = [
  {
    id: "10",
    image: exp4,
    title: "Historic City Tours",
    guide: "Sofia L.",
    location: "Barcelona, Spain",
    coordinates: { lat: 41.3851, lng: 2.1734 },
    price: 55,
    rating: 4.9,
    reviews: 3421,
    type: "originals",
    isGuestFavorite: true,
    hostAvatar: exp4,
  },
  {
    id: "11",
    image: exp1,
    title: "Ancient Wonders Tour",
    guide: "Ahmed R.",
    location: "Cairo, Egypt",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    price: 75,
    rating: 4.8,
    reviews: 2876,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp1,
  },
  {
    id: "12",
    image: exp2,
    title: "Art & Architecture Walk",
    guide: "Isabella C.",
    location: "Rome, Italy",
    coordinates: { lat: 41.9028, lng: 12.4964 },
    price: 60,
    rating: 4.9,
    reviews: 1987,
    type: "originals",
    isGuestFavorite: true,
    hostAvatar: exp2,
  },
];

export const bestSellers: Experience[] = [
  {
    id: "13",
    image: exp3,
    title: "Mountain Hiking Adventure",
    guide: "Erik S.",
    location: "Reykjavik, Iceland",
    coordinates: { lat: 64.1466, lng: -21.9426 },
    price: 95,
    rating: 5.0,
    reviews: 4521,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp3,
  },
  {
    id: "14",
    image: exp4,
    title: "Street Photography Tour",
    guide: "Priya M.",
    location: "Jaipur, India",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    price: 25,
    rating: 4.9,
    reviews: 3142,
    type: "originals",
    isGuestFavorite: true,
    hostAvatar: exp4,
  },
  {
    id: "15",
    image: exp1,
    title: "Wine Tasting Experience",
    guide: "Giuseppe R.",
    location: "Florence, Italy",
    coordinates: { lat: 43.7696, lng: 11.2558 },
    price: 85,
    rating: 5.0,
    reviews: 2987,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp1,
  },
];

export const topRatedGuides: Experience[] = [
  {
    id: "16",
    image: exp2,
    title: "Coastal Kayaking Adventure",
    guide: "Lars N.",
    location: "Bergen, Norway",
    coordinates: { lat: 60.3913, lng: 5.3221 },
    price: 70,
    rating: 5.0,
    reviews: 1654,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp2,
  },
  {
    id: "17",
    image: exp3,
    title: "Desert Camping Experience",
    guide: "Fatima A.",
    location: "Dubai, UAE",
    coordinates: { lat: 25.2048, lng: 55.2708 },
    price: 110,
    rating: 4.9,
    reviews: 2341,
    type: "originals",
    isGuestFavorite: true,
    hostAvatar: exp3,
  },
  {
    id: "18",
    image: exp4,
    title: "Jazz & Blues Tour",
    guide: "Marcus J.",
    location: "New Orleans, USA",
    coordinates: { lat: 29.9511, lng: -90.0715 },
    price: 50,
    rating: 5.0,
    reviews: 1987,
    type: "popular",
    isGuestFavorite: true,
    hostAvatar: exp4,
  },
];

// Favorites - All experiences and guides marked as guest favorites
export const favoriteExperiences: Experience[] = [
  ...popularExperiences.filter(exp => exp.isGuestFavorite),
  ...bestSellers.filter(exp => exp.isGuestFavorite),
].slice(0, 6);

export const favoriteGuides: Experience[] = [
  ...followingGuides.filter(exp => exp.isGuestFavorite),
  ...popularGuides.filter(exp => exp.isGuestFavorite),
  ...topRatedGuides.filter(exp => exp.isGuestFavorite),
].slice(0, 6);
