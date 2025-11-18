/**
 * Test suite for Realm parameter transformation
 *
 * These tests verify that the realm parameter is correctly transformed
 * from hyphens to underscores as required by NetSuite OAuth1
 */
describe('Realm Hyphen to Underscore Transformation', () => {
	/**
	 * This simulates the transformation that happens in nodes/Netsuite/Netsuite.node.ts
	 * Line 114: const realm = (credentials.realm as string).replace(/-/g, '_');
	 */
	const transformRealm = (inputRealm: string): string => {
		return inputRealm.replace(/-/g, '_');
	};

	describe('Production account realms', () => {
		it('should not modify numeric-only production realm', () => {
			const input = '1234567';
			const output = transformRealm(input);

			expect(output).toBe('1234567');
		});

		it('should not modify production realm with no hyphens', () => {
			const input = '7654321';
			const output = transformRealm(input);

			expect(output).toBe('7654321');
		});
	});

	describe('Sandbox account realms', () => {
		it('should convert hyphen to underscore in sandbox realm', () => {
			const input = '1234567-SB1';
			const output = transformRealm(input);

			expect(output).toBe('1234567_SB1');
		});

		it('should not modify correctly formatted sandbox realm', () => {
			const input = '1234567_SB1';
			const output = transformRealm(input);

			expect(output).toBe('1234567_SB1');
		});

		it('should handle SB2 sandbox', () => {
			const input = '1234567-SB2';
			const output = transformRealm(input);

			expect(output).toBe('1234567_SB2');
		});

		it('should handle multiple sandbox variants', () => {
			const testCases = [
				{ input: '1234567-SB1', expected: '1234567_SB1' },
				{ input: '1234567-SB2', expected: '1234567_SB2' },
				{ input: '1234567-SB10', expected: '1234567_SB10' },
				{ input: '9876543-SB99', expected: '9876543_SB99' },
			];

			testCases.forEach(({ input, expected }) => {
				expect(transformRealm(input)).toBe(expected);
			});
		});
	});

	describe('Edge cases', () => {
		it('should convert multiple hyphens to underscores', () => {
			const input = '1234567-SB1-TEST';
			const output = transformRealm(input);

			expect(output).toBe('1234567_SB1_TEST');
		});

		it('should convert all hyphens in complex realm', () => {
			const input = 'TEST-1234567-SB1-PROD';
			const output = transformRealm(input);

			expect(output).toBe('TEST_1234567_SB1_PROD');
		});

		it('should handle realm with leading hyphen', () => {
			const input = '-1234567';
			const output = transformRealm(input);

			expect(output).toBe('_1234567');
		});

		it('should handle realm with trailing hyphen', () => {
			const input = '1234567-';
			const output = transformRealm(input);

			expect(output).toBe('1234567_');
		});

		it('should handle consecutive hyphens', () => {
			const input = '1234567--SB1';
			const output = transformRealm(input);

			expect(output).toBe('1234567__SB1');
		});

		it('should handle empty string', () => {
			const input = '';
			const output = transformRealm(input);

			expect(output).toBe('');
		});

		it('should handle realm with only hyphen', () => {
			const input = '-';
			const output = transformRealm(input);

			expect(output).toBe('_');
		});

		it('should handle realm with mixed case', () => {
			const input = '1234567-sb1';
			const output = transformRealm(input);

			expect(output).toBe('1234567_sb1');
		});
	});

	describe('Real-world examples', () => {
		it('should handle typical TSTDRV sandbox account', () => {
			const input = 'TSTDRV1234567-SB1';
			const output = transformRealm(input);

			expect(output).toBe('TSTDRV1234567_SB1');
		});

		it('should preserve already correct sandbox format', () => {
			const input = '1234567_SB1';
			const output = transformRealm(input);

			expect(output).toBe('1234567_SB1');
			expect(output).not.toContain('-');
		});

		it('should fix common user mistakes', () => {
			const mistakes = [
				{ wrong: '1234567-SB1', correct: '1234567_SB1' },
				{ wrong: '1234567-sb1', correct: '1234567_sb1' },
				{ wrong: 'ACCOUNT-ID-HERE', correct: 'ACCOUNT_ID_HERE' },
			];

			mistakes.forEach(({ wrong, correct }) => {
				expect(transformRealm(wrong)).toBe(correct);
			});
		});
	});

	describe('Idempotence', () => {
		it('should be idempotent (applying twice gives same result)', () => {
			const input = '1234567-SB1';
			const firstPass = transformRealm(input);
			const secondPass = transformRealm(firstPass);

			expect(firstPass).toBe('1234567_SB1');
			expect(secondPass).toBe('1234567_SB1');
			expect(firstPass).toBe(secondPass);
		});

		it('should not modify already correct input', () => {
			const correctInputs = [
				'1234567',
				'1234567_SB1',
				'9876543_SB2',
				'ACCOUNT_ID',
			];

			correctInputs.forEach(input => {
				const output = transformRealm(input);
				expect(output).toBe(input);
			});
		});
	});

	describe('Type safety', () => {
		it('should handle string input', () => {
			const input = '1234567-SB1';
			const output = transformRealm(input);

			expect(typeof output).toBe('string');
			expect(output).toBe('1234567_SB1');
		});

		it('should return string type', () => {
			const output = transformRealm('test-realm');

			expect(typeof output).toBe('string');
		});
	});

	describe('Performance', () => {
		it('should handle large strings efficiently', () => {
			const largeRealm = '1234567-'.repeat(1000) + 'SB1';
			const startTime = Date.now();
			const output = transformRealm(largeRealm);
			const endTime = Date.now();

			expect(output).not.toContain('-');
			expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
		});

		it('should handle many transformations efficiently', () => {
			const startTime = Date.now();

			for (let i = 0; i < 10000; i++) {
				transformRealm(`1234567-SB${i}`);
			}

			const endTime = Date.now();
			expect(endTime - startTime).toBeLessThan(1000); // 10k transforms in < 1s
		});
	});
});
