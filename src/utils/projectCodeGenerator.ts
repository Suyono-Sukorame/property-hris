/**
 * Utility functions for auto-generating project codes
 * Format: GBR-{CATEGORY_CODE}-{SEQUENCE}
 * Example: GBR-PRM-01, GBR-RKO-02
 */

import { PropertySite } from '@/types/hris';
import { supabase } from '@/lib/supabase';

/**
 * Mapping kategori proyek ke kode singkat (3 huruf)
 */
export const CATEGORY_CODE_MAP: Record<string, string> = {
  'Perumahan': 'PRM',
  'Ruko / Komersial': 'RKO',
  'Tanah Kavling': 'KVL',
  'Kantor': 'KTR',
  'Mixed-Use Residential': 'MXU',
  'High-Rise Commercial': 'HRS',
  'Township Masterplan': 'TWN',
  'Corporate Head Office': 'CRP',
};

/**
 * Prefix perusahaan (bisa diubah sesuai branding)
 */
export const COMPANY_PREFIX = 'GBR'; // Griya Bumi Raya

/**
 * Get category code dari nama kategori
 */
export function getCategoryCode(category: string): string {
  return CATEGORY_CODE_MAP[category] || 'UNK';
}

/**
 * Extract sequence number dari kode proyek
 * Example: "GBR-PRM-01" -> 1
 */
export function extractSequenceNumber(code: string): number {
  const parts = code.split('-');
  if (parts.length !== 3) return 0;
  const numStr = parts[2];
  return parseInt(numStr, 10) || 0;
}

/**
 * Find last sequence number untuk kategori tertentu
 * dari array existing sites
 */
export function findLastSequenceByCategory(
  sites: PropertySite[],
  category: string
): number {
  const categoryCode = getCategoryCode(category);
  const prefix = `${COMPANY_PREFIX}-${categoryCode}-`;

  // Filter sites dengan kategori yang sama
  const sameCategorySites = sites.filter((site) =>
    site.code.startsWith(prefix)
  );

  if (sameCategorySites.length === 0) return 0;

  // Extract semua sequence numbers
  const sequences = sameCategorySites
    .map((site) => extractSequenceNumber(site.code))
    .filter((num) => num > 0);

  // Return max sequence
  return sequences.length > 0 ? Math.max(...sequences) : 0;
}

export function formatProjectCode(category: string, sequence: number): string {
  return `${COMPANY_PREFIX}-${getCategoryCode(category)}-${sequence.toString().padStart(2, '0')}`;
}

/**
 * Generate kode proyek baru berdasarkan kategori
 * dan existing sites
 */
export function generateProjectCode(
  category: string,
  existingSites: PropertySite[]
): string {
  const lastSequence = findLastSequenceByCategory(existingSites, category);
  return formatProjectCode(category, lastSequence + 1);
}

export async function fetchNextProjectCode(category: string): Promise<string> {
  const prefix = `${COMPANY_PREFIX}-${getCategoryCode(category)}-`;
  const { data, error } = await supabase
    .from('property_sites')
    .select('code')
    .like('code', `${prefix}%`);

  if (error) throw error;

  const lastSequence = (data ?? []).reduce(
    (max, row) => Math.max(max, extractSequenceNumber(row.code)),
    0
  );

  return formatProjectCode(category, lastSequence + 1);
}

/**
 * Validate format kode proyek
 * Return true jika format benar
 */
export function isValidProjectCode(code: string): boolean {
  // Format: XXX-YYY-NN
  const regex = /^[A-Z]{3}-[A-Z]{3}-\d{2,}$/;
  return regex.test(code);
}

/**
 * Check apakah kode sudah digunakan
 */
export function isCodeDuplicate(
  code: string,
  existingSites: PropertySite[],
  excludeId?: string
): boolean {
  return existingSites.some(
    (site) => site.code === code && site.id !== excludeId
  );
}
