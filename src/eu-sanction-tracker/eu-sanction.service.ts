import { writeFileSync } from 'fs';
import {
  EuSanctionMapEntity,
  RegimeData,
  RegimeItem,
} from './eu-sanction.entity';
import { EuSanctionDataTransformerFileSaver } from './eu-sanction.mapper';
import { Injectable } from '@nestjs/common';

// Refer: https://github.com/opensanctions/opensanctions/blob/main/datasets/eu/sanctions_map/crawler.py
@Injectable()
export class EuSanctionMapService {
  DATA_URL = 'https://www.sanctionsmap.eu/api/v1/data?';
  REGIME_URL = 'https://www.sanctionsmap.eu/api/v1/regime';

  constructor(
    private euSanctionDataTransformerFileSaver: EuSanctionDataTransformerFileSaver,
  ) {}

  async crawData() {
    console.log('Start crawling eu sanctions');
    try {
      const regime = await this.fetchJson<{ data: RegimeItem[] }>(
        this.REGIME_URL,
      );

      for (const item of regime.data) {
        const regimeUrl = `${this.REGIME_URL}/${item.id}`;
        const regimeData = await this.fetchJson<{ data: RegimeData }>(
          regimeUrl,
        );
        const measures = regimeData.data.measures.data;

        for (const measure of measures) {
          for (const measureList of measure.lists.data) {
            for (const member of measureList.members.data) {
              const sanctionEntity = new EuSanctionMapEntity(
                member.data || member,
                regimeData.data,
              );
              await this.euSanctionDataTransformerFileSaver.mapAndSaveEUSanctionToFTM(
                sanctionEntity,
              );
            }
          }
        }
      }

      console.log('Sanctions data saved !!!');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch: ${response.statusText}`);
    return response.json();
  }

  private writeToFile(filename: string, data: any) {
    try {
      writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write file:', error);
    }
  }
}
