import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'fr' | 'en';

type TranslationDict = Record<string, Record<Lang, string>>;

const DICTIONARY: TranslationDict = {
  // Header
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.politics': { fr: 'Politique', en: 'Politics' },
  'nav.economy': { fr: 'Économie', en: 'Economy' },
  'nav.society': { fr: 'Société', en: 'Society' },
  'nav.culture': { fr: 'Culture', en: 'Culture' },
  'nav.sport': { fr: 'Sport', en: 'Sports' },
  'nav.tech': { fr: 'Technologie', en: 'Technology' },
  'nav.tourism': { fr: 'Tourisme', en: 'Tourism' },
  'nav.environment': { fr: 'Environnement', en: 'Environment' },
  'nav.opinion': { fr: 'Opinion', en: 'Opinion' },
  'nav.world': { fr: 'International', en: 'World' },

  'header.search': { fr: 'Rechercher...', en: 'Search...' },
  'header.login': { fr: 'Connexion', en: 'Sign in' },
  'header.signup': { fr: 'S\'abonner', en: 'Subscribe' },
  'header.subscriptions': { fr: 'Abonnements', en: 'Subscriptions' },
  'header.tagline': { fr: 'L\'actualité de Madagascar, vérifiée.', en: 'Madagascar news, verified.' },

  // Breaking ticker
  'ticker.breaking': { fr: 'DERNIÈRE MINUTE', en: 'BREAKING' },

  // Categories badges
  'badge.live': { fr: 'EN DIRECT', en: 'LIVE' },
  'badge.exclusive': { fr: 'EXCLUSIF', en: 'EXCLUSIVE' },
  'badge.investigation': { fr: 'ENQUÊTE', en: 'INVESTIGATION' },
  'badge.analysis': { fr: 'ANALYSE', en: 'ANALYSIS' },
  'badge.report': { fr: 'REPORTAGE', en: 'REPORT' },
  'badge.premium': { fr: 'PREMIUM', en: 'PREMIUM' },
  'badge.free': { fr: 'GRATUIT', en: 'FREE' },

  // Home sections
  'section.featured': { fr: 'À LA UNE', en: 'TOP STORIES' },
  'section.latest': { fr: 'DERNIÈRES ACTUS', en: 'LATEST NEWS' },
  'section.politics': { fr: 'POLITIQUE', en: 'POLITICS' },
  'section.economy': { fr: 'ÉCONOMIE', en: 'ECONOMY' },
  'section.society': { fr: 'SOCIÉTÉ', en: 'SOCIETY' },
  'section.culture': { fr: 'CULTURE', en: 'CULTURE' },
  'section.sport': { fr: 'SPORT', en: 'SPORTS' },
  'section.environment': { fr: 'ENVIRONNEMENT', en: 'ENVIRONMENT' },
  'section.opinion': { fr: 'OPINIONS', en: 'OPINION' },
  'section.most_read': { fr: 'LES PLUS LUS', en: 'MOST READ' },
  'section.exclusive': { fr: 'CONTENU EXCLUSIF', en: 'EXCLUSIVE CONTENT' },
  'section.in_depth': { fr: 'EN PROFONDEUR', en: 'IN DEPTH' },

  'common.readmore': { fr: 'Lire la suite', en: 'Read more' },
  'common.viewall': { fr: 'Voir tout', en: 'View all' },
  'common.minutes': { fr: 'min de lecture', en: 'min read' },
  'common.by': { fr: 'Par', en: 'By' },
  'common.subscribe_to_read': {
    fr: 'Abonnez-vous pour lire',
    en: 'Subscribe to read',
  },
  'common.locked_message': {
    fr: 'Cet article est réservé aux abonnés',
    en: 'This article is for subscribers only',
  },

  // Subscription page
  'sub.title': { fr: 'Choisissez votre abonnement', en: 'Choose your subscription' },
  'sub.subtitle': {
    fr: 'Accédez à une information de qualité sur Madagascar',
    en: 'Access quality information about Madagascar',
  },
  'sub.month': { fr: '/ mois', en: '/ month' },
  'sub.year': { fr: '/ an', en: '/ year' },
  'sub.monthly': { fr: 'Mensuel', en: 'Monthly' },
  'sub.yearly': { fr: 'Annuel', en: 'Yearly' },
  'sub.save': { fr: 'Économisez 20%', en: 'Save 20%' },
  'sub.free': { fr: 'Gratuit', en: 'Free' },
  'sub.popular': { fr: 'LE PLUS POPULAIRE', en: 'MOST POPULAR' },
  'sub.recommended': { fr: 'RECOMMANDÉ', en: 'RECOMMENDED' },
  'sub.signup': { fr: 'Commencer', en: 'Get started' },
  'sub.upgrade': { fr: 'Choisir cet abonnement', en: 'Choose this plan' },
  'sub.contact': { fr: 'Nous contacter', en: 'Contact us' },

  'sub.general.name': { fr: 'Veille Générale', en: 'General Watch' },
  'sub.general.tagline': {
    fr: 'L\'essentiel de l\'actualité malgache',
    en: 'Madagascar essentials',
  },
  'sub.sectorial.name': { fr: 'Veille Sectorielle', en: 'Sectorial Watch' },
  'sub.sectorial.tagline': {
    fr: 'L\'analyse approfondie par secteur',
    en: 'In-depth analysis by sector',
  },
  'sub.dedicated.name': { fr: 'Veille Dédiée', en: 'Dedicated Watch' },
  'sub.dedicated.tagline': {
    fr: 'Le sur-mesure pour les décideurs',
    en: 'Tailored for decision-makers',
  },

  // Subscription features
  'feat.basic_news': {
    fr: 'Accès aux actualités générales',
    en: 'Access to general news',
  },
  'feat.basic_search': {
    fr: 'Recherche dans les archives (30 jours)',
    en: 'Archive search (30 days)',
  },
  'feat.limited_articles': {
    fr: '5 articles premium par mois',
    en: '5 premium articles per month',
  },
  'feat.all_articles': { fr: 'Tous les articles premium', en: 'All premium articles' },
  'feat.sector_reports': {
    fr: 'Rapports sectoriels mensuels',
    en: 'Monthly sector reports',
  },
  'feat.exclusive_analysis': {
    fr: 'Analyses exclusives',
    en: 'Exclusive analyses',
  },
  'feat.full_archives': {
    fr: 'Archives illimitées',
    en: 'Unlimited archives',
  },
  'feat.priority_support': {
    fr: 'Support prioritaire',
    en: 'Priority support',
  },
  'feat.custom_reports': {
    fr: 'Rapports personnalisés',
    en: 'Custom reports',
  },
  'feat.dedicated_analyst': {
    fr: 'Analyste dédié',
    en: 'Dedicated analyst',
  },
  'feat.api_access': { fr: 'Accès API', en: 'API access' },
  'feat.team_accounts': {
    fr: 'Comptes équipe (jusqu\'à 10 utilisateurs)',
    en: 'Team accounts (up to 10 users)',
  },
  'feat.briefings': {
    fr: 'Briefings hebdomadaires',
    en: 'Weekly briefings',
  },
  'feat.events_access': {
    fr: 'Accès aux événements VIP',
    en: 'VIP events access',
  },

  // Auth modal
  'auth.login.title': { fr: 'Bienvenue à Gazety', en: 'Welcome to Gazety' },
  'auth.login.subtitle': {
    fr: 'Connectez-vous pour accéder à votre compte',
    en: 'Sign in to access your account',
  },
  'auth.signup.title': { fr: 'Créer votre compte', en: 'Create your account' },
  'auth.signup.subtitle': {
    fr: 'Rejoignez Gazety en quelques secondes',
    en: 'Join Gazety in seconds',
  },
  'auth.email': { fr: 'Adresse email', en: 'Email address' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.fullname': { fr: 'Nom complet', en: 'Full name' },
  'auth.confirm_password': {
    fr: 'Confirmer le mot de passe',
    en: 'Confirm password',
  },
  'auth.forgot': { fr: 'Mot de passe oublié ?', en: 'Forgot password?' },
  'auth.remember': { fr: 'Se souvenir de moi', en: 'Remember me' },
  'auth.submit_login': { fr: 'Se connecter', en: 'Sign in' },
  'auth.submit_signup': { fr: 'Créer un compte', en: 'Create account' },
  'auth.switch_to_signup': {
    fr: 'Pas encore de compte ?',
    en: 'Don\'t have an account?',
  },
  'auth.switch_to_login': { fr: 'Déjà inscrit ?', en: 'Already have an account?' },
  'auth.continue_google': {
    fr: 'Continuer avec Google',
    en: 'Continue with Google',
  },
  'auth.continue_facebook': {
    fr: 'Continuer avec Facebook',
    en: 'Continue with Facebook',
  },
  'auth.or': { fr: 'OU', en: 'OR' },
  'auth.terms': {
    fr: 'En continuant, vous acceptez nos Conditions d\'utilisation et notre Politique de confidentialité.',
    en: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
  },

  // Footer
  'footer.about': { fr: 'À propos', en: 'About us' },
  'footer.about_us': { fr: 'Qui sommes-nous', en: 'About us' },
  'footer.contact': { fr: 'Contact', en: 'Contact' },
  'footer.careers': { fr: 'Carrières', en: 'Careers' },
  'footer.press': { fr: 'Presse', en: 'Press' },
  'footer.sections': { fr: 'Sections', en: 'Sections' },
  'footer.services': { fr: 'Services', en: 'Services' },
  'footer.subscriptions': { fr: 'Abonnements', en: 'Subscriptions' },
  'footer.archives': { fr: 'Archives', en: 'Archives' },
  'footer.legal': { fr: 'Mentions légales', en: 'Legal' },
  'footer.terms': { fr: 'CGU', en: 'Terms' },
  'footer.privacy': { fr: 'Confidentialité', en: 'Privacy' },
  'footer.cookies': { fr: 'Cookies', en: 'Cookies' },
  'footer.follow': { fr: 'Suivez-nous', en: 'Follow us' },
  'footer.copyright': {
    fr: '© 2026 Gazety Malagasy. Tous droits réservés.',
    en: '© 2026 Gazety Malagasy. All rights reserved.',
  },
  'footer.tagline': {
    fr: 'Le premier journal en ligne 100% dédié à l\'actualité de Madagascar.',
    en: 'The first online newspaper 100% dedicated to Madagascar news.',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _lang = signal<Lang>(this.detectInitialLang());
  readonly lang = this._lang.asReadonly();
  readonly isFrench = computed(() => this._lang() === 'fr');

  setLang(lang: Lang) {
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gazety_lang', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }

  toggle() {
    this.setLang(this._lang() === 'fr' ? 'en' : 'fr');
  }

  t(key: string): string {
    const entry = DICTIONARY[key];
    if (!entry) {
      return key;
    }
    return entry[this._lang()] ?? key;
  }

  private detectInitialLang(): Lang {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('gazety_lang') as Lang | null;
      if (stored === 'fr' || stored === 'en') return stored;
    }
    return 'fr';
  }
}
