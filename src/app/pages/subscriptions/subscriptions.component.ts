import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';

interface PlanFeature {
  key: string;
  included: boolean;
  highlighted?: boolean;
}

interface Plan {
  id: 'general' | 'sectorial' | 'dedicated';
  tier: 'silver' | 'gold' | 'vip';
  nameKey: string;
  taglineKey: string;
  monthly: number;
  yearly: number;
  cta: 'free' | 'paid' | 'contact';
  popular?: boolean;
  recommended?: boolean;
  features: PlanFeature[];
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscriptions.component.html',
})
export class SubscriptionsComponent {
  protected readonly i18n = inject(I18nService);

  readonly billing = signal<'monthly' | 'yearly'>('monthly');
  readonly isMonthly = computed(() => this.billing() === 'monthly');

  readonly plans: Plan[] = [
    {
      id: 'general',
      tier: 'silver',
      nameKey: 'sub.general.name',
      taglineKey: 'sub.general.tagline',
      monthly: 0,
      yearly: 0,
      cta: 'free',
      features: [
        { key: 'feat.basic_news', included: true, highlighted: true },
        { key: 'feat.all_veilles', included: false },
        { key: 'feat.custom_veilles', included: false },
        { key: 'feat.realtime_alerts', included: false },
      ],
    },
    {
      id: 'sectorial',
      tier: 'gold',
      nameKey: 'sub.sectorial.name',
      taglineKey: 'sub.sectorial.tagline',
      monthly: 39,
      yearly: 374,
      cta: 'paid',
      popular: true,
      features: [
        { key: 'feat.basic_news', included: true },
        { key: 'feat.all_veilles', included: true, highlighted: true },
        { key: 'feat.custom_veilles', included: false },
        { key: 'feat.realtime_alerts', included: false },
      ],
    },
    {
      id: 'dedicated',
      tier: 'vip',
      nameKey: 'sub.dedicated.name',
      taglineKey: 'sub.dedicated.tagline',
      monthly: 0,
      yearly: 0,
      cta: 'contact',
      recommended: true,
      features: [
        { key: 'feat.basic_news', included: true },
        { key: 'feat.all_veilles', included: true, highlighted: true },
        { key: 'feat.custom_veilles', included: true, highlighted: true },
        { key: 'feat.realtime_alerts', included: true, highlighted: true },
      ],
    },
  ];

  setBilling(b: 'monthly' | 'yearly') {
    this.billing.set(b);
  }

  formatPrice(plan: Plan): string {
    if (plan.cta === 'free') return this.i18n.t('sub.free');
    if (plan.cta === 'contact') return this.i18n.isFrench() ? 'Sur devis' : 'On quote';
    const value = this.isMonthly() ? plan.monthly : plan.yearly;
    return `€${value}`;
  }

  priceUnit(plan: Plan): string {
    if (plan.cta === 'free' || plan.cta === 'contact') return '';
    return this.isMonthly() ? this.i18n.t('sub.month') : this.i18n.t('sub.year');
  }

  ctaLabel(plan: Plan): string {
    if (plan.cta === 'free') return this.i18n.t('sub.signup');
    if (plan.cta === 'contact') return this.i18n.t('sub.contact');
    return this.i18n.t('sub.upgrade');
  }

  yearlyEquivalent(plan: Plan): string {
    if (plan.cta !== 'paid' || !this.isMonthly()) return '';
    const monthly = (plan.yearly / 12).toFixed(0);
    return this.i18n.isFrench()
      ? `Soit €${monthly}/mois facturé annuellement`
      : `That's €${monthly}/mo billed yearly`;
  }
}
