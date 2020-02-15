import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';

import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import Jazzicon from 'jazzicon';

import Web3 from 'web3';
import { Subject } from 'rxjs';

import Fortmatic from 'fortmatic';

declare let web3: any;
declare let ethereum: any;
declare let window: any;

@Injectable({
    providedIn: 'root'
})
export class Web3Service {

    public web3Provider;

    public backupWeb3Provider;

    public provider;

    public txProvider = null;
    public txProviderName;

    public thirdPartyProvider = null;

    public walletAddress = '';
    public walletAddresses = [];
    public walletBalances = [];
    public walletEns = '';
    public walletIcon = null;
    public walletIconSmall = null;
    public rpcUrl = 'https://alchemy.1inch.exchange';

    connectEvent = new Subject<any>();
    disconnectEvent = new Subject<void>();

    constructor(
        private configurationService: ConfigurationService
    ) {

        this.txProviderName = localStorage.getItem('txProviderName');
        this.walletAddress = localStorage.getItem('walletAddress');

        this.initWeb3();
    }

    async getWeb3Provider(): Promise<Web3> {

        // @ts-ignore
        return new Promise((resolve, reject) => {

            setTimeout(reject, 300000);

            const check = () => {

                if (this.web3Provider) {

                    resolve(this.web3Provider);
                    return;
                }

                setTimeout(() => {

                    check();
                }, 100);
            };

            check();
        });
    }

    async initRpcProvider() {

        return createAlchemyWeb3(
            this.rpcUrl
        );
    }

    async initAllWeb3Provider() {

        if (this.backupWeb3Provider) {

            this.web3Provider = this.backupWeb3Provider;
        } else {

            this.web3Provider = await this.initRpcProvider();
        }
    }

    async initWeb3() {

        if (this.txProviderName) {

            try {

                await this.connect(this.txProviderName);
            } catch (e) {

                console.error(e);
                this.resetWeb3();
            }
        }

        if (!this.web3Provider) {

            await this.initAllWeb3Provider();
        }
    }

    async disconnect() {

        if (this.txProviderName) {

            switch (this.txProviderName) {
                case 'fortmatic':
                    this.thirdPartyProvider.user.logout();
                    break;
                case 'metamask':
                default:
                    await this.initAllWeb3Provider();

                    break;
            }

        }

        await this.resetWeb3();

        this.disconnectEvent.next();
    }

    async resetWeb3() {

        this.txProvider = null;
        this.txProviderName = '';
        this.walletAddress = '';
        this.walletIcon = null;
        this.walletAddresses = [];
        this.walletBalances = [];
        this.walletEns = '';

        localStorage.setItem('txProviderName', '');
        localStorage.setItem('walletAddress', '');
    }

    async connect(wallet) {

        if (this.txProvider) {

            await this.disconnect();
        }

        switch (wallet) {
            case 'fortmatic':
                await this.enableFortmaticTxProvider();
                break;
            case 'metamask':
            default:
                await this.enableWeb3TxProvider();
                break;
        }

        this.walletAddresses = await this.txProvider.eth.getAccounts();
        localStorage.setItem('txProviderName', wallet);

        this.setWalletBalances();

        await this.setWalletAddress(
            localStorage.getItem('walletAddress') &&
            this.walletAddresses.indexOf(localStorage.getItem('walletAddress')) !== -1 ?
                localStorage.getItem('walletAddress') :
                this.walletAddresses[0]
        );

        this.connectEvent.next({
            walletAddress: this.walletAddress
        });
    }

    async setWalletBalances() {

        this.walletBalances = await Promise.all(this.walletAddresses.map(async walletAddress => {

            return (await this.getWeb3Provider()).eth.getBalance(walletAddress);
        }));
    }

    async setWalletAddress(value) {

        this.walletAddress = value;
        this.walletIconSmall = Jazzicon(16, parseInt(this.walletAddress.slice(2, 10), 16));
        this.walletIcon = Jazzicon(32, parseInt(this.walletAddress.slice(2, 10), 32));
        localStorage.setItem('walletAddress', this.walletAddress);

        try {

            this.walletEns = await this.provider.lookupAddress(this.walletAddress);

        } catch (e) {

            // console.error(e);
        }
    }

    async enableWeb3TxProvider() {

        try {

            if (typeof ethereum !== 'undefined') {

                this.txProvider = new Web3(ethereum);

                try {

                    // Request account access if needed
                    await ethereum.enable();
                    this.thirdPartyProvider = ethereum;
                } catch (error) {

                    // User denied account access...
                    // alert('Please connect your Web3 Wallet to the dApp!');
                    throw new Error('No web3 provider!');
                }

                if (typeof ethereum.on !== 'undefined') {

                    ethereum.on('accountsChanged', function(accounts) {

                        window.location.reload();
                    });

                    ethereum.on('networkChanged', function(netId) {

                        window.location.reload();
                    });
                }

            } else if (typeof window.web3 !== 'undefined') {

                this.txProvider = new Web3(window.web3.currentProvider);
                this.thirdPartyProvider = window.web3.currentProvider;

            } else if (typeof web3 !== 'undefined') {

                this.txProvider = new Web3(web3.currentProvider);
                this.thirdPartyProvider = web3.currentProvider;
            } else {

                // alert('No Web3 provider found! Please install Metamask or use TrustWallet on mobile device.');
                throw new Error('No web3 provider!');
            }

            this.txProviderName = 'metamask';

            this.setAllWeb3Provider(this.txProvider);
        } catch (e) {

            alert(e);
            console.error(e);
            throw new Error(e);
        }
    }

    setAllWeb3Provider(provider) {

        this.backupWeb3Provider = this.web3Provider;
        this.web3Provider = provider;
    }

    async enableFortmaticTxProvider() {

        try {
            const fm = new Fortmatic('pk_live_7BCE996AE3CFEEC5');
            await fm.user.login();

            this.txProvider = new Web3(
                fm.getProvider()
            );

            this.txProviderName = 'fortmatic';
            this.thirdPartyProvider = fm;
        } catch (e) {

            console.error(e);
            throw new Error(e);
        }
    }
}
