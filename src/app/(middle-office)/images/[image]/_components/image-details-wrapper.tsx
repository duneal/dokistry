"use client"

import { useState } from "react"
import type { Repository } from "@/utils/types/registry.interface"
import ImageDetails from "./image-details"

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
	const [repository, setRepository] = useState<Repository | undefined>(initialRepository)
	const [error, setError] = useState<string | null>(initialError)

	const refreshData = async () => {
		setError(null)

		try {
			const response = await fetch("/api/registry/repositories")
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const repositoriesData = await response.json()
			const foundRepository = repositoriesData.repositories.find(
				(repo: Repository) => repo.name === imageName,
			)

			if (foundRepository) {
				setRepository(foundRepository)
				setError(null)
			} else {
				setRepository(undefined)
				setError("Repository not found")
			}
		} catch (err) {
			console.error("Failed to refresh registry data:", err)
			setError(err instanceof Error ? err.message : "Failed to refresh registry data")
		}
	}

	return (
		<ImageDetails
			repository={repository}
			error={error}
			imageName={imageName}
			onRefresh={refreshData}
		/>
	)
}
