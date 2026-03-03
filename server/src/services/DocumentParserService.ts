
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

export class DocumentParserService {
    /**
     * Parses a buffer into plain text based on its mime type or filename extension.
     */
    static async parse(buffer: Buffer, filename: string, mimeType?: string): Promise<string> {
        const ext = filename.split('.').pop()?.toLowerCase();

        try {
            if (ext === 'pdf' || mimeType === 'application/pdf') {
                const data = await (pdf as any)(buffer);
                return data.text.replace(/\s+/g, ' ').trim();
            }

            if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer });
                return result.value.replace(/\s+/g, ' ').trim();
            }

            if (ext === 'json' || mimeType === 'application/json') {
                const json = JSON.parse(buffer.toString('utf-8'));
                return JSON.stringify(json, null, 2);
            }

            // Default to UTF-8 text for .txt, .md, or unknown formats
            return buffer.toString('utf-8').replace(/\s+/g, ' ').trim();
        } catch (error: any) {
            console.error(`[DocumentParserService] Failed to parse ${filename}:`, error);
            throw new Error(`Failed to parse ${ext?.toUpperCase() || 'document'}: ${error.message}`);
        }
    }
}
