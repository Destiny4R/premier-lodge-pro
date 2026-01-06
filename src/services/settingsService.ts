import { apiGet, apiPut } from '@/lib/api';
import { ApiResponse } from '@/types/api';

// =====================================================
// Settings Service - Handles hotel settings/customization
// =====================================================

export interface HotelSettings {
  id: string;
  hotelId: string;
  name: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateHotelSettingsRequest {
  name?: string;
  logo?: File | string;
  favicon?: File | string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  phone?: string;
  email?: string;
}

/**
 * GET /api/settings/hotel
 * Get current hotel settings
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     id: string,
 *     hotelId: string,
 *     name: string,
 *     logo: string | null,
 *     favicon: string | null,
 *     primaryColor: string | null,
 *     secondaryColor: string | null,
 *     address: string | null,
 *     phone: string | null,
 *     email: string | null,
 *     createdAt: string,
 *     updatedAt: string
 *   },
 *   message: string,
 *   status: number
 * }
 */
export async function getHotelSettings(): Promise<ApiResponse<HotelSettings>> {
  return await apiGet<HotelSettings>('/settings/hotel');
}

/**
 * PUT /api/settings/hotel
 * Update hotel settings (branding, logo, favicon, name)
 * 
 * Request (FormData):
 * {
 *   name?: string,
 *   logo?: File,        // Image file for hotel logo
 *   favicon?: File,     // Image file for favicon (16x16 or 32x32 recommended)
 *   primaryColor?: string,   // Hex color code e.g., "#D4AF37"
 *   secondaryColor?: string, // Hex color code
 *   address?: string,
 *   phone?: string,
 *   email?: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: HotelSettings,
 *   message: string,
 *   status: number
 * }
 */
export async function updateHotelSettings(data: UpdateHotelSettingsRequest): Promise<ApiResponse<HotelSettings>> {
  const formData = new FormData();
  
  if (data.name) formData.append('name', data.name);
  if (data.logo instanceof File) formData.append('logo', data.logo);
  if (data.favicon instanceof File) formData.append('favicon', data.favicon);
  if (data.primaryColor) formData.append('primaryColor', data.primaryColor);
  if (data.secondaryColor) formData.append('secondaryColor', data.secondaryColor);
  if (data.address) formData.append('address', data.address);
  if (data.phone) formData.append('phone', data.phone);
  if (data.email) formData.append('email', data.email);
  
  return await apiPut<HotelSettings>('/settings/hotel', formData);
}

export const settingsService = {
  getHotelSettings,
  updateHotelSettings,
};
