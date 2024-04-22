import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'installments-calculator',
    pathMatch: 'full',
  },
  {
    path: 'installments-calculator',
    loadComponent: () => import('./installment-calculator/installment-calculator.component'),
  },
];
