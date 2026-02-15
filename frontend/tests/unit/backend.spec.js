import { describe, it, expect, vi } from 'vitest';
import { formatImageUrl } from '../../src/api/backend.js';

describe('formatImageUrl', () => {
    it('should return empty string if url is falsy', () => {
        expect(formatImageUrl(null)).toBe('');
        expect(formatImageUrl(undefined)).toBe('');
        expect(formatImageUrl('')).toBe('');
    });

    it('should return absolute URL as is', () => {
        const url = 'https://example.com/image.png';
        expect(formatImageUrl(url)).toBe(url);
    });

    it('should prepend API_URL to relative paths starting with /', () => {
        const url = '/assets/images/shell.png';
        // We need to know what API_URL resolves to in the test environment.
        // Since we can't easily mock the module-level constant without complex hoisting,
        // we assume the default or configured value.
        // However, in a unit test environment, import.meta.env might be different.
        // Let's check if the function logic holds.

        const result = formatImageUrl(url);
        // It should start with http (default) or whatever VITE_API_URL is.
        // We'll check that it starts with http and ends with the path.
        expect(result).toMatch(/^http/);
        expect(result).toMatch(/\/assets\/images\/shell.png$/);
    });

    it('should return relative paths without / as is (legacy behavior/safety)', () => {
        const url = 'assets/images/shell.png';
        expect(formatImageUrl(url)).toBe(url);
    });
});
