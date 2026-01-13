/**
 * Utility for parsing Excel files for word import
 * Matches the structure created by exportToExcel in generateDocument.ts
 */

export interface ParsedWord {
    word: string;
    definition: string;
}

/**
 * Parse an Excel file and extract words and definitions
 * Expected format: Column 1 = Word, Columns 2+ = Definition 1, Definition 2, etc.
 * @param file - The Excel file to parse
 * @returns Promise resolving to array of parsed words
 */
export const parseExcelFile = async (file: File): Promise<ParsedWord[]> => {
    try {
        // Dynamically import xlsx to avoid bundling issues
        const XLSX = await import('xlsx');

        // Read the file as array buffer
        const arrayBuffer = await file.arrayBuffer();

        // Parse the workbook
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
            throw new Error('No worksheet found in Excel file');
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to JSON
        // This will give us an array of objects where keys are column headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Use array of arrays instead of objects
            defval: '' // Default value for empty cells
        }) as any[][];

        if (jsonData.length < 2) {
            throw new Error('Excel file must have at least a header row and one data row');
        }

        // First row is headers
        const headers = jsonData[0];

        // Find word column (should be first column)
        const wordColumnIndex = 0;

        // Find definition columns (all columns after the word column)
        const definitionColumnIndices: number[] = [];
        for (let i = 1; i < headers.length; i++) {
            const header = String(headers[i]).toLowerCase();
            if (header.includes('definition') || header.includes('definición') ||
                header.includes('définition') || header.includes('definizione') ||
                header.includes('definição')) {
                definitionColumnIndices.push(i);
            }
        }

        // If no definition columns found, assume all columns after first are definitions
        if (definitionColumnIndices.length === 0) {
            for (let i = 1; i < headers.length; i++) {
                definitionColumnIndices.push(i);
            }
        }

        // Parse data rows (skip header row)
        const parsedWords: ParsedWord[] = [];

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Get word from first column
            const word = String(row[wordColumnIndex] || '').trim();

            // Skip empty rows
            if (!word) continue;

            // Collect all definitions from definition columns
            const definitions: string[] = [];
            for (const defIndex of definitionColumnIndices) {
                const def = String(row[defIndex] || '').trim();
                if (def) {
                    definitions.push(def);
                }
            }

            // Combine all definitions into one string, or use empty string if none
            const definition = definitions.length > 0
                ? definitions.join('; ')
                : '';

            parsedWords.push({
                word,
                definition
            });
        }

        return parsedWords;

    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error('Failed to parse Excel file. Please ensure it matches the export format.');
    }
};

/**
 * Validate if a file is a valid Excel file
 * @param file - The file to validate
 * @returns true if file is valid Excel format
 */
export const isValidExcelFile = (file: File): boolean => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
};
