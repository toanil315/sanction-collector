export const EU_SANCTION_BASE_URL =
  'https://data.europa.eu/apps/eusanctionstracker';
export const EU_SANCTION_ENTITIES_URL = `${EU_SANCTION_BASE_URL}/entities`;
export const EU_SANCTION_INDIVIDUALLY_URL = `${EU_SANCTION_BASE_URL}/individuals`;
export const LOADING_LOCATOR = 'body div#spinner';
export const GRID_ROW_LOCATOR =
  '.grid-contents .grid-body .grid-row.has-tooltip';
export const GRID_NEXT_ACTION_LOCATOR =
  'div.grid-pagination-actions a[data-action="next"]';

export const SANCTION_DETAIL_BASE_LOCATOR = '#views--subject #subject-details';

export const SANCTION_EXTRACT_BATCH_SIZE = 10;
export const SANCTION_FLUSH_BATCH_SIZE = 200;
