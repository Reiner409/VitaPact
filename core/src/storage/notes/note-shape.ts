import { isDate, isLiteral, isString, oneOf, shape } from '../validation/shape';

const noteDates = { id: isString, date: isDate, createdAt: isString, updatedAt: isString };

export const isNote = oneOf(
  shape({ ...noteDates, kind: isLiteral('plain'), title: isString, body: isString, tag: isString }),
  shape({ ...noteDates, kind: isLiteral('protected'), ciphertext: isString, iv: isString }),
);
