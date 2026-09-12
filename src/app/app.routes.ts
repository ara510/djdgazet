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
    path: 'gestion-articles/nouveau',
    loadComponent: () =>
      import('./pages/article-admin/article-admin.component').then((m) => m.ArticleAdminComponent),
    data: { mode: 'new' },
    title: 'Nouvel article — Headlines',
  },
  {
    path: 'gestion-articles/:id/modifier',
    loadComponent: () =>
      import('./pages/article-admin/article-admin.component').then((m) => m.ArticleAdminComponent),
    data: { mode: 'edit' },
    title: 'Modifier un article — Headlines',
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
    // Page dédiée « tous les articles », éventuellement filtrée par rubrique.
    path: 'articles',
    loadComponent: () =>
      import('./pages/articles/articles.component').then((m) => m.ArticlesComponent),
    title: 'Articles — Headlines',
  },
  {
    path: 'articles/:sector',
    loadComponent: () =>
      import('./pages/articles/articles.component').then((m) => m.ArticlesComponent),
    title: 'Articles — Headlines',
  },
  {
    path: 'recherche',
    loadComponent: () =>
      import('./pages/search/search.component').then((m) => m.SearchComponent),
    title: 'Recherche — Headlines',
  },
  {
    path: 'article/:id',
    component: ArticleComponent,
    title: 'Article — Headlines',
  },
  {
    // Lien de partage « lisible » (le slug est cosmétique, seul :id est résolu).
    path: 'article/:id/:slug',
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
