import type { AppSettings } from '../types/settings';
import { type ExcelDatabase, buildWorkbookFromData } from './excelService';
import * as XLSX from 'xlsx';

export interface MSGraphSyncResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export class MSGraphAdapter {
  private settings: AppSettings;

  constructor(settings: AppSettings) {
    this.settings = settings;
  }

  public isConfigured(): boolean {
    return (
      this.settings.msGraphEnabled &&
      Boolean(this.settings.msGraphTenantId) &&
      Boolean(this.settings.msGraphClientId) &&
      Boolean(this.settings.msGraphDriveItemId)
    );
  }

  public async uploadWorkbookToCloud(
    data: ExcelDatabase,
    accessToken?: string
  ): Promise<MSGraphSyncResult> {
    if (!this.settings.msGraphEnabled) {
      return {
        success: false,
        message: 'Microsoft Graph Integration is currently disabled in Settings. Using Local Excel Persistence.',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    if (!accessToken) {
      return {
        success: true,
        message: `[Dev Mode Adapter] Ready to sync "${this.settings.msGraphFileName}" with Graph API endpoint for Drive Item ID "${this.settings.msGraphDriveItemId || 'sample-item-id'}". (Local Excel buffer updated)`,
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    try {
      const wb = buildWorkbookFromData(data);
      const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${this.settings.msGraphDriveItemId}/content`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: `Workbook successfully synced with OneDrive via Microsoft Graph API!`,
        timestamp: new Date().toLocaleTimeString(),
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Graph API Sync error: ${err.message || String(err)}`,
        timestamp: new Date().toLocaleTimeString(),
      };
    }
  }
}
