import { useStore } from '../store/useStore'

export const themes = {
  light: {
    bg:           '#F7F7F8',
    bgSurface:    '#FFFFFF',
    bgSecondary:  '#F5F5F5',
    text:         '#111111',
    textSecondary:'#666666',
    textMuted:    '#999999',
    border:       '#E8E8E8',
    borderLight:  '#E0E0E0',
    accent:       '#2563EB',
    accentHover:  '#1D4ED8',
    accentLight:  '#DBEAFE',
    sidebarBg:    '#1A1A2E',
    sidebarActive:'#2563EB',
    sidebarBorder:'rgba(255,255,255,0.08)',
    topbarBg:     '#FFFFFF',
    topbarBorder: '#E8E8E8',
  },
  dark: {
    bg:           '#111111',
    bgSurface:    '#1C1C1C',
    bgSecondary:  '#242424',
    text:         '#F0F0F0',
    textSecondary:'#A0A0A0',
    textMuted:    '#666666',
    border:       '#2A2A2A',
    borderLight:  '#333333',
    accent:       '#3B82F6',
    accentHover:  '#2563EB',
    accentLight:  '#1E3A5F',
    sidebarBg:    '#0F0F1A',
    sidebarActive:'#2563EB',
    sidebarBorder:'rgba(255,255,255,0.06)',
    topbarBg:     '#1C1C1C',
    topbarBorder: '#2A2A2A',
  },
}

export function useTheme() {
  const theme = useStore((s) => s.theme)
  return themes[theme]
}
