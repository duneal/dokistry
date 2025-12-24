import type { SVGProps } from "react"

type FlagProps = SVGProps<SVGSVGElement> & {
	className?: string
}

const flagStyles = "rounded-sm"

export function FlagGB({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 30" className={`${flagStyles} ${className}`} {...props}>
			<clipPath id="gb-clip">
				<path d="M0,0 v30 h60 v-30 z" />
			</clipPath>
			<path d="M0,0 v30 h60 v-30 z" fill="#012169" clipPath="url(#gb-clip)" />
			<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#gb-clip)" />
			<path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#gb-clip)" />
			<path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" clipPath="url(#gb-clip)" />
			<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" clipPath="url(#gb-clip)" />
		</svg>
	)
}

export function FlagFR({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="20" height="40" fill="#002395" />
			<rect x="20" width="20" height="40" fill="#fff" />
			<rect x="40" width="20" height="40" fill="#ED2939" />
		</svg>
	)
}

export function FlagES({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#AA151B" />
			<rect y="10" width="60" height="20" fill="#F1BF00" />
		</svg>
	)
}

export function FlagDE({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 36" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="12" fill="#000" />
			<rect y="12" width="60" height="12" fill="#DD0000" />
			<rect y="24" width="60" height="12" fill="#FFCE00" />
		</svg>
	)
}

export function FlagBR({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 42" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="42" fill="#009c3b" />
			<polygon points="30,4 56,21 30,38 4,21" fill="#ffdf00" />
			<circle cx="30" cy="21" r="9" fill="#002776" />
		</svg>
	)
}

export function FlagCN({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#DE2910" />
			<g fill="#FFDE00">
				<polygon points="12,6 14,12 10,8 14,8 10,12" />
				<polygon points="20,3 21,5 19,4 21,4 19,5" />
				<polygon points="23,6 24,8 22,7 24,7 22,8" />
				<polygon points="23,11 24,13 22,12 24,12 22,13" />
				<polygon points="20,14 21,16 19,15 21,15 19,16" />
			</g>
		</svg>
	)
}

export function FlagJP({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#fff" />
			<circle cx="30" cy="20" r="12" fill="#BC002D" />
		</svg>
	)
}

export function FlagKR({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#fff" />
			<circle cx="30" cy="20" r="10" fill="#C60C30" />
			<path d="M30,10 A10,10 0 0,0 30,30 A5,5 0 0,0 30,20 A5,5 0 0,1 30,10" fill="#003478" />
		</svg>
	)
}

export function FlagIT({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="20" height="40" fill="#009246" />
			<rect x="20" width="20" height="40" fill="#fff" />
			<rect x="40" width="20" height="40" fill="#CE2B37" />
		</svg>
	)
}

export function FlagRU({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="13.33" fill="#fff" />
			<rect y="13.33" width="60" height="13.33" fill="#0039A6" />
			<rect y="26.66" width="60" height="13.34" fill="#D52B1E" />
		</svg>
	)
}

export function FlagNL({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="13.33" fill="#AE1C28" />
			<rect y="13.33" width="60" height="13.33" fill="#fff" />
			<rect y="26.66" width="60" height="13.34" fill="#21468B" />
		</svg>
	)
}

export function FlagPL({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="20" fill="#fff" />
			<rect y="20" width="60" height="20" fill="#DC143C" />
		</svg>
	)
}

export function FlagSE({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#006AA7" />
			<rect x="18" width="6" height="40" fill="#FECC00" />
			<rect y="16" width="60" height="8" fill="#FECC00" />
		</svg>
	)
}

export function FlagTR({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#E30A17" />
			<circle cx="22" cy="20" r="10" fill="#fff" />
			<circle cx="25" cy="20" r="8" fill="#E30A17" />
			<polygon points="32,20 36,22 34,18 38,20 34,22" fill="#fff" />
		</svg>
	)
}

export function FlagUA({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="20" fill="#005BBB" />
			<rect y="20" width="60" height="20" fill="#FFD500" />
		</svg>
	)
}

export function FlagSA({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#006C35" />
			<text x="30" y="22" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="serif">
				العربية
			</text>
			<path d="M20,28 L40,28" stroke="#fff" strokeWidth="2" />
		</svg>
	)
}

export function FlagIN({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="13.33" fill="#FF9933" />
			<rect y="13.33" width="60" height="13.33" fill="#fff" />
			<rect y="26.66" width="60" height="13.34" fill="#138808" />
			<circle
				cx="30"
				cy="20"
				r="4"
				fill="#000080"
				fillOpacity="0"
				stroke="#000080"
				strokeWidth="0.8"
			/>
		</svg>
	)
}

export function FlagVN({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="40" fill="#DA251D" />
			<polygon points="30,8 33,18 44,18 35,24 38,34 30,28 22,34 25,24 16,18 27,18" fill="#FFFF00" />
		</svg>
	)
}

export function FlagID({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="20" fill="#FF0000" />
			<rect y="20" width="60" height="20" fill="#fff" />
		</svg>
	)
}

export function FlagCZ({ className = "", ...props }: FlagProps) {
	return (
		<svg viewBox="0 0 60 40" className={`${flagStyles} ${className}`} {...props}>
			<rect width="60" height="20" fill="#fff" />
			<rect y="20" width="60" height="20" fill="#D7141A" />
			<polygon points="0,0 30,20 0,40" fill="#11457E" />
		</svg>
	)
}

export const flags = {
	en: FlagGB,
	fr: FlagFR,
	es: FlagES,
	de: FlagDE,
	pt: FlagBR,
	zh: FlagCN,
	ja: FlagJP,
	ko: FlagKR,
	it: FlagIT,
	ru: FlagRU,
	nl: FlagNL,
	pl: FlagPL,
	sv: FlagSE,
	tr: FlagTR,
	uk: FlagUA,
	ar: FlagSA,
	hi: FlagIN,
	vi: FlagVN,
	id: FlagID,
	cs: FlagCZ,
} as const

export type FlagCode = keyof typeof flags
