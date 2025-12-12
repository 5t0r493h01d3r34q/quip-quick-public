
export const SUSSY_CHARS_LIST = ['ඞ', 'ඞී', 'ඩැ', 'ඩො', 'ඩෙ', 'ඩෘ', 'ඩ', 'ඩ්ඩු', 'ඩ්‍ය', 'ඩෑ', 'ධෛ', 'ච', 'ටී', 'චි', 'චැ', 'ට', 'චෙ', 'ඔ', 'ඖ', 'ඕ', 'ඹ', 'ඹී', 'ඹෟ'];
const BASE = SUSSY_CHARS_LIST.length;

const SUSSY_MAP: { [key: string]: number } = Object.fromEntries(
  SUSSY_CHARS_LIST.map((c, i) => [c, i])
);

// For decoding, we must match longer characters first to avoid ambiguity
// (e.g., matching 'ට' instead of 'ටී').
const SUSSY_CHARS_SORTED_FOR_DECODING = [...SUSSY_CHARS_LIST].sort((a, b) => b.length - a.length);

/**
 * Encodes a Uint8Array into a "sussy" string representation.
 * Each byte is converted into a 2-character sequence using the sussy characters.
 * @param data The Uint8Array to encode.
 * @returns A string composed of sussy characters.
 */
export function encode(data: Uint8Array): string {
  return Array.from(data)
    .map(byte => {
      if (byte > 255) throw new Error("Invalid byte value");
      const high = Math.floor(byte / BASE);
      const low = byte % BASE;
      return SUSSY_CHARS_LIST[high] + SUSSY_CHARS_LIST[low];
    })
    .join('');
}

/**
 * Decodes a "sussy" string back into a Uint8Array.
 * @param str The sussy string to decode.
 * @returns The decoded Uint8Array.
 */
export function decode(str: string): Uint8Array {
  const bytes: number[] = [];
  let remainingStr = str.replace(/\s/g, '');
  
  const decodedSymbols: string[] = [];
  while (remainingStr.length > 0) {
      let found = false;
      for (const sussyChar of SUSSY_CHARS_SORTED_FOR_DECODING) {
          if (remainingStr.startsWith(sussyChar)) {
              decodedSymbols.push(sussyChar);
              remainingStr = remainingStr.substring(sussyChar.length);
              found = true;
              break;
          }
      }
      if (!found) {
          throw new Error(`Invalid sequence in sussy code string at: ${remainingStr.substring(0, 10)}`);
      }
  }

  const len = Math.floor(decodedSymbols.length / 2) * 2;

  for (let i = 0; i < len; i += 2) {
    const highChar = decodedSymbols[i];
    const lowChar = decodedSymbols[i + 1];

    const high = SUSSY_MAP[highChar];
    const low = SUSSY_MAP[lowChar];

    if (high === undefined || low === undefined) {
      throw new Error('Invalid character in sussy code sequence.');
    }

    const byte = high * BASE + low;
    bytes.push(byte);
  }

  return new Uint8Array(bytes);
}
