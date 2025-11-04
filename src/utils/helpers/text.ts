/**
 ** Function to prevent breaking a line between two words
 ** @param {string} text
 ** @param {string} word1
 ** @param {string} word2
 ** @returns {string} text with non-breaking space
 */
export const addNonBreakingSpace = (text: string, word1: string, word2: string): string => {
	const regex = new RegExp(`(${word1})\\s(${word2})`, "i")
	return text.replace(regex, `$1\u00A0$2`)
}

/**
 ** Function to prevent breaking a line between specified pairs of words
 ** @param {string} text - The original text
 ** @param {[string, string][]} wordPairs - Array of word pairs to join with non-breaking spaces
 ** @returns {string} text with non-breaking spaces between specified word pairs
 */
export const addNonBreakingSpaces = (text: string, wordPairs: [string, string][]): string => {
	wordPairs.forEach(([word1, word2]) => {
		const regex = new RegExp(`(${word1})\\s(${word2})`, "gi")
		text = text.replace(regex, `$1\u00A0$2`)
	})
	return text
}

/**
 * Function to capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalizeFirstLetter = (str: string): string => {
	if (str.length === 0) return str // Handle empty strings
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Function to remove a given part of a string
 * @param {string} str - The string to modify
 * @param {string} partToRemove - The part to remove from the string
 * @returns {string} The string with the specified part removed
 *
 * @example
 * const result = removeFromString('https://example.com', 'https://');
 * // Returns: 'example.com'
 */
export const removeFromString = (str: string, partToRemove: string): string => {
	if (!str || !partToRemove) return str
	return str.replace(new RegExp(partToRemove.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "")
}
