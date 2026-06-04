import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { ArticleComponent } from './pages/article/article.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Gazety Malagasy — Actualités' },
  {
    path: 'abonnements',
    component: SubscriptionsComponent,
    title: 'Abonnements — Gazety Malagasy',
  },
  {
    path: 'article/:id',
    component: ArticleComponent,
    title: 'Article — Gazety Malagasy',
  },
  {
    path: 'category/:slug',
    component: HomeComponent,
    title: 'Catégorie — Gazety Malagasy',
  },
  { path: '**', redirectTo: '' },
];
