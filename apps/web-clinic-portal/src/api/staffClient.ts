/**
 * Staff API Client
 *
 * Endpoints aligned with backend-auth Users API
 * Base URL: http://localhost:3301
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';
import type {
  StaffDto,
  PaginatedStaffResponse,
  ListStaffQueryDto,
  CreateStaffDto,
  UpdateStaffDto,
  StaffStatsDto,
} from '../types/staff.types';

const authApi = createApiClient(env.AUTH_API_URL);

export const staffClient = {
  /**
   * GET /users
   * List all staff members with filtering and pagination
   */
  async list(query: ListStaffQueryDto = {}): Promise<PaginatedStaffResponse> {
    const params = new URLSearchParams();

    if (query.status) params.append('status', query.status);
    if (query.role) params.append('role', query.role);
    if (query.search) params.append('search', query.search);
    if (query.clinicId) params.append('clinicId', query.clinicId);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response = await authApi.get<PaginatedStaffResponse>(url);
    return response.data;
  },

  /**
   * GET /users/:id
   * Get staff member by ID
   */
  async getById(id: string): Promise<StaffDto> {
    const response = await authApi.get<StaffDto>(`/users/${id}`);
    return response.data;
  },

  /**
   * POST /users
   * Create a new staff member
   */
  async create(data: CreateStaffDto): Promise<StaffDto> {
    const response = await authApi.post<StaffDto>('/users', data);
    return response.data;
  },

  /**
   * PATCH /users/:id
   * Update staff member
   */
  async update(id: string, data: UpdateStaffDto): Promise<StaffDto> {
    const response = await authApi.patch<StaffDto>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * POST /users/:id/activate
   * Activate a staff member
   */
  async activate(id: string): Promise<void> {
    await authApi.post(`/users/${id}/activate`);
  },

  /**
   * POST /users/:id/deactivate
   * Deactivate a staff member
   */
  async deactivate(id: string): Promise<void> {
    await authApi.post(`/users/${id}/deactivate`);
  },

  /**
   * DELETE /users/:id
   * Delete (soft-delete) a staff member
   */
  async delete(id: string): Promise<void> {
    await authApi.delete(`/users/${id}`);
  },

  /**
   * GET /users/stats/overview
   * Get staff statistics
   */
  async getStats(): Promise<StaffStatsDto> {
    const response = await authApi.get<StaffStatsDto>('/users/stats/overview');
    return response.data;
  },
};
