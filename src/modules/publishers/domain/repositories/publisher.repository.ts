import { Publisher } from '@/modules/publishers/domain/entities';
import { PublisherFilters } from '@/modules/publishers/infrastructure/types/publisher.filters';

export interface PublisherRepository {
  getPublisherById(id: string): Promise<Publisher | null>;
  getAllPublishers(): Promise<Publisher[]>;
  getPublishersByFilters(filters: PublisherFilters): Promise<Publisher[]>;
  createPublisher(publisher: Publisher): Promise<Publisher | null>;
  updatePublisher(id: string, Publisher: Publisher): Promise<Publisher | null>;
  deletePublisher(id: string): Promise<boolean>;
  togglePublisherStatus(id: string): Promise<boolean>;
}
