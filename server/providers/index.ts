import type { IDataProvider } from './DataProvider';
import { ExcelDataProvider } from './ExcelDataProvider';
import { GoogleSheetsDataProvider } from './GoogleSheetsDataProvider';

export function createDataProvider(): IDataProvider {
  const providerType = process.env.DATA_PROVIDER || 'excel';

  if (providerType.toLowerCase() === 'google_sheets') {
    console.log('[DataProvider] Using GoogleSheetsDataProvider');
    return new GoogleSheetsDataProvider();
  }

  console.log('[DataProvider] Using ExcelDataProvider (FLOW_POS.xlsx)');
  return new ExcelDataProvider();
}

export const activeDataProvider = createDataProvider();
export * from './DataProvider';
