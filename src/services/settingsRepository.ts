import type { AppSettings, SettingsKey } from '../types/settings';

export class SettingsRepository {
  private settings: AppSettings;
  private onDataChanged: () => void;

  constructor(initialSettings: AppSettings, onDataChanged: () => void) {
    this.settings = { ...initialSettings };
    this.onDataChanged = onDataChanged;
  }

  public updateData(settings: AppSettings) {
    this.settings = { ...settings };
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSetting<K extends SettingsKey>(key: K, value: AppSettings[K]): AppSettings {
    this.settings = {
      ...this.settings,
      [key]: value,
    };
    this.onDataChanged();
    return { ...this.settings };
  }

  public updateAllSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };
    this.onDataChanged();
    return { ...this.settings };
  }
}
