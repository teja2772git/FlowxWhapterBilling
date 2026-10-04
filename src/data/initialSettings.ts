import type { AppSettings } from '../types/settings';

export const INITIAL_SETTINGS: AppSettings = {
  restaurantName: 'FLOW',
  restaurantTagline: 'FLAVOURS ON WHEELS',
  currency: 'INR',
  currencySymbol: '₹',
  taxEnabled: false,
  taxPercentage: 0,
  receiptFooterText: 'Thank you for visiting FLOW! Follow us for catering & food truck updates.',
  
  // Smart Priority Tuning Defaults
  priorityAgingWeight: 1.0,
  priorityWorkloadWeight: 4.0,
  priorityCompletionWeight: 10.0,
  maxWorkloadScore: 40,
  starvationThresholdMinutes: 15,
  starvationBoostPerMin: 3,

  // Graph API defaults
  msGraphEnabled: false,
  msGraphTenantId: '',
  msGraphClientId: '',
  msGraphDriveItemId: '',
  msGraphFileName: 'Flow_POS_Database.xlsx',
};
