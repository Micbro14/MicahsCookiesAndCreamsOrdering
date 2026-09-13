export interface FlavorSectionNavItem {
  id: string;
  label: string;
  color?: string;
}

interface CategoryNavProps {
  sections: FlavorSectionNavItem[];
}

export function CategoryNav({ sections }: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label="Flavor sections">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="category-link"
              style={section.color ? { backgroundColor: section.color, borderColor: section.color } : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default CategoryNav;
