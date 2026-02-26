## Packages
recharts | For the Iceberg chart visualization of hidden costs
framer-motion | For smooth page transitions and micro-interactions
lucide-react | For high-quality icons (Settings, Skull, etc.)
clsx | For conditional class merging
tailwind-merge | For merging tailwind classes intelligently

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["'Orbitron'", "sans-serif"],
  body: ["'Rajdhani'", "sans-serif"],
  mono: ["'Share Tech Mono'", "monospace"],
}

API Integration:
- LocalStorage needed for Settings (API Key, Base URL)
- POST /api/ai/chat requires this stored config + prompt
