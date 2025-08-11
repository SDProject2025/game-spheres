import {describe, expect, test} from '@jest/globals';
import add from './example';

describe('add', () => {
    test('adds two numbers', () => {
        expect(add(2,3)).toBe(5);
        expect(add(-1,1)).toBe(0);
    });
});