
import { MedicalResource, ResourceFilterParams, ResourceReservation } from '@/types';
import { mockResources } from './data/mockData';

export class ResourceService {
  async getResources(filters?: ResourceFilterParams): Promise<MedicalResource[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredResources = [...mockResources];
    
    if (filters) {
      if (filters.type) {
        filteredResources = filteredResources.filter(
          resource => resource.type === filters.type
        );
      }
      
      if (filters.department) {
        filteredResources = filteredResources.filter(
          resource => resource.department === filters.department
        );
      }
      
      if (filters.availableOnly) {
        filteredResources = filteredResources.filter(
          resource => resource.isAvailable === true
        );
      }
    }
    
    return filteredResources;
  }

  async reserveResource(
    resourceId: string,
    requesterId: string,
    requesterRole: 'doctor' | 'staff',
    date: string,
    startTime: string,
    endTime: string,
    quantity: number
  ): Promise<ResourceReservation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In a real implementation, this would update the resource availability
    // Create a mock reservation
    const reservation: ResourceReservation = {
      id: `rr-${Date.now()}`,
      resourceId,
      requesterId,
      requesterRole,
      date,
      startTime,
      endTime,
      quantity,
      status: 'approved',
    };
    
    return reservation;
  }

  async getResourceReservations(resourceId: string): Promise<ResourceReservation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock empty array since we don't have stored reservations
    return [];
  }
}

export const resourceService = new ResourceService();
