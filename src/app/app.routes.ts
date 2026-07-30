import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { ArticleComponent } from './pages/article/article.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Headlines — Actualités' },
  {
    path: 'abonnements',
    component: SubscriptionsComponent,
    title: 'Abonnements — Headlines',
  },
  // Page veille publique retirée : la veille média se lit désormais sur l'accueil (modale au clic).
  { path: 'veille-publique', redirectTo: '', pathMatch: 'full' },
  {
    path: 'profil',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Mon compte — Headlines',
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact — Headlines',
  },
  {
    path: 'secteur/:slug',
    loadComponent: () =>
      import('./pages/sector/sector.component').then((m) => m.SectorComponent),
    title: 'Secteur — Headlines',
  },
  {
    // Fil plein écran des catégories gratuites : /fil/actualite | /fil/fait-marquant
    path: 'fil/:cat',
    loadComponent: () =>
      import('./pages/feed/feed.component').then((m) => m.FeedComponent),
    title: 'Fil — Headlines',
  },
  {
    path: 'gestion-articles',
    loadComponent: () =>
      import('./pages/article-admin/article-admin.component').then((m) => m.ArticleAdminComponent),
    title: 'Gestion des articles — Headlines',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Administration — Headlines',
  },
  {
    path: 'favoris',
    loadComponent: () =>
      import('./pages/favorites/favorites.component').then((m) => m.FavoritesComponent),
    title: 'Mes favoris — Headlines',
  },
  {
    path: 'a-propos',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'À propos — Headlines',
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./pages/legal/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
    title: 'Mentions légales — Headlines',
  },
  {
    path: 'cgu',
    loadComponent: () => import('./pages/legal/cgu.component').then((m) => m.CguComponent),
    title: 'CGU — Headlines',
  },
  {
    path: 'article/:id',
    component: ArticleComponent,
    title: 'Article — Headlines',
  },
  {
    path: 'category/:slug',
    component: HomeComponent,
    title: 'Catégorie — Headlines',
  },
  { path: '**', redirectTo: '' },
];
