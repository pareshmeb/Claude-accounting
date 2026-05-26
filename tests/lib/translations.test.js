import { translations } from '@/lib/translations';

describe('translations', () => {
  describe('language keys', () => {
    it('has both en and gu languages', () => {
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('gu');
    });

    it('all top-level keys in en exist in gu', () => {
      const enKeys = Object.keys(translations.en);
      const guKeys = Object.keys(translations.gu);
      for (const key of enKeys) {
        expect(guKeys).toContain(key);
      }
    });

    it('all top-level keys in gu exist in en', () => {
      const enKeys = Object.keys(translations.en);
      const guKeys = Object.keys(translations.gu);
      for (const key of guKeys) {
        expect(enKeys).toContain(key);
      }
    });
  });

  describe('categories', () => {
    it('en categories.income has 6 items', () => {
      expect(translations.en.categories.income).toHaveLength(6);
    });

    it('gu categories.income has 6 items', () => {
      expect(translations.gu.categories.income).toHaveLength(6);
    });

    it('en categories.expense has 9 items', () => {
      expect(translations.en.categories.expense).toHaveLength(9);
    });

    it('gu categories.expense has 9 items', () => {
      expect(translations.gu.categories.expense).toHaveLength(9);
    });
  });

  describe('placeholders', () => {
    const requiredPlaceholderKeys = [
      'name',
      'email',
      'phone',
      'address',
      'amount',
      'amountOwed',
      'amountOwedToYou',
      'description',
      'creditorDesc',
      'debtorDesc',
      'purchaseDesc',
      'saleDesc',
      'paymentDesc',
      'item',
    ];

    it('en placeholders has all required keys', () => {
      for (const key of requiredPlaceholderKeys) {
        expect(translations.en.placeholders).toHaveProperty(key);
      }
    });

    it('gu placeholders has all required keys', () => {
      for (const key of requiredPlaceholderKeys) {
        expect(translations.gu.placeholders).toHaveProperty(key);
      }
    });
  });

  describe('no empty string values for required fields', () => {
    const requiredFields = [
      'appName',
      'dashboard',
      'transactions',
      'suppliers',
      'customers',
      'purchases',
      'sales',
      'creditors',
      'debtors',
      'reports',
      'balance',
      'income',
      'expenses',
    ];

    it('en has non-empty values for required fields', () => {
      for (const field of requiredFields) {
        expect(translations.en[field]).toBeTruthy();
        expect(translations.en[field]).not.toBe('');
      }
    });

    it('gu has non-empty values for required fields', () => {
      for (const field of requiredFields) {
        expect(translations.gu[field]).toBeTruthy();
        expect(translations.gu[field]).not.toBe('');
      }
    });
  });
});
