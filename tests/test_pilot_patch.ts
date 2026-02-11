import { PiiService } from '../server/src/services/piiService';

async function testPilotPatch() {
    console.log("--- Testing Pilot-Ready Patch ---");

    // Test 1: Nigerian NIN
    const nigerianText = "The applicant's NIN is 12345678901.";
    const { sanitized: sanitizedNG } = await PiiService.sanitize(nigerianText, 'NG');
    console.log("Nigerian NIN Sanitization:", sanitizedNG.includes('[NG_NIN_1]') ? "PASS" : "FAIL");

    // Test 2: Kenyan ID
    const kenyanText = "Registered under ID 1234567.";
    const { sanitized: sanitizedKE } = await PiiService.sanitize(kenyanText, 'KE');
    console.log("Kenyan ID Sanitization:", sanitizedKE.includes('[KE_ID_1]') ? "PASS" : "FAIL");

    // Test 3: LASRRA ID
    const lasrraText = "LASRRA ID: LA-1234567890";
    const { sanitized: sanitizedLASRRA } = await PiiService.sanitize(lasrraText, 'NG');
    console.log("LASRRA ID Sanitization:", sanitizedLASRRA.includes('[LASRRA_1]') ? "PASS" : "FAIL");

    // Test 4: Name Scrubbing (Requires SECONDARY_LLM_API_KEY)
    if (process.env.SECONDARY_LLM_API_KEY) {
        const nameText = "Counsel for the plaintiff is Mr. Kwame Adjei from Bentsi-Enchill, Letsa & Ankomah.";
        const { sanitized: sanitizedNames } = await PiiService.sanitize(nameText, 'GH');
        console.log("Name Scrubbing (LLM):", (sanitizedNames.includes('[PERSON_1]') || sanitizedNames.includes('[PERSON_2]')) ? "PASS" : "FAIL (Check LLM Response)");
    } else {
        console.log("Name Scrubbing: SKIPPED (No API Key)");
    }
}

testPilotPatch().catch(console.error);
