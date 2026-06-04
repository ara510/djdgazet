import { Injectable } from '@angular/core';
import { Lang } from './i18n.service';

export type Category =
  | 'politics'
  | 'economy'
  | 'society'
  | 'culture'
  | 'sport'
  | 'tech'
  | 'tourism'
  | 'environment'
  | 'opinion'
  | 'world';

export type Badge = 'live' | 'exclusive' | 'investigation' | 'analysis' | 'report';

export interface Article {
  id: string;
  category: Category;
  badge?: Badge;
  premium: boolean;
  title: { fr: string; en: string };
  excerpt: { fr: string; en: string };
  author: string;
  publishedAt: string;
  readMinutes: number;
  image: string;
  imageAlt: string;
  views?: number;
  region?: string;
}

const CATEGORY_LABELS: Record<Category, Record<Lang, string>> = {
  politics: { fr: 'Politique', en: 'Politics' },
  economy: { fr: 'Économie', en: 'Economy' },
  society: { fr: 'Société', en: 'Society' },
  culture: { fr: 'Culture', en: 'Culture' },
  sport: { fr: 'Sport', en: 'Sports' },
  tech: { fr: 'Technologie', en: 'Technology' },
  tourism: { fr: 'Tourisme', en: 'Tourism' },
  environment: { fr: 'Environnement', en: 'Environment' },
  opinion: { fr: 'Opinion', en: 'Opinion' },
  world: { fr: 'International', en: 'World' },
};

const ARTICLES: Article[] = [
  // FEATURED - HERO
  {
    id: 'tana-summit-2026',
    category: 'politics',
    badge: 'live',
    premium: false,
    title: {
      fr: 'Antananarivo accueille le sommet régional de l\'Océan Indien : enjeux et perspectives pour Madagascar',
      en: 'Antananarivo hosts the Indian Ocean regional summit: stakes and prospects for Madagascar',
    },
    excerpt: {
      fr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Le sommet réunit pour trois jours les délégations de huit pays de la région autour des questions de souveraineté maritime, coopération économique et lutte contre la piraterie.',
      en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. The summit brings together for three days delegations from eight countries in the region around issues of maritime sovereignty, economic cooperation and fight against piracy.',
    },
    author: 'Hery Rakotomalala',
    publishedAt: '2026-06-04T08:30:00Z',
    readMinutes: 8,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1600&q=80',
    imageAlt: 'Conférence internationale',
    views: 12450,
    region: 'Antananarivo',
  },
  {
    id: 'vanilla-export-record',
    category: 'economy',
    badge: 'exclusive',
    premium: true,
    title: {
      fr: 'Vanille : Madagascar bat un record d\'exportation malgré la concurrence asiatique',
      en: 'Vanilla: Madagascar sets export record despite Asian competition',
    },
    excerpt: {
      fr: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Les producteurs de la SAVA franchissent un cap historique avec une qualité jugée supérieure par les acheteurs européens et américains.',
      en: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Producers in the SAVA region cross a historic milestone with quality deemed superior by European and American buyers.',
    },
    author: 'Voahangy Andrianaivo',
    publishedAt: '2026-06-04T07:15:00Z',
    readMinutes: 12,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1600&q=80',
    imageAlt: 'Gousses de vanille',
    views: 8932,
    region: 'SAVA',
  },
  {
    id: 'cyclone-preparation',
    category: 'environment',
    badge: 'report',
    premium: false,
    title: {
      fr: 'Saison cyclonique : la côte est se prépare à un épisode intense',
      en: 'Cyclone season: east coast braces for intense episode',
    },
    excerpt: {
      fr: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Les autorités multiplient les exercices d\'évacuation et renforcent les abris dans les zones les plus exposées.',
      en: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Authorities multiply evacuation drills and reinforce shelters in the most exposed areas.',
    },
    author: 'Tiana Razafindrabe',
    publishedAt: '2026-06-04T06:45:00Z',
    readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1600&q=80',
    imageAlt: 'Côte est Madagascar',
    views: 5621,
    region: 'Toamasina',
  },
  {
    id: 'tana-metro-project',
    category: 'society',
    badge: 'investigation',
    premium: true,
    title: {
      fr: 'Projet de transport urbain : enquête sur les retards du chantier de la capitale',
      en: 'Urban transport project: investigation into delays of the capital construction',
    },
    excerpt: {
      fr: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Notre rédaction a consulté plus de 200 documents pour comprendre pourquoi le calendrier dérape.',
      en: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Our newsroom reviewed over 200 documents to understand why the schedule is slipping.',
    },
    author: 'Mialy Ranaivoson',
    publishedAt: '2026-06-04T05:30:00Z',
    readMinutes: 15,
    image: 'https://images.unsplash.com/photo-1581922814484-0b48460b7010?w=1600&q=80',
    imageAlt: 'Travaux urbains',
    views: 7320,
    region: 'Antananarivo',
  },

  // POLITICS
  {
    id: 'parliament-budget',
    category: 'politics',
    premium: false,
    title: {
      fr: 'Le budget 2027 examiné en commission : les arbitrages clés à suivre',
      en: '2027 budget reviewed in committee: key trade-offs to watch',
    },
    excerpt: {
      fr: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
      en: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.',
    },
    author: 'Naina Rajaonarison',
    publishedAt: '2026-06-04T04:20:00Z',
    readMinutes: 7,
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
    imageAlt: 'Parlement',
    views: 3210,
  },
  {
    id: 'municipal-elections',
    category: 'politics',
    badge: 'analysis',
    premium: true,
    title: {
      fr: 'Élections municipales : recomposition à Mahajanga, statu quo à Toliara',
      en: 'Municipal elections: realignment in Mahajanga, status quo in Toliara',
    },
    excerpt: {
      fr: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
      en: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
    },
    author: 'Lova Andrianarivo',
    publishedAt: '2026-06-04T03:50:00Z',
    readMinutes: 10,
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80',
    imageAlt: 'Vote',
    views: 4582,
  },
  {
    id: 'diplomatic-relations',
    category: 'politics',
    premium: true,
    title: {
      fr: 'Diplomatie : nouvelle feuille de route avec l\'Union africaine',
      en: 'Diplomacy: new roadmap with the African Union',
    },
    excerpt: {
      fr: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
      en: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    },
    author: 'Hery Rakotomalala',
    publishedAt: '2026-06-03T22:10:00Z',
    readMinutes: 9,
    image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
    imageAlt: 'Drapeaux',
  },

  // ECONOMY
  {
    id: 'sme-financing',
    category: 'economy',
    premium: false,
    title: {
      fr: 'Financement des PME : un nouveau fonds de garantie voit le jour',
      en: 'SME financing: a new guarantee fund launches',
    },
    excerpt: {
      fr: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
      en: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur.',
    },
    author: 'Voahangy Andrianaivo',
    publishedAt: '2026-06-03T20:00:00Z',
    readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    imageAlt: 'Bureau et finances',
    views: 2890,
  },
  {
    id: 'litchi-season',
    category: 'economy',
    premium: false,
    title: {
      fr: 'Litchi : la filière vise un retour en force sur le marché européen',
      en: 'Lychee: the industry aims for a strong return to the European market',
    },
    excerpt: {
      fr: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit.',
      en: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit.',
    },
    author: 'Faly Rabeson',
    publishedAt: '2026-06-03T18:30:00Z',
    readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1591868972808-43b421ec5a6c?w=800&q=80',
    imageAlt: 'Litchis',
  },
  {
    id: 'textile-industry',
    category: 'economy',
    badge: 'report',
    premium: true,
    title: {
      fr: 'Industrie textile : à l\'intérieur des nouvelles zones franches',
      en: 'Textile industry: inside the new free zones',
    },
    excerpt: {
      fr: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil.',
      en: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil.',
    },
    author: 'Mialy Ranaivoson',
    publishedAt: '2026-06-03T16:20:00Z',
    readMinutes: 11,
    image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&q=80',
    imageAlt: 'Industrie textile',
    views: 5102,
  },

  // SOCIETY
  {
    id: 'water-access',
    category: 'society',
    badge: 'investigation',
    premium: true,
    title: {
      fr: 'Accès à l\'eau dans le Grand Sud : où en sont les promesses ?',
      en: 'Water access in the Deep South: what about the promises?',
    },
    excerpt: {
      fr: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.',
      en: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.',
    },
    author: 'Tiana Razafindrabe',
    publishedAt: '2026-06-03T14:00:00Z',
    readMinutes: 14,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&q=80',
    imageAlt: 'Eau et villageois',
    views: 9342,
  },
  {
    id: 'university-reform',
    category: 'society',
    premium: false,
    title: {
      fr: 'Réforme universitaire : les étudiants se mobilisent à Antananarivo',
      en: 'University reform: students mobilize in Antananarivo',
    },
    excerpt: {
      fr: 'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore.',
      en: 'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore.',
    },
    author: 'Naina Rajaonarison',
    publishedAt: '2026-06-03T12:30:00Z',
    readMinutes: 4,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    imageAlt: 'Étudiants',
  },
  {
    id: 'healthcare-rural',
    category: 'society',
    premium: false,
    title: {
      fr: 'Santé rurale : déploiement de cliniques mobiles dans le Boeny',
      en: 'Rural health: mobile clinics deployed in Boeny',
    },
    excerpt: {
      fr: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.',
      en: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.',
    },
    author: 'Lova Andrianarivo',
    publishedAt: '2026-06-03T10:15:00Z',
    readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    imageAlt: 'Santé',
  },

  // CULTURE
  {
    id: 'madajazzcar',
    category: 'culture',
    badge: 'report',
    premium: false,
    title: {
      fr: 'Madajazzcar : 36e édition, une affiche internationale dévoilée',
      en: 'Madajazzcar: 36th edition unveils international lineup',
    },
    excerpt: {
      fr: 'Saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
      en: 'Saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
    },
    author: 'Faly Rabeson',
    publishedAt: '2026-06-03T09:00:00Z',
    readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    imageAlt: 'Concert jazz',
    views: 4231,
  },
  {
    id: 'malagasy-cinema',
    category: 'culture',
    premium: true,
    title: {
      fr: 'Cinéma malgache : trois longs métrages en compétition à Cannes',
      en: 'Malagasy cinema: three feature films competing at Cannes',
    },
    excerpt: {
      fr: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus.',
      en: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus.',
    },
    author: 'Voahangy Andrianaivo',
    publishedAt: '2026-06-02T22:45:00Z',
    readMinutes: 8,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    imageAlt: 'Cinéma',
  },
  {
    id: 'literary-prize',
    category: 'culture',
    premium: false,
    title: {
      fr: 'Prix littéraire : un roman en malagasy distingué à Paris',
      en: 'Literary prize: a Malagasy-language novel honored in Paris',
    },
    excerpt: {
      fr: 'Maiores alias consequatur aut perferendis doloribus asperiores repellat.',
      en: 'Maiores alias consequatur aut perferendis doloribus asperiores repellat.',
    },
    author: 'Mialy Ranaivoson',
    publishedAt: '2026-06-02T19:30:00Z',
    readMinutes: 4,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    imageAlt: 'Livres',
  },

  // SPORT
  {
    id: 'barea-qualification',
    category: 'sport',
    badge: 'live',
    premium: false,
    title: {
      fr: 'Les Barea à un point des qualifications : le scénario expliqué',
      en: 'Barea one point from qualifying: the scenario explained',
    },
    excerpt: {
      fr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    },
    author: 'Tiana Razafindrabe',
    publishedAt: '2026-06-02T17:00:00Z',
    readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    imageAlt: 'Football',
    views: 18420,
  },
  {
    id: 'rugby-tournament',
    category: 'sport',
    premium: false,
    title: {
      fr: 'Rugby : le XV malgache prépare la tournée africaine',
      en: 'Rugby: Malagasy XV prepares the African tour',
    },
    excerpt: {
      fr: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      en: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    },
    author: 'Faly Rabeson',
    publishedAt: '2026-06-02T15:45:00Z',
    readMinutes: 4,
    image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&q=80',
    imageAlt: 'Rugby',
  },
  {
    id: 'athletics-record',
    category: 'sport',
    premium: false,
    title: {
      fr: 'Athlétisme : nouveau record national sur 5000m',
      en: 'Athletics: new national record on 5000m',
    },
    excerpt: {
      fr: 'Ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
      en: 'Ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
    },
    author: 'Naina Rajaonarison',
    publishedAt: '2026-06-02T13:20:00Z',
    readMinutes: 3,
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80',
    imageAlt: 'Athlétisme',
  },

  // ENVIRONMENT
  {
    id: 'lemur-conservation',
    category: 'environment',
    badge: 'report',
    premium: true,
    title: {
      fr: 'Lémuriens : les corridors écologiques portent enfin leurs fruits',
      en: 'Lemurs: ecological corridors finally bearing fruit',
    },
    excerpt: {
      fr: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      en: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
    },
    author: 'Tiana Razafindrabe',
    publishedAt: '2026-06-02T11:00:00Z',
    readMinutes: 9,
    image: 'https://images.unsplash.com/photo-1605051482701-bd66e3a83cb5?w=800&q=80',
    imageAlt: 'Lémurien',
    views: 6710,
  },
  {
    id: 'reforestation',
    category: 'environment',
    premium: false,
    title: {
      fr: 'Reboisement : un million d\'arbres plantés en Imerina',
      en: 'Reforestation: one million trees planted in Imerina',
    },
    excerpt: {
      fr: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
      en: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    },
    author: 'Lova Andrianarivo',
    publishedAt: '2026-06-02T08:30:00Z',
    readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    imageAlt: 'Forêt',
  },
  {
    id: 'baobab-protection',
    category: 'environment',
    premium: true,
    title: {
      fr: 'Allée des baobabs : nouveau plan de protection après l\'incendie',
      en: 'Avenue of the baobabs: new protection plan after the fire',
    },
    excerpt: {
      fr: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
      en: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.',
    },
    author: 'Voahangy Andrianaivo',
    publishedAt: '2026-06-01T22:00:00Z',
    readMinutes: 7,
    image: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800&q=80',
    imageAlt: 'Baobabs',
  },

  // TECH
  {
    id: 'startup-funding',
    category: 'tech',
    badge: 'exclusive',
    premium: true,
    title: {
      fr: 'Tech : une fintech malgache lève 4 millions d\'euros',
      en: 'Tech: Malagasy fintech raises 4 million euros',
    },
    excerpt: {
      fr: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.',
      en: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis.',
    },
    author: 'Hery Rakotomalala',
    publishedAt: '2026-06-01T18:00:00Z',
    readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    imageAlt: 'Startup tech',
  },
  {
    id: 'fiber-deployment',
    category: 'tech',
    premium: false,
    title: {
      fr: 'Fibre optique : déploiement accéléré dans cinq régions',
      en: 'Fiber optics: accelerated deployment in five regions',
    },
    excerpt: {
      fr: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
      en: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    },
    author: 'Mialy Ranaivoson',
    publishedAt: '2026-06-01T16:00:00Z',
    readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    imageAlt: 'Fibre optique',
  },

  // TOURISM
  {
    id: 'nosy-be-tourism',
    category: 'tourism',
    premium: false,
    title: {
      fr: 'Nosy Be : saison touristique record, les hôtels affichent complet',
      en: 'Nosy Be: record tourist season, hotels fully booked',
    },
    excerpt: {
      fr: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus.',
      en: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus.',
    },
    author: 'Faly Rabeson',
    publishedAt: '2026-06-01T12:30:00Z',
    readMinutes: 4,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
    imageAlt: 'Plage tropicale',
  },
  {
    id: 'sainte-marie',
    category: 'tourism',
    premium: false,
    title: {
      fr: 'Sainte-Marie : observation des baleines, la saison s\'ouvre',
      en: 'Sainte-Marie: whale watching season opens',
    },
    excerpt: {
      fr: 'Maiores alias consequatur aut perferendis doloribus asperiores repellat.',
      en: 'Maiores alias consequatur aut perferendis doloribus asperiores repellat.',
    },
    author: 'Lova Andrianarivo',
    publishedAt: '2026-06-01T09:00:00Z',
    readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=80',
    imageAlt: 'Baleine océan',
  },

  // OPINION
  {
    id: 'opinion-governance',
    category: 'opinion',
    badge: 'analysis',
    premium: true,
    title: {
      fr: 'Tribune : repenser la gouvernance locale au XXIe siècle',
      en: 'Op-ed: rethinking local governance in the 21st century',
    },
    excerpt: {
      fr: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil.',
      en: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil.',
    },
    author: 'Dr. Rivo Ratsimbazafy',
    publishedAt: '2026-05-31T18:00:00Z',
    readMinutes: 12,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    imageAlt: 'Editorial',
  },
  {
    id: 'opinion-education',
    category: 'opinion',
    premium: false,
    title: {
      fr: 'Éditorial : l\'éducation, priorité absolue de la décennie',
      en: 'Editorial: education, absolute priority of the decade',
    },
    excerpt: {
      fr: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.',
      en: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.',
    },
    author: 'Rédaction Gazety',
    publishedAt: '2026-05-31T08:00:00Z',
    readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    imageAlt: 'Éducation',
  },
];

@Injectable({ providedIn: 'root' })
export class NewsService {
  getAll(): Article[] {
    return ARTICLES;
  }

  getById(id: string): Article | undefined {
    return ARTICLES.find((a) => a.id === id);
  }

  getFeatured(): Article[] {
    return ARTICLES.slice(0, 4);
  }

  getHero(): Article {
    return ARTICLES[0]!;
  }

  getTopStories(count = 3): Article[] {
    return ARTICLES.slice(1, 1 + count);
  }

  getByCategory(category: Category, limit?: number): Article[] {
    const filtered = ARTICLES.filter((a) => a.category === category);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getLatest(limit = 8): Article[] {
    return [...ARTICLES]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, limit);
  }

  getMostRead(limit = 5): Article[] {
    return [...ARTICLES]
      .filter((a) => a.views !== undefined)
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, limit);
  }

  getPremium(limit = 4): Article[] {
    return ARTICLES.filter((a) => a.premium).slice(0, limit);
  }

  categoryLabel(category: Category, lang: Lang): string {
    return CATEGORY_LABELS[category][lang];
  }

  formatDate(iso: string, lang: Lang): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return lang === 'fr' ? "À l'instant" : 'Just now';
    if (diffMin < 60)
      return lang === 'fr' ? `Il y a ${diffMin} min` : `${diffMin} min ago`;
    if (diffHours < 24)
      return lang === 'fr' ? `Il y a ${diffHours} h` : `${diffHours}h ago`;
    if (diffDays < 7)
      return lang === 'fr' ? `Il y a ${diffDays} j` : `${diffDays}d ago`;
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
