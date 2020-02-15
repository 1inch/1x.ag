import {Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavigationService} from './navigation.service';
import {Location} from '@angular/common';
import {faArrowLeft, faCopy} from '@fortawesome/free-solid-svg-icons';
import {Web3Service} from '../web3.service';
import {ConfigurationService} from '../configuration.service';
import {ThemeService} from '../theme.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {ConnectService} from '../connect.service';
import {TransactionService} from '../transaction.service';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {TokenService} from '../token.service';

declare let ethereum: any;
declare let web3: any;

@Component({
    selector: 'app-base',
    templateUrl: './base.component.html',
    styleUrls: ['./base.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BaseComponent implements OnInit {

    backIcon = faArrowLeft;
    loading = true;
    ensDomain;
    copyIcon = faCopy;
    referralUrl = '';
    isMetaMask = false;
    isTrustWallet = false;

    @ViewChild('walletAddressDropDown')
    walletAddressDropDown: NgbDropdown;

    @ViewChild('walletIconEl')
    walletIconEl: ElementRef;

    @ViewChild('walletIconEl2')
    walletIconEl2: ElementRef;

    @ViewChild('connectTemplate')
    connectTemplate: TemplateRef<any>;

    connectInProgress = false;

    modalRef: BsModalRef;

    deferredPrompt: any;
    showInstall = false;
    collapsed = true;

    constructor(
        private location: Location,
        public navigationService: NavigationService,
        private route: ActivatedRoute,
        private router: Router,
        private configurationService: ConfigurationService,
        public themeService: ThemeService,
        public web3Service: Web3Service,
        public tokenService: TokenService,
        private modalService: BsModalService,
        protected connectService: ConnectService,
        public transactionService: TransactionService
    ) {

    }

    @HostListener('window:beforeinstallprompt', ['$event'])
    onbeforeinstallprompt(e) {

        e.preventDefault();

        this.deferredPrompt = e;

        if (
            !localStorage.getItem('showInstall') ||
            localStorage.getItem('showInstall') === 'true'
        ) {

            this.showInstall = true;
        }
    }

    install() {

        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice
            .then((choiceResult) => {

                if (choiceResult.outcome === 'accepted') {

                    this.deferredPrompt = null;
                    this.showInstall = false;
                }
            });
    }

    hideInstallPrompt() {

        this.showInstall = false;
        localStorage.setItem('showInstall', 'false');
    }

    toggleCollapsed(): void {

        this.collapsed = !this.collapsed;
    }

    async ngOnInit() {

        try {

            this.loading = false;
            this.ensDomain = this.configurationService.CONTRACT_ENS;

        } catch (e) {

            console.error(e);
        }

        this.web3Service.connectEvent.subscribe(async () => {

            this.setWalletIcon();
        });

        this.connectService.startConnectEvent.subscribe(() => {

            this.openConnectModal();
        });

        if (typeof ethereum !== 'undefined') {

            this.isMetaMask = ethereum.isMetaMask;
        }

        if (
            typeof web3 !== 'undefined' &&
            typeof web3.currentProvider !== 'undefined' &&
            typeof web3.currentProvider.isTrust !== 'undefined'
        ) {

            this.isTrustWallet = web3.currentProvider.isTrust;
        }

        this.setWalletIcon();
    }

    async awaitForWalletIconEl() {

        return new Promise((resolve, reject) => {

            const check = () => {

                if (typeof this.walletIconEl !== 'undefined') {

                    resolve();
                } else {

                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    async setWalletIcon() {

        if (
            this.web3Service.walletIcon
        ) {

            await this.awaitForWalletIconEl();
            await this.getWalletIconEl();
            await this.getWalletIconEl2();

            if (this.walletIconEl.nativeElement.hasChildNodes()) {

                for (let i = 0; i < this.walletIconEl.nativeElement.childNodes.length; i++) {

                    this.walletIconEl.nativeElement.removeChild(
                        this.walletIconEl.nativeElement.childNodes[i]
                    );
                }

                for (let i = 0; i < this.walletIconEl2.nativeElement.childNodes.length; i++) {

                    this.walletIconEl2.nativeElement.removeChild(
                        this.walletIconEl2.nativeElement.childNodes[i]
                    );
                }
            }

            this.walletIconEl.nativeElement.appendChild(this.web3Service.walletIconSmall);
            this.walletIconEl2.nativeElement.appendChild(this.web3Service.walletIcon);
        }
    }

    async getWalletIconEl(): Promise<any> {

        // @ts-ignore
        return new Promise((resolve, reject) => {

            setTimeout(reject, 300000);

            const check = () => {

                if (this.walletIconEl) {

                    resolve(this.walletIconEl);
                    return;
                }

                setTimeout(() => {

                    check();
                }, 100);
            };

            check();
        });
    }

    async getWalletIconEl2(): Promise<any> {

        // @ts-ignore
        return new Promise((resolve, reject) => {

            setTimeout(reject, 300000);

            const check = () => {

                if (this.walletIconEl2) {

                    resolve(this.walletIconEl2);
                    return;
                }

                setTimeout(() => {

                    check();
                }, 100);
            };

            check();
        });
    }

    goBack() {
        this.navigationService.showBackButton = false;
        this.router.navigate(['../']);
    }

    copyToClipboard(value) {

        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', value);
            e.preventDefault();
            document.removeEventListener('copy', null);
        });

        document.execCommand('copy');

        alert('Copied!');
    }

    openConnectModal() {

        this.modalRef = this.modalService.show(this.connectTemplate, {
            class: 'modal-xl'
        });
    }

    async connect(wallet) {

        this.connectInProgress = true;

        try {

            await this.web3Service.connect(wallet);
            this.modalRef.hide();
        } catch (e) {

            alert('An error has occured! Please try again.');
            console.error(e);
        }

        this.connectInProgress = false;
        this.setWalletIcon();
    }

    async disconnect() {

        this.web3Service.disconnect();
    }

    setWalletAddress(walletAddress: any, walletAddressDropDown) {

        this.web3Service.setWalletAddress(walletAddress);
        this.setWalletIcon();
        walletAddressDropDown.close();
    }
}
