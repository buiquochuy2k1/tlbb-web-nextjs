import { parseCharacterName } from '@/lib/character-utils';

interface CharacterNameProps {
  charname: string;
  className?: string;
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
