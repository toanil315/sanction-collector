import { writeFileSync } from 'fs';
import {
  EuSanctionMapEntity,
  RegimeData,
  RegimeItem,
} from './eu-sanction.entity';

// Refer: https://github.com/opensanctions/opensanctions/blob/main/datasets/eu/sanctions_map/crawler.py
export class EuSanctionMapService {
  DATA_URL = 'https://www.sanctionsmap.eu/api/v1/data?';
  REGIME_URL = 'https://www.sanctionsmap.eu/api/v1/regime';

  async crawData() {
    console.log('Start crawling eu sanctions');
    try {
      const regime = await this.fetchJson<{ data: RegimeItem[] }>(
        this.REGIME_URL,
      );

      const sanctionsList: EuSanctionMapEntity[] = [];

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
                regimeData.data.country.data.title,
              );
              sanctionsList.push(sanctionEntity);
            }
          }
        }
      }

      // Write to file
      this.writeToFile('sanctions_list.json', sanctionsList);
      console.log('Sanctions data saved to sanctions_list.json');
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
