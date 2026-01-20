
// Standalone Test Script for Policy Engine
// Usage: npx ts-node src/tests/policy.test.ts

console.log("--- Policy Engine Test Suite ---");

// Mock Evaluate Function (Mirroring the 'new Function' approach from policyEngine.ts)
const evaluateCondition = (condition: string, context: any): boolean => {
    try {
        // SafeEval wrapper from source
        const safeEval = new Function('user', 'resource', 'env', `return ${condition};`);
        return safeEval(context.user, context.resource, context.environment || {});
    } catch (e) {
        console.error("Evaluation Error:", e);
        return false;
    }
};

async function runTests() {
    console.log("Test 1: Deny High Risk Logic (JS Syntax)");
    const ctx1 = {
        user: { attributes: {} },
        resource: { riskLevel: 'HIGH' }
    };
    // Note: Condition must be valid JS boolean expression
    const policy1 = {
        condition: "resource.riskLevel === 'HIGH'",
        effect: 'DENY'
    };

    const match1 = evaluateCondition(policy1.condition, ctx1);
    console.log(`Matched Deny Policy? ${match1} (Expected: true)`);
    if (match1 && policy1.effect === 'DENY') {
        console.log("✅ Result: BLOCKED");
    } else {
        console.log("❌ Result: FAILED");
    }

    console.log("\nTest 2: Allow Compliance Logic (JS Syntax)");
    const ctx2 = {
        user: { attributes: { department: 'Compliance' } },
        resource: {}
    };
    const policy2 = {
        condition: "user.attributes.department === 'Compliance'",
        effect: 'ALLOW'
    };

    const match2 = evaluateCondition(policy2.condition, ctx2);
    console.log(`Matched Allow Policy? ${match2} (Expected: true)`);
    if (match2 && policy2.effect === 'ALLOW') {
        console.log("✅ Result: ALLOWED");
    } else {
        console.log("❌ Result: FAILED");
    }

    // Test 3: Complex Logic
    console.log("\nTest 3: Complex Jurisdiction Check");
    const ctx3 = {
        user: { attributes: { jurisdiction: 'US', clearance: 'TopSecret' } },
        resource: { jurisdiction: 'US', classification: 'TopSecret' }
    };
    const policy3 = {
        condition: "user.attributes.jurisdiction === resource.jurisdiction && user.attributes.clearance === resource.classification",
        effect: 'ALLOW'
    };
    const match3 = evaluateCondition(policy3.condition, ctx3);
    console.log(`Matched Complex Policy? ${match3} (Expected: true)`);
    if (match3) console.log("✅ Result: PASS");
}

runTests();
