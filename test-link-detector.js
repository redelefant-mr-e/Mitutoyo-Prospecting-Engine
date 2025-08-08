// Test the link detector
import { detectLinks } from './src/utils/linkDetector.js';

const testCases = [
  'Check out mark-wedell.com for more info',
  'Visit https://example.com and also test.com',
  'Contact us at info@example.com or visit our site',
  'Multiple domains: google.com, github.com, and https://stackoverflow.com',
  'Plain text without domains',
  'mark-wedell.com is a great site',
  'test@example.com and mark-wedell.com are both valid'
];

console.log('🧪 Testing link detector...\n');

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: "${test}"`);
  console.log(`Result: ${detectLinks(test)}`);
  console.log('---');
});
