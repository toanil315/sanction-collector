import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Browser, chromium } from 'playwright';
import {
  DATASET_BATCH_SIZE,
  DATASET_LOCATOR,
  DATASET_URL,
  ENTITIES_JSON_FILE_URL_LOCATOR,
  OPEN_SANCTION_BASE_URL,
} from './dataset.constant';
import { DatasetRepository } from './dataset.repository';

@Injectable()
@Processor('dataset-queue')
export class DatasetProcessor implements OnModuleDestroy {
  private browser: Browser;

  constructor(private datasetRepository: DatasetRepository) {}

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  @Process('sync-dataset')
  async synchronizeDataset(job: Job<void>) {
    await this.initBrowser();
    console.log('running get datasets');
    const datasetDetails = await this.getAllAvailableDatasets();
    console.log('finished get datasets');
    console.log('running get json file url');
    for (
      let i = 0;
      i < Math.ceil(datasetDetails.length / DATASET_BATCH_SIZE);
      i++
    ) {
      const batch = datasetDetails.slice(
        i * DATASET_BATCH_SIZE,
        (i + 1) * DATASET_BATCH_SIZE,
      );
      const jsonFileUrls = await Promise.all(
        batch.map((dataset) =>
          this.getEntitiesJsonFileUrlOfDataset(dataset.url),
        ),
      );
      await this.datasetRepository.bulkUpsert(
        batch.map((dataset, idx) => ({
          ...dataset,
          jsonUrl: jsonFileUrls[idx],
        })),
      );
      console.log(
        `finish save batch from ${i * DATASET_BATCH_SIZE} to ${(i + 1) * DATASET_BATCH_SIZE}`,
      );
    }

    console.log('finished get json file url');
  }

  private async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  private async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async getAllAvailableDatasets() {
    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(`${OPEN_SANCTION_BASE_URL}${DATASET_URL}`);
      const datasets = await page.locator(DATASET_LOCATOR);

      const datasetDetails = await datasets.evaluateAll((elements) =>
        elements.map((element) => ({
          name: element.textContent?.trim() || '',
          url: element.getAttribute('href') || '',
        })),
      );

      return datasetDetails;
    } finally {
      await context.close();
    }
  }

  private async getEntitiesJsonFileUrlOfDataset(datasetUrl: string) {
    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(`${OPEN_SANCTION_BASE_URL}${datasetUrl}`);
      const jsonFileAnchor = await page.locator(ENTITIES_JSON_FILE_URL_LOCATOR);
      const jsonFileLink = await jsonFileAnchor.getAttribute('href');

      return jsonFileLink;
    } finally {
      await context.close();
    }
  }
}
