import { isDemoMode } from "@/utils/constants/registry"
import { databaseRegistryService } from "./database-registry.service"
import { demoRegistryService } from "./demo-registry.service"
import type { IRegistryService } from "./registry-service.interface"

export function getRegistryService(): IRegistryService {
	if (isDemoMode()) {
		return demoRegistryService
	}
	return databaseRegistryService
}

export const defaultRegistryService = getRegistryService()
