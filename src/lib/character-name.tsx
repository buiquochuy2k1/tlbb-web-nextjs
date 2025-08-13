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
 * - NormalPlayer (no color code)
 */
export function parseCharacterName(charname: string): ParsedCharacterName {
  // Check if name has color code format: #rrggbb#Y Name or #rrggbb#-09 Name
  // Supports various color codes: Y=Yellow, W=White, R=Red, G=Green, B=Blue, C=Cyan, M=Magenta
  // Also supports numeric codes like -09, -10, etc.
  // Flexible hex length (6-8 characters) to support variations like #eee6600
  const colorMatch = charname.match(/^#([0-9a-fA-F]{6,8})#([-\w]+)\s*(.+)$/);

  if (colorMatch) {
    const [, colorHex, , name] = colorMatch;
    return {
      name: name.trim(),
      color: `#${colorHex.slice(0, 6)}`, // Use first 6 chars for color
    };
  }

  // If no color code, return original name
  return { name: charname };
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
