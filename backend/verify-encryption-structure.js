#!/usr/bin/env node

/**
 * Encryption Implementation Verification Script
 * Checks that all files are correctly aligned with folder structure
 * 
 * Run: node verify-encryption-structure.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 ENCRYPTION IMPLEMENTATION VERIFICATION\n');
console.log('=' .repeat(60));

const checks = {
  filesExist: [],
  importsCorrect: [],
  noUtilsReferences: [],
  encryptionKeySet: false,
};

// 1. Check file existence
console.log('\n1️⃣  Checking file locations...');

const filesToCheck = [
  {
    path: 'services/encryptionService.js',
    name: 'Encryption Service',
  },
  {
    path: 'models/User.js',
    name: 'User Model',
  },
  {
    path: 'models/UserMedicalInfo.js',
    name: 'User Medical Info Model',
  },
  {
    path: 'models/UserPersonalInfo.js',
    name: 'User Personal Info Model',
  },
  {
    path: '.env',
    name: 'Environment Config',
  },
];

for (const file of filesToCheck) {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);
  checks.filesExist.push({ ...file, exists });
  console.log(`  ${exists ? '✅' : '❌'} ${file.name}: ${file.path}`);
}

// 2. Check imports are correct
console.log('\n2️⃣  Checking import paths in models...');

const modelsToCheck = [
  'models/User.js',
  'models/UserMedicalInfo.js',
  'models/UserPersonalInfo.js',
];

for (const modelPath of modelsToCheck) {
  const fullPath = path.join(__dirname, modelPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  const hasCorrectImport = content.includes(
    "import encryptionService from '../services/encryptionService.js'"
  );
  const hasWrongImport = content.includes("import encryptionUtil from '../utils/");
  const hasUtilsReferences = content.includes('encryptionUtil.');

  checks.importsCorrect.push({
    file: modelPath,
    correct: hasCorrectImport,
    wrong: hasWrongImport,
  });
  checks.noUtilsReferences.push({
    file: modelPath,
    hasUtilsRefs: hasUtilsReferences,
  });

  const modelName = modelPath.split('/').pop();
  console.log(`  ${modelName}:`);
  console.log(`    ${hasCorrectImport ? '✅' : '❌'} Correct import: ../services/encryptionService.js`);
  console.log(`    ${!hasWrongImport ? '✅' : '❌'} No utils imports`);
  console.log(`    ${!hasUtilsReferences ? '✅' : '❌'} No encryptionUtil references`);
}

// 3. Check .env has ENCRYPTION_KEY
console.log('\n3️⃣  Checking environment configuration...');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const hasEncryptionKey = envContent.includes('ENCRYPTION_KEY=');
const keyMatch = envContent.match(/ENCRYPTION_KEY=([a-f0-9]{64})/i);

checks.encryptionKeySet = hasEncryptionKey && keyMatch;

console.log(`  ${hasEncryptionKey ? '✅' : '❌'} ENCRYPTION_KEY defined`);
console.log(
  `  ${keyMatch ? '✅' : '❌'} ENCRYPTION_KEY format valid (64 hex chars)`
);
if (keyMatch) {
  console.log(`     Key length: ${keyMatch[1].length} characters`);
}

// 4. Check encryptionService methods
console.log('\n4️⃣  Checking Encryption Service implementation...');

const encServicePath = path.join(__dirname, 'services/encryptionService.js');
const encServiceContent = fs.readFileSync(encServicePath, 'utf8');

const requiredMethods = [
  'encrypt(',
  'decrypt(',
  'isEncrypted(',
  'encryptObject(',
  'decryptObject(',
  'generateNewKey()',
  'rotateKey(',
];

for (const method of requiredMethods) {
  const hasMethod = encServiceContent.includes(method);
  console.log(`  ${hasMethod ? '✅' : '❌'} Method: ${method}`);
}

// 5. Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');

const allFilesExist = checks.filesExist.every((f) => f.exists);
const allImportsCorrect = checks.importsCorrect.every((f) => f.correct && !f.wrong);
const noUtilsRefs = checks.noUtilsReferences.every((f) => !f.hasUtilsRefs);

console.log(`Files Structure:     ${allFilesExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Import Paths:        ${allImportsCorrect ? '✅ PASS' : '❌ FAIL'}`);
console.log(`No Utils References: ${noUtilsRefs ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Environment Config:  ${checks.encryptionKeySet ? '✅ PASS' : '❌ FAIL'}`);

const allPassed =
  allFilesExist && allImportsCorrect && noUtilsRefs && checks.encryptionKeySet;

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED\n');
  console.log(
    'The encryption implementation is correctly aligned with the folder structure.'
  );
  console.log('\nNext steps:');
  console.log(
    '1. Generate a production encryption key: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
  console.log('2. Update ENCRYPTION_KEY in backend/.env');
  console.log('3. Run the test suite: node test-encryption.js');
  console.log('\n');
  process.exit(0);
} else {
  console.log('\n❌ VERIFICATION FAILED\n');
  console.log('Please address the issues above before proceeding.');
  console.log('\n');
  process.exit(1);
}
