import { calculateQualityScore } from "../src/lib/quality";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log("=== Running Quality Calculator Tests ===");

// 1. Incomplete entry test
const incomplete = calculateQualityScore({
  title: "Bug",
  symptoms: "bad",
});
assert(incomplete.score < 30, `Incomplete entry score should be low (got ${incomplete.score}%)`);

// 2. Complete rich entry test
const complete = calculateQualityScore({
  title: "Wazuh Manager ne reçoit plus les logs des agents",
  symptoms: "Les agents Wazuh ne transmettent plus les flux d'événements.",
  errorMessage: "Connection refused on port 1514",
  rootCause: "Le port UDP 1514 a été bloqué suite au rechargement de la politique iptables.",
  quickSolution: "Ouvrir UDP/1514 dans iptables et redémarrer wazuh-manager.",
  commands: [{ command: "iptables -A INPUT -p udp --dport 1514 -j ACCEPT" }],
  resolutionSteps: [{ title: "Vérifier le port", description: "ss -lunp" }],
  validationTested: true,
  resources: [{ url: "https://documentation.wazuh.com" }],
});

assert(complete.score >= 90, `Complete entry score should be >= 90% (got ${complete.score}%)`);
assert(complete.checklist.every((item) => item.valid), "All checklist items should be valid for complete entry");

console.log("=== All Quality Tests Passed Successfully! ===");
