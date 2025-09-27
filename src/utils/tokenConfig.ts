// Legacy compatibility file - redirects to new tokenRegistry
// This file is kept for backward compatibility during migration
export * from './tokenRegistry';

// Re-export the legacy interface for backward compatibility
export type TokenConfig = import('./tokenRegistry').TokenPair; 