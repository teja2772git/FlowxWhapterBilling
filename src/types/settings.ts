export interface AppSettings {
  restaurantName: string;
  restaurantTagline: string;
  currency: string;
  currencySymbol: string;
  taxEnabled: boolean;
  taxPercentage: number;
  receiptFooterText: string;
  
  // Smart Priority Engine Tuning
  priorityAgingWeight: number; // multiplier for age in minutes (or formula parameter)
  priorityWorkloadWeight: number; // score per remaining item
  priorityCompletionWeight: number; // penalty/bonus based on completion ratio
  maxWorkloadScore: number; // upper cap for workload score
  starvationThresholdMinutes: number; // minutes after which anti-starvation kicks in aggressively
  starvationBoostPerMin: number; // extra boost points per min beyond threshold

  // Microsoft Graph API Integration Settings
  msGraphEnabled: boolean;
  msGraphTenantId: string;
  msGraphClientId: string;
  msGraphDriveItemId: string;
  msGraphFileName: string;
}

export type SettingsKey = keyof AppSettings;
