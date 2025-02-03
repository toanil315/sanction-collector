import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { SanctionRepository } from './sanction.repository';
import { SanctionEntity } from './sanction.entity';
import { SANCTION_BATCH_SIZE } from './sanction.constant';
import { DatasetService } from '../dataset/dataset.service';
import { DatasetEntity } from '../dataset/dataset.entity';

@Injectable()
@Processor('sanction-queue')
export class SanctionProcessor {
  constructor(
    private datasetService: DatasetService,
    private sanctionRepository: SanctionRepository,
  ) {}

  @Process('sync-sanction')
  async synchronizeSanctions(job: Job<void>) {
    console.log('start sync sanctions');
    const datasets = await this.datasetService.getAll();
    for (const dataset of datasets) {
      await this.processJsonFile(dataset);
    }
    console.log('finish sync sanctions');
  }

  private async processJsonFile(dataset: DatasetEntity) {
    console.log('start proceed json for dataset ', dataset.name);
    const response = await fetch(dataset.jsonUrl);

    const reader = response.body.getReader();
    const decoder = new TextDecoder(); // Decodes Uint8Array to string

    let buffer = ''; // Buffer to hold incomplete chunks
    let done = false;
    let batchSanction: Partial<SanctionEntity>[] = [];

    while (!done) {
      // Read the next chunk from the stream
      const { value, done: streamDone } = await reader.read();
      done = streamDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });

        // Process lines in the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          const sanctionEntity = this.mapRawValueToSanctionEntity(
            JSON.parse(line),
            dataset,
          );
          batchSanction.push(sanctionEntity);
          if (batchSanction.length === SANCTION_BATCH_SIZE) {
            console.log('start flushing sanctions');
            await this.sanctionRepository.bulkUpsert(batchSanction);
            console.log('finish flushing sanctions');
            batchSanction = [];
          }
          buffer = buffer.slice(newlineIndex + 1);
        }
      }
    }

    if (batchSanction.length) {
      console.log('start flushing sanctions');
      await this.sanctionRepository.bulkUpsert(batchSanction);
      console.log('finish flushing sanctions');
    }

    reader.releaseLock();
    console.log('finish proceed json for dataset ', dataset.name);
  }

  private mapRawValueToSanctionEntity(
    raw: Record<string, any>,
    dataset: DatasetEntity,
  ): Partial<SanctionEntity> {
    return {
      externalId: raw.id,
      name: raw.caption,
      schema: raw.schema,
      datasetId: dataset.id,
      lastChange: raw.last_change,
      properties: raw.properties,
    };
  }
}
