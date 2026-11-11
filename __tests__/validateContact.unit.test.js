// __tests__/validateContact.unit.test.js
import { validateContact } from '../utils/validateContact';

describe('validateContact()', () => {
  const validInput = {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    message: 'Halo, saya ingin berkolaborasi.',
  };

  it('mengembalikan valid=true untuk input benar', () => {
    const result = validateContact(validInput);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('menolak nama kosong', () => {
    const result = validateContact({ ...validInput, name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('menolak email tidak valid', () => {
    const result = validateContact({ ...validInput, email: 'bukan-email' });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('menolak pesan terlalu pendek', () => {
    const result = validateContact({ ...validInput, message: 'hi' });
    expect(result.isValid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });

  it('menolak semua field kosong', () => {
    const result = validateContact({ name: '', email: '', message: '' });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(3);
  });
});