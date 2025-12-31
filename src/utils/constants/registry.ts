export const REGISTRY_CONFIG = {
	REGISTRY_URL: process.env.REGISTRY_URL || "",
	USERNAME: process.env.REGISTRY_USERNAME || "",
	PASSWORD: process.env.REGISTRY_PASSWORD || "",
} as const

export const isDemoMode = (): boolean => {
	return process.env.REGISTRY_DEMO_MODE === "true" || process.env.DEMO_MODE === "true"
}

// Validation function to check if all required environment variables are set
export const validateRegistryConfig = (): boolean => {
	return !!(REGISTRY_CONFIG.REGISTRY_URL && REGISTRY_CONFIG.USERNAME && REGISTRY_CONFIG.PASSWORD)
}

export const REQUIRED_ENV_VARS = ["REGISTRY_URL", "REGISTRY_USERNAME", "REGISTRY_PASSWORD"] as const
