// Copyright (c) 2018-2024 Coinbase, Inc. <https://www.coinbase.com/>

import { LogoType, walletLogo } from './assets/wallet-logo';
import { CoinbaseWalletProvider } from './CoinbaseWalletProvider';
import { AppMetadata, Preference, ProviderInterface } from './core/provider/interface';
import { LIB_VERSION } from './version';
import { ScopedAsyncStorage } from ':core/storage/ScopedAsyncStorage';
import { getFavicon } from ':core/type/util';

// for backwards compatibility
type CoinbaseWalletSDKOptions = Partial<AppMetadata>;

interface CBWindow {
  top: CBWindow;
  ethereum?: { isCoinbaseBrowser?: boolean };
}

export class CoinbaseWalletSDK {
  private metadata: AppMetadata;

  constructor(metadata: Readonly<CoinbaseWalletSDKOptions>) {
    this.metadata = {
      appName: metadata.appName || 'Dapp',
      appLogoUrl: metadata.appLogoUrl || getFavicon(),
      appChainIds: metadata.appChainIds || [],
    };
    this.storeLatestVersion();
  }

  public makeWeb3Provider(preference: Preference = { options: 'all' }): ProviderInterface {
    try {
      const window = globalThis as CBWindow;
      const ethereum = window.ethereum ?? window.top?.ethereum;
      if (ethereum?.isCoinbaseBrowser) {
        return ethereum as ProviderInterface;
      }
    } catch {
      // Ignore
    }
    return new CoinbaseWalletProvider({ metadata: this.metadata, preference });
  }

  /**
   * Official Coinbase Wallet logo for developers to use on their frontend
   * @param type Type of wallet logo: "standard" | "circle" | "text" | "textWithLogo" | "textLight" | "textWithLogoLight"
   * @param width Width of the logo (Optional)
   * @returns SVG Data URI
   */
  public getCoinbaseWalletLogo(type: LogoType, width = 240): string {
    return walletLogo(type, width);
  }

  private async storeLatestVersion() {
    const versionStorage = new ScopedAsyncStorage('CBWSDK');
    versionStorage.setItem('VERSION', LIB_VERSION);
  }
}
