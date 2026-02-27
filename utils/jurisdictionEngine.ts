import { LegalHeuristic, GHANA_LEGAL_HEURISTICS, detectMonetaryValue as detectGhanaianMonetaryValue, calculateStampDuty as calculateGhanaStampDuty } from './jurisdictions/ghana/rules';
import { fetchFxRates, LiveFxRates, calculateDetailedStampDuty as calculateDetailedGhanaStampDuty, convertUSDtoGHS } from './jurisdictions/ghana/finance';
import { Region } from '../types';

export type JurisdictionCode = 'GHANA' | 'NIGERIA' | 'KENYA' | 'SOUTH_AFRICA' | 'UK' | 'USA' | 'GLOBAL';

interface JurisdictionConfig {
    name: string;
    currencySymbol: string;
    currencyCode: string;
    heuristics: LegalHeuristic[];
    detectMonetaryValue: (text: string) => { amount: number, currency: string | null };
    getLiveRates: () => Promise<any>;
    calculateDetailedDuty: (value: number, type: string) => { dutyPayable: number, category: string, rateApplied: number, disclaimer: string };
    getSentinelDescription: () => string;
}

/**
 * Normalizes regions or jurisdiction pins into our internal JurisdictionCode.
 */
export const resolveJurisdiction = (contextStr?: string | Region): JurisdictionCode => {
    if (!contextStr) return 'GLOBAL';
    const str = contextStr.toUpperCase();
    if (str.includes('GH') || str.includes('GHANA')) return 'GHANA';
    if (str.includes('NG') || str.includes('NIGERIA')) return 'NIGERIA';
    if (str.includes('KE') || str.includes('KENYA')) return 'KENYA';
    if (str.includes('ZA') || str.includes('SOUTH_AFRICA')) return 'SOUTH_AFRICA';
    if (str.includes('UK') || str.includes('UNITED_KINGDOM')) return 'UK';
    if (str.includes('US') || str.includes('USA')) return 'USA';

    return 'GLOBAL';
};

/**
 * Returns the specific configuration, rules, and finance services for a jurisdiction.
 */
export const getJurisdictionConfig = (jurisdictionContext?: string | Region): JurisdictionConfig => {
    const code = resolveJurisdiction(jurisdictionContext);

    switch (code) {
        case 'GHANA':
            return {
                name: 'Ghana',
                currencySymbol: 'GH₵',
                currencyCode: 'GHS',
                heuristics: GHANA_LEGAL_HEURISTICS,
                detectMonetaryValue: detectGhanaianMonetaryValue,
                getLiveRates: async () => fetchFxRates('GH_ACC_1'),
                calculateDetailedDuty: (v, t) => {
                    const duty = calculateDetailedGhanaStampDuty(v, t);
                    return { dutyPayable: duty.dutyPayableGHS, category: duty.filingCategory, rateApplied: duty.rateApplied, disclaimer: duty.disclaimer };
                },
                getSentinelDescription: () => 'Automated statutory compliance audit for the Ghana legal jurisdiction.'
            };
        case 'GLOBAL':
        default:
            return {
                name: 'Global Default',
                currencySymbol: '$',
                currencyCode: 'USD',
                heuristics: [],
                detectMonetaryValue: (text) => {
                    const match = text?.match(/\$\s?([0-9,]+(\.[0-9]{2})?)/);
                    if (match && match[1]) return { amount: parseFloat(match[1].replace(/,/g, '')), currency: 'USD' };
                    return { amount: 0, currency: null };
                },
                getLiveRates: async () => ({ USD_USD: { rate: 1, isFallback: true, date: 'Now' } }),
                calculateDetailedDuty: () => ({ dutyPayable: 0, category: 'N/A', rateApplied: 0, disclaimer: 'Stamp duty not applicable in Global context.' }),
                getSentinelDescription: () => 'General compliance checks without specific jurisdictional statutory mapping.'
            };
    }
};
