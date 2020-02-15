import { ApplicationRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { Web3Service } from './web3.service';
import { ConfigurationService } from './configuration.service';
import { ThemeService } from './theme.service';
import { SwUpdate } from '@angular/service-worker';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DOCUMENT } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {

    constructor(
        protected web3Service: Web3Service,
        protected configurationService: ConfigurationService,
        protected themeService: ThemeService,
        protected swUpdate: SwUpdate,
        protected appRef: ApplicationRef,
        private deviceDetectorService: DeviceDetectorService,
        @Inject(DOCUMENT) private document: Document
    ) {

    }

    ngOnInit() {

        if (this.deviceDetectorService.isDesktop()) {
            this.document.body.classList.add('twitter-scroll');
        }

        if (
            (
                navigator.userAgent.toLowerCase().indexOf('android') === -1 ||
                (document.fullscreenElement || document.fullscreenElement === null)
            ) &&
            'serviceWorker' in navigator && environment.production
        ) {

            this.swUpdate.available.subscribe(event => {

                console.log('current version is', event.current);
                console.log('available version is', event.available);

                this.swUpdate.activateUpdate().then(() => document.location.reload());
            });

            this.swUpdate.activated.subscribe(event => {
                console.log('old version was', event.previous);
                console.log('new version is', event.current);
            });
        }

        this.checkForUpdates();
    }

    @HostListener('window:focus', ['$event'])
    onFocus(event: FocusEvent): void {

        this.checkForUpdates();
    }

    async checkForUpdates() {

        if (
            (
                navigator.userAgent.toLowerCase().indexOf('android') === -1 ||
                (document.fullscreenElement || document.fullscreenElement === null)
            ) &&
            'serviceWorker' in navigator && environment.production
        ) {

            this.swUpdate.checkForUpdate();
        }
    }
}
