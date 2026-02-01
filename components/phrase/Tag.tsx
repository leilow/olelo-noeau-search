import tagCategoryMap from '@/data/tag-category-map.json';

interface TagProps {
  tag: string;
  onTagClick?: (tag: string) => void;
}

const categoryColors: Record<string, string> = {
  plants: 'bg-category-plants',
  birds: 'bg-category-birds',
  general: 'bg-category-general',
  'fish + aquatic life': 'bg-category-fish-aquatic',
  places: 'bg-category-places',
  names: 'bg-category-names',
};

export default function Tag({ tag, onTagClick }: TagProps) {
  // Look up the tag's category from the global mapping (built from CSV files)
  const tagCategory = (tagCategoryMap as Record<string, string>)[tag];
  
  // Use the tag's category color if found, otherwise default to general
  const bgColor = (tagCategory && categoryColors[tagCategory]) 
    ? categoryColors[tagCategory] 
    : 'bg-category-general';
  
  const displayTag = tag.toLowerCase();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onTagClick) {
      e.preventDefault();
      onTagClick(tag);
    }
    // If no callback, fall back to default link behavior
  };
  
  return (
    <a
      href={onTagClick ? '#' : `/search?tags=${encodeURIComponent(tag)}`}
      onClick={handleClick}
      className={`tag-link ${bgColor} text-text`}
    >
      {displayTag}
    </a>
  );
}
