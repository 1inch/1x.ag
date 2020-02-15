import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BaseComponent } from './base/base.component';
import { NoContentComponent } from './no-content/no-content.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingSpinnerModule } from './loading-spinner/loading-spinner.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap';
import { NgbModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularPageVisibilityModule } from 'angular-page-visibility';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';

@NgModule({
    declarations: [
        AppComponent,
        BaseComponent,
        NoContentComponent,
        HowItWorksComponent
    ],
    imports: [
        BrowserAnimationsModule,
        AppRoutingModule,
        FormsModule,
        NgbModule,
        HttpClientModule,
        LoadingSpinnerModule,
        ModalModule.forRoot(),
        DeviceDetectorModule.forRoot(),
        NgbToastModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: navigator.userAgent.toLowerCase().indexOf('android') === -1 &&
                'serviceWorker' in navigator && environment.production
        }),
        FontAwesomeModule,
        AngularPageVisibilityModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
