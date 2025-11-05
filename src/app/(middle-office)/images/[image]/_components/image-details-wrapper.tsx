"use client"

import type { Repository } from "@/utils/types/registry.interface"
import ImageDetails from "./image-details"
import { useImageDetailsWrapper } from "./use-image-details-wrapper"

interface ImageDetailsWrapperProps {
	initialRepository: Repository | undefined
	initialError: string | null
	imageName: string
}

export default function ImageDetailsWrapper({
	initialRepository,
	initialError,
	imageName,
}: ImageDetailsWrapperProps) {
	const { repository, error, refreshData } = useImageDetailsWrapper({
		initialRepository,
		initialError,
		imageName,
	})

	return (
		<ImageDetails
			repository={repository}
			error={error}
			imageName={imageName}
			onRefresh={refreshData}
		/>
	)
}
