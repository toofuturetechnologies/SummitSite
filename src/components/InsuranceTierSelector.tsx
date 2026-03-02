/**
 * Insurance Tier Selector Component
 * Allows customers to select trip insurance at checkout
 */

'use client';

import { useState } from 'react';
import { Check, AlertCircle, Shield } from 'lucide-react';

export interface InsuranceTier {
  id: string;
  name: string;
  price: number;
  coverage: string[];
  description: string;
  popular?: boolean;
}

interface InsuranceTierSelectorProps {
  tripPrice: number;
  onSelect?: (tier: InsuranceTier | null) => void;
  selected?: string | null;
  compact?: boolean;
}

const INSURANCE_TIERS: InsuranceTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 25,
    description: 'Essential coverage for peace of mind',
    coverage: [
      'Trip cancellation (up to 100%)',
      'Medical emergencies (up to $50k)',
      'Emergency evacuation',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 45,
    description: 'Comprehensive protection',
    coverage: [
      'Trip cancellation (up to 100%)',
      'Medical emergencies (up to $100k)',
      'Emergency evacuation & rescue',
      'Lost baggage & gear ($5k)',
      'Adventure activity coverage',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 75,
    description: 'Maximum coverage for maximum peace of mind',
    coverage: [
      'Trip cancellation (up to 100%)',
      'Medical emergencies (up to $250k)',
      'Emergency evacuation & rescue',
      'Lost baggage & gear ($10k)',
      'Adventure activity coverage',
      'Travel delay (up to $500)',
      'Guide liability protection',
      ' 24/7 concierge support',
    ],
  },
];

export default function InsuranceTierSelector({
  tripPrice,
  onSelect,
  selected = null,
  compact = false,
}: InsuranceTierSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(selected);

  const handleSelect = (tier: InsuranceTier | null) => {
    setSelectedTier(tier?.id ?? null);
    onSelect?.(tier ?? null);
  };

  if (compact) {
    return (
      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <h3 className="font-semibold text-sky-900 dark:text-sky-100">Trip Insurance</h3>
        </div>

        <div className="space-y-2">
          {INSURANCE_TIERS.map((tier) => (
            <label key={tier.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 cursor-pointer transition-colors">
              <input
                type="radio"
                name="insurance"
                value={tier.id}
                checked={selectedTier === tier.id}
                onChange={() => handleSelect(tier)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-sky-900 dark:text-sky-100">
                  {tier.name} - ${tier.price}
                </p>
                <p className="text-xs text-sky-700 dark:text-sky-300">
                  {tier.description}
                </p>
              </div>
            </label>
          ))}
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/30 cursor-pointer transition-colors">
            <input
              type="radio"
              name="insurance"
              value=""
              checked={selectedTier === null}
              onChange={() => handleSelect(null)}
              className="w-4 h-4"
            />
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Skip Insurance
            </p>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <h2 className="text-2xl font-bold text-sky-900 dark:text-sky-100">
            Protect Your Adventure
          </h2>
        </div>
        <p className="text-sky-600 dark:text-sky-400">
          Add trip insurance to this booking for peace of mind
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
            Adventure trips can be unpredictable
          </p>
          <p className="text-amber-800 dark:text-amber-300">
            Our insurance covers cancellations, medical emergencies, and more. Protect your investment and enjoy your trip with confidence.
          </p>
        </div>
      </div>

      {/* Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INSURANCE_TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => handleSelect(tier)}
            className={`relative rounded-lg border-2 p-6 text-left transition-all ${
              selectedTier === tier.id
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700'
            }`}
          >
            {/* Popular Badge */}
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                Most Popular
              </div>
            )}

            {/* Check Mark */}
            {selectedTier === tier.id && (
              <div className="absolute top-4 right-4 bg-sky-500 text-white rounded-full p-1">
                <Check className="h-5 w-5" />
              </div>
            )}

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {tier.name}
            </h3>

            <div className="mb-4">
              <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                ${tier.price}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                per trip
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {tier.description}
            </p>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                Coverage includes:
              </p>
              <ul className="space-y-2">
                {tier.coverage.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      {/* No Insurance Option */}
      <button
        onClick={() => handleSelect(null)}
        className={`w-full rounded-lg border-2 p-4 text-center transition-all ${
          selectedTier === null
            ? 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-slate-800'
            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
        }`}
      >
        <p className="font-medium text-gray-700 dark:text-gray-300">
          Skip Insurance
        </p>
      </button>

      {/* Summary */}
      {selectedTier && (
        <div className="bg-sky-100 dark:bg-sky-900/30 border border-sky-300 dark:border-sky-700 rounded-lg p-4">
          <p className="text-sm text-sky-900 dark:text-sky-100">
            <span className="font-semibold">Total trip cost:</span> ${tripPrice + (INSURANCE_TIERS.find(t => t.id === selectedTier)?.price || 0)}
          </p>
        </div>
      )}
    </div>
  );
}
