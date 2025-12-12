
export const ARROW_CHARS = '←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱↲↳↴↵↶↷↸↹↺↻↼↽↾↿⇀⇁⇂⇃⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍⇎⇏⇐⇑⇒⇓⇔⇕▖⇗⇘⇙⇚⇛⇜⇝⇞⇟⇠⇡⇢⇣⇤⇥⇦⇧⇨⇩⇪⇫⇬⇭⇮⇯⇰⇱⇲⇳⇴⇵⇶⇷⇸⇹⇺⇻⇼⇽⇾⇿';
const BASE = ARROW_CHARS.length;

const ARROW_MAP: { [key: string]: number } = Object.fromEntries(
  Array.from(ARROW_CHARS).map((c, i) => [c, i])
);

/**
 * Encodes a Uint8Array into an "arrow" string representation.
 * Each byte is converted into a 2-character sequence using the arrow characters.
 * @param data The Uint8Array to encode.
 * @returns A string composed of arrow characters.
 */
export function encode(data: Uint8Array): string {
  return Array.from(data)
    .map(byte => {
      const high = Math.floor(byte / BASE);
      const low = byte % BASE;
      return ARROW_CHARS[high] + ARROW_CHARS[low];
    })
    .join('');
}

/**
 * Decodes an "arrow" string back into a Uint8Array.
 * @param str The arrow string to decode.
 * @returns The decoded Uint8Array.
 */
export function decode(str: string): Uint8Array {
  const bytes: number[] = [];
  const cleanStr = str.replace(/\s/g, '');
  const len = Math.floor(cleanStr.length / 2) * 2;

  for (let i = 0; i < len; i += 2) {
    const highChar = cleanStr[i];
    const lowChar = cleanStr[i + 1];

    const high = ARROW_MAP[highChar];
    const low = ARROW_MAP[lowChar];

    if (high === undefined || low === undefined) {
      throw new Error('Invalid character in arrow code sequence.');
    }

    const byte = high * BASE + low;
    bytes.push(byte);
  }

  return new Uint8Array(bytes);
}
