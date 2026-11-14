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
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl?: string;
  avatarBase64?: string;
  jobTitle?: string;
  location?: string;
}

export interface ThemeConfig {
  preset: "periwinkle-chrome" | "carbon-dark" | "gameboy-color" | "lavender-soft";
  bgColor: string;
  bevelStyle: "sharp-chamfer" | "smooth-bevel" | "flat-plate";
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
