import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonContent, IonTitle, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AlertModel } from './shared/models/alert.model';
import { ConfigService } from './shared/services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonSpinner, IonButton, IonTitle, IonContent, IonApp, IonRouterOutlet],
})
export class AppComponent {

  public executive: string | null = null;
  public processing!: boolean;

  private _configService: ConfigService = inject(ConfigService);

  constructor() {
    this._loadExecutive();
  }




  async setExecutive() {
    await this._configService.setExecutive();
    this._loadExecutive();
  }



  private _loadExecutive() {
    this.executive = this._configService.getExecutive();
  }
}
