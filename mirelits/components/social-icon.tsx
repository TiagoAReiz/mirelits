import {
  FaInstagram, FaXTwitter, FaBehance, FaLinkedinIn,
  FaPinterest, FaTiktok, FaYoutube, FaArtstation,
  FaDribbble, FaFacebook, FaBluesky, FaThreads,
  FaVimeo, FaGithub, FaGlobe,
} from 'react-icons/fa6'

interface Props {
  platform: string
  size?: number
  className?: string
}

const MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  instagram:  FaInstagram,
  twitter:    FaXTwitter,
  x:          FaXTwitter,
  behance:    FaBehance,
  linkedin:   FaLinkedinIn,
  pinterest:  FaPinterest,
  tiktok:     FaTiktok,
  youtube:    FaYoutube,
  artstation: FaArtstation,
  dribbble:   FaDribbble,
  facebook:   FaFacebook,
  bluesky:    FaBluesky,
  threads:    FaThreads,
  vimeo:      FaVimeo,
  github:     FaGithub,
}

export function SocialIcon({ platform, size = 18, className }: Props) {
  const Icon = MAP[platform.toLowerCase()] ?? FaGlobe
  return <Icon size={size} className={className} />
}

export const SOCIAL_PLATFORMS = [
  { value: 'instagram',  label: 'Instagram'  },
  { value: 'behance',    label: 'Behance'     },
  { value: 'twitter',    label: 'X / Twitter' },
  { value: 'linkedin',   label: 'LinkedIn'    },
  { value: 'facebook',   label: 'Facebook'    },
  { value: 'pinterest',  label: 'Pinterest'   },
  { value: 'tiktok',     label: 'TikTok'      },
  { value: 'youtube',    label: 'YouTube'     },
  { value: 'artstation', label: 'ArtStation'  },
  { value: 'dribbble',   label: 'Dribbble'    },
  { value: 'bluesky',    label: 'Bluesky'     },
  { value: 'threads',    label: 'Threads'     },
  { value: 'vimeo',      label: 'Vimeo'       },
  { value: 'github',     label: 'GitHub'      },
  { value: 'website',    label: 'Site / Link' },
]
