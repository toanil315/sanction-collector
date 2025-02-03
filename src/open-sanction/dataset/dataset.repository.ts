import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { DatasetEntity } from './dataset.entity';

@Injectable()
export class DatasetRepository extends Repository<DatasetEntity> {
  constructor(dataSource: DataSource) {
    super(DatasetEntity, dataSource.createEntityManager());
  }

  async bulkUpsert(datasets: Partial<DatasetEntity>[]) {
    const newDatasetMap = datasets.reduce<
      Record<string, Partial<DatasetEntity>>
    >((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {});

    const existingDatasets = await this.findBy({
      name: In(Object.keys(newDatasetMap)),
    });

    for (let i = 0; i < existingDatasets.length; i++) {
      const existingDataset = existingDatasets[i];
      if (
        newDatasetMap[existingDataset.name].url &&
        existingDataset.url !== newDatasetMap[existingDataset.name].url
      ) {
        existingDataset.url = newDatasetMap[existingDataset.name].url;
      }
      if (
        newDatasetMap[existingDataset.name].jsonUrl &&
        existingDataset.jsonUrl !== newDatasetMap[existingDataset.name].jsonUrl
      ) {
        existingDataset.jsonUrl = newDatasetMap[existingDataset.name].jsonUrl;
      }
      newDatasetMap[existingDataset.name] = null;
    }

    await this.save(existingDatasets);
    await this.save(Object.values(newDatasetMap).filter(Boolean));
  }
}
