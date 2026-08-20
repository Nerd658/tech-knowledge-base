import assert from "node:assert";
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from "../src/lib/auth";

async function testAuth() {
  console.log("=== Running Authentication Tests ===");

  // 1. Test Password Hashing
  const rawPassword = "SuperSecurePassword123!";
  const hash = await hashPassword(rawPassword);
  assert(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Hash should be valid bcrypt format");
  console.log("✓ PASS: Password hashing works");

  // 2. Test Password Verification
  const isMatch = await verifyPassword(rawPassword, hash);
  assert(isMatch === true, "Valid password should verify successfully");
  console.log("✓ PASS: Correct password verified");

  const isMismatch = await verifyPassword("WrongPassword!", hash);
  assert(isMismatch === false, "Incorrect password should fail verification");
  console.log("✓ PASS: Incorrect password rejected");

  // 3. Test JWT Session Signing & Verification
  const user = {
    id: "usr_test123",
    email: "admin@knowledge.local",
    name: "Lead Security Engineer",
    role: "ADMIN",
  };

  const token = await signSessionToken(user);
  assert(typeof token === "string" && token.split(".").length === 3, "Token should be a valid 3-part JWT");
  console.log("✓ PASS: JWT Session token signed");

  const verified = await verifySessionToken(token);
  assert(verified !== null, "Token should verify successfully");
  assert(verified?.id === user.id, "Verified user ID should match");
  assert(verified?.email === user.email, "Verified user email should match");
  assert(verified?.role === user.role, "Verified user role should match");
  console.log("✓ PASS: JWT Session verified and decoded correctly");

  // 4. Test Invalid JWT
  const invalid = await verifySessionToken("invalid.token.signature");
  assert(invalid === null, "Invalid token should return null");
  console.log("✓ PASS: Malformed/invalid token rejected");

  console.log("=== All Authentication Tests Passed Successfully! ===");
}

testAuth().catch((err) => {
  console.error("Auth test error:", err);
  process.exit(1);
});
