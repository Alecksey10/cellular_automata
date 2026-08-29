// Sidebar.jsx
import { NavLink } from 'react-router';
import { useState } from 'react';

/**
 * @param {Object} props
 * @param {Array<{ to: string, icon: string, label: string }>} props.items
 *
 * icon — путь к SVG-файлу, например "/icons/profile.svg"
 */
interface item
{
  to:string, 
  icon:string,
  label:string
}
interface SidebarProps {
  items?: item[]; // знак ? делает проп необязательным
}
export default function Sidebar({ items = [] }:SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? 220 : 80,
        background: '#1e1e2f',
        color: '#fff',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        flexShrink: 0,            // ← чтобы не сжимался
      }}
    >
      {items.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          title={label}           // ← тултип при свёрнутом состоянии
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 18px',
            color: isActive ? '#60a5fa' : '#ccc',
            textDecoration: 'none',
            background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent',
            borderRadius: 8,
            margin: '2px 8px',
            whiteSpace: 'nowrap',
          })}
        >
          {/* SVG-иконка из файла */}
          <img
            src={icon}
            alt=""
            style={{
              width: 24,
              height: 24,
              minWidth: 24,
              filter: 'brightness(0) invert(1)', // ← делает SVG белым
            }}
          />

          {/* Текст — виден только при раскрытии */}
          <span
            style={{
              opacity: expanded ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}