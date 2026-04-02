export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  instructorIds: string[];
  date: string | null;
  duration: string;
  capacity: number;
  spotsRemaining: number;
  coverImage: string | null;
  tags: string[];
  status: "Published" | "Draft" | "Full";
}

export interface Instructor {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  linkedin: string | null;
}
