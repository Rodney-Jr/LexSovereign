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

export const INSTRUMENT_TYPES = {
    COMMERCIAL: 'Leases/Commercial Contracts',
    MORTGAGE: 'Mortgages/Charges',
    CONVEYANCE: 'Conveyance/Transfers',
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
 * Simulated Bank of Ghana (BoG) exchange rate.
 * In production, this would call an external API.
 */
export const getBoGExchangeRate = (): number => {
    // Simulated rate: 1 USD = 12.5 GHS
    return 12.5;
};

/**
 * Converts USD value to GHS for stamp duty assessment.
 * @param usdAmount 
 * @returns GHS amount
 */
export const convertUSDtoGHS = (usdAmount: number): number => {
    return usdAmount * getBoGExchangeRate();
};
