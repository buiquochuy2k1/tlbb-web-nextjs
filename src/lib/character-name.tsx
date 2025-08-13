interface CharacterNameProps {
  charname: string;
  className?: string;
}

/**
 * Character utilities for parsing and formatting character names
 */

export interface ParsedCharacterName {
  name: string;
  color?: string;
}

/**
 * Component to display character name with color codes
 * Automatically parses color codes and applies styling
 */
export function CharacterName({ charname, className }: CharacterNameProps) {
  const parsed = parseCharacterName(charname);

  return (
    <span
      style={parsed.color ? { color: parsed.color } : {}}
      className={`${className || ''} ${parsed.color ? 'drop-shadow-lg font-bold' : ''}`}
    >
      {parsed.name}
    </span>
  );
}

/**
 * Parse character name with color codes
 * Supports formats like:
 * - #eee6600#-09 BossPK
 * - #ecc0011#Y PhongVân
 * - #ff0000#R DragonKnight
 * - #u#G#b BossVD #34 (multiple single char codes)
 * - NormalPlayer (no color code)
 */
export function parseCharacterName(charname: string): ParsedCharacterName {
  console.log('Parsing character name:', charname);

  // Format 1: Hex color code like #rrggbb#Y Name or #rrggbb#-09 Name (PRIORITY)
  const hexColorMatch = charname.match(/^#([0-9a-fA-F]{6,8})#([-\w]+)\s*(.+)$/);
  if (hexColorMatch) {
    const [, colorHex, , name] = hexColorMatch;
    console.log('Hex color match:', { colorHex, name });
    return {
      name: name.trim(),
      color: `#${colorHex.slice(0, 6)}`, // Use first 6 chars for color
    };
  }

  // Format 2: Multiple single character codes like #u#G#b Name
  const multiCodeMatch = charname.match(/^((?:#[a-zA-Z]){2,})\s*(.+)$/);
  if (multiCodeMatch) {
    const [, codes, name] = multiCodeMatch;
    console.log('Multi-code match:', { codes, name });

    // Extract color codes and convert to color
    const colorCodes = codes.match(/#([a-zA-Z])/g);
    if (colorCodes) {
      // Use first color code
      const firstCode = colorCodes[0].replace('#', '').toLowerCase();
      const color = getColorFromCode(firstCode);
      console.log('Color from code:', { firstCode, color });

      return {
        name: name.trim(),
        color: color,
      };
    }
  }

  // Format 3: Simple format like #Y Name
  const simpleMatch = charname.match(/^#([a-zA-Z])\s*(.+)$/);
  if (simpleMatch) {
    const [, code, name] = simpleMatch;
    const color = getColorFromCode(code.toLowerCase());
    console.log('Simple match:', { code, name, color });
    return {
      name: name.trim(),
      color: color,
    };
  }

  console.log('No color code found, returning original name');
  // If no color code, return original name
  return { name: charname };
}

/**
 * Convert single character color codes to hex colors
 */
function getColorFromCode(code: string): string {
  const colorMap: Record<string, string> = {
    r: '#ff0000', // Red
    g: '#00ff00', // Green
    b: '#0000ff', // Blue
    y: '#ffff00', // Yellow
    c: '#00ffff', // Cyan
    m: '#ff00ff', // Magenta
    w: '#ffffff', // White
    k: '#000000', // Black
    u: '#800080', // Purple/Underline
    o: '#ffa500', // Orange
    p: '#ffc0cb', // Pink
    l: '#90ee90', // Light Green
    d: '#8b0000', // Dark Red
    s: '#c0c0c0', // Silver
    e: '#ffaa00', // Orange/Emphasis
    f: '#ff6600', // Fire Orange
    n: '#cccccc', // Neutral Gray
    t: '#00aa00', // Tree Green
    a: '#aa00aa', // Amethyst Purple
    i: '#0099ff', // Ice Blue
    h: '#ffff99', // Highlight Yellow
  };

  return colorMap[code] || '#ffffff'; // Default to white if code not found
}

/**
 * Get character display name without color codes
 */
export function getCharacterDisplayName(charname: string): string {
  const parsed = parseCharacterName(charname);
  return parsed.name;
}

/**
 * Get character color from name
 */
export function getCharacterColor(charname: string): string | null {
  const parsed = parseCharacterName(charname);
  return parsed.color || null;
}

/**
 * Check if character name has color code
 */
export function hasColorCode(charname: string): boolean {
  const parsed = parseCharacterName(charname);
  return !!parsed.color;
}
