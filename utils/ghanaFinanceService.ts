/**
 * Ghana Finance Service
 * Handles statutory tax calculations and currency conversion for the Ghana legal jurisdiction.
 */

export interface StampDutyResult {
    dutyPayableGHS: number;
    filingCategory: string;
    disclaimer: string;
    rateApplied: number;
}

export interface LiveFxRates {
    USD_GHS: { rate: number; isFallback: boolean; date: string };
    GBP_GHS: { rate: number; isFallback: boolean; date: string };
}

export const INSTRUMENT_TYPES = {
    COMMERCIAL: 'Leases/Commercial Contracts',
    MORTGAGE: 'Mortgages/Charges',
    CONVEYANCE: 'Conveyance/Transfers',
};

/**
 * Fetches live exchange rates from the Sovereign Control Plane backend.
 */
export const fetchFxRates = async (sovPin: string): Promise<LiveFxRates> => {
    try {
        const response = await fetch('/api/fx-rates', {
            headers: { 'x-sov-pin': sovPin }
        });
        const data = await response.json();
        if (data.success) {
            return data.rates;
        }
        throw new Error('API returned failure');
    } catch (error) {
        console.error('[FX Service] Failed to fetch live rates, using defaults:', error);
        return {
            USD_GHS: { rate: 12.5, isFallback: true, date: 'Fallback' },
            GBP_GHS: { rate: 15.8, isFallback: true, date: 'Fallback' }
        };
    }
};

/**
 * Calculates Stamp Duty based on simplified GRA rates for the pilot.
 * @param contractValue The monetary value of the contract.
 * @param instrumentType The type of legal instrument.
 * @returns StampDutyResult
 */
export const calculateDetailedStampDuty = (
    contractValue: number,
    instrumentType: string
): StampDutyResult => {
    let rate = 0.005; // Default 0.5%
    let category = 'Commercial Instrument';

    if (instrumentType === INSTRUMENT_TYPES.MORTGAGE) {
        rate = 0.0025; // 0.25%
        category = 'Mortgage/Charge';
    } else if (instrumentType === INSTRUMENT_TYPES.CONVEYANCE) {
        rate = 0.01; // Approx 1% sliding scale simplified
        category = 'Conveyance/Transfer';
    } else {
        rate = 0.005; // 0.5%
        category = 'Lease/Commercial';
    }

    const duty = contractValue * rate;

    return {
        dutyPayableGHS: duty,
        filingCategory: category,
        rateApplied: rate,
        disclaimer: 'DISCLAIMER: This is an automated estimate based on the Stamp Duty Act, 2005 (Act 689). Final duty is subject to assessment by the Ghana Revenue Authority (GRA).',
    };
};

/**
 * Converts USD value to GHS for stamp duty assessment using live or fallback rates.
 * @param usdAmount 
 * @param rate 
 * @returns GHS amount
 */
export const convertUSDtoGHS = (usdAmount: number, rate: number = 12.5): number => {
    return usdAmount * rate;
};
