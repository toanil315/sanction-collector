import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Browser, chromium, Page } from 'playwright';
import {
  EU_SANCTION_ENTITIES_URL,
  EU_SANCTION_INDIVIDUALLY_URL,
  GRID_NEXT_ACTION_LOCATOR,
  GRID_ROW_LOCATOR,
  LOADING_LOCATOR,
  SANCTION_FLUSH_BATCH_SIZE,
} from './eu-sanction.constant';
import { EuSanctionRepository } from './eu-sanction.repository';
import { EuSanctionEntity } from './eu-sanction.entity';

@Injectable()
@Processor('eu-sanction-queue')
export class EuSanctionProcessor implements OnModuleDestroy {
  private browser: Browser;

  constructor(private euSanctionRepository: EuSanctionRepository) {}

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  @Process('sync-sanction')
  async synchronizeDataset(job: Job<void>) {
    console.log('start sync eu sanctions');
    await this.initBrowser();
    await this.syncSanctions(EU_SANCTION_ENTITIES_URL, 'entity');
    await this.syncSanctions(EU_SANCTION_INDIVIDUALLY_URL, 'individual');
    console.log('finished sync eu sanction');
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

  private async syncSanctions(url: string, schema: 'entity' | 'individual') {
    console.log(`start sync ${schema} sanctions`);
    const context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
    });
    const page = await context.newPage();
    await page.goto(url);
    await this.waitForContentLoaded(page);

    let flushBatch = [];

    while (true) {
      const rawSanctions = await this.getSanctionsPerPage(page);
      const sanctions = rawSanctions.map((raw) =>
        this.mapToSanction(raw, schema),
      );
      flushBatch = flushBatch.concat(sanctions);
      if (flushBatch.length >= SANCTION_FLUSH_BATCH_SIZE) {
        console.log('start flushing sanctions');
        await this.euSanctionRepository.bulkUpsert(flushBatch);
        console.log('finish flushing sanctions');
        flushBatch = [];
      }

      let hasNextPage = await this.hasNextPage(page);
      if (hasNextPage) {
        await page.click(GRID_NEXT_ACTION_LOCATOR);
      } else {
        break;
      }
    }

    if (flushBatch.length) {
      console.log('start flushing sanctions');
      await this.euSanctionRepository.bulkUpsert(flushBatch);
      console.log('finish flushing sanctions');
    }

    console.log(`finish sync ${schema} sanctions`);
  }

  private async waitForContentLoaded(page: Page) {
    await page.waitForSelector(LOADING_LOCATOR, {
      state: 'detached',
      timeout: 30000, // 30s
    });
  }

  private async getSanctionsPerPage(page: Page) {
    const rows = page.locator(GRID_ROW_LOCATOR);
    const allRowsData: string[][] = [];
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('.grid-cell');

      // Extract the href attribute from the first cell (anchor tag)
      const firstCellHref = await cells.nth(0).getAttribute('href');

      const cellData = await cells.allTextContents();

      allRowsData.push([firstCellHref, ...cellData]);
    }

    return allRowsData;
  }

  private async hasNextPage(page: Page) {
    const nextAction = page.locator(GRID_NEXT_ACTION_LOCATOR);
    const className = await nextAction.getAttribute('class');

    if (className && className.includes('disabled')) return false;

    return true;
  }

  private mapToSanction(
    raw: string[],
    schema: 'entity' | 'individual',
  ): Partial<EuSanctionEntity> {
    if (schema === 'entity') {
      const [href, name, date, regime, type] = raw;
      return {
        url: href,
        name,
        designationDate: date,
        regime,
        schema,
        sanctionType: type,
      };
    } else {
      const [href, name, date, nat, regime, type] = raw;
      return {
        url: href,
        name,
        designationDate: date,
        regime,
        schema,
        sanctionType: type,
        nationality: nat,
      };
    }
  }
}
