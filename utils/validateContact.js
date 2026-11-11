// utils/validateContact.js

export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
};

/**
 * Validasi payload kontak.
 * Mengembalikan { valid: boolean, errors: { [field]: string } }
 */
export function validateContact({ nama, email, pesan } = {}) {
  const errors = {};

  const namaTrim = String(nama || '').trim();
  if (!namaTrim) {
    errors.nama = 'Nama wajib diisi.';
  } else if (namaTrim.length < 2) {
    errors.nama = 'Nama minimal 2 karakter.';
  } else if (namaTrim.length > 80) {
    errors.nama = 'Nama maksimal 80 karakter.';
  }

  if (!email) {
    errors.email = 'Email wajib diisi.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Format email tidak valid.';
  }

  const pesanTrim = String(pesan || '').trim();
  if (!pesanTrim) {
    errors.pesan = 'Pesan wajib diisi.';
  } else if (pesanTrim.length < 10) {
    errors.pesan = 'Pesan minimal 10 karakter.';
  } else if (pesanTrim.length > 1000) {
    errors.pesan = 'Pesan maksimal 1000 karakter.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}