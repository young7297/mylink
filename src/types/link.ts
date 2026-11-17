export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  icon?: string;
  active?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string;
  bio: string;
  avatarUrl?: string;
  avatarBase64?: string;
  jobTitle?: string;
  location?: string;
  firestorePath?: string;
  isGoogleAuth?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ThemeConfig {
  preset: "toss-light" | "periwinkle-chrome" | "carbon-dark" | "gameboy-color" | "lavender-soft" | string;
  bgColor: string;
  bevelStyle: "none" | "sharp-chamfer" | "smooth-bevel" | "flat-plate" | string;
  accentColor: string;
}

export interface SocialLinks {
  instagram?: string;
  github?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  blog?: string;
  email?: string;
}

export interface MyLinkData {
  slug: string;
  profile: UserProfile;
  theme: ThemeConfig;
  socials: SocialLinks;
  links: LinkItem[];
}
