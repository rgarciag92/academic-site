import { NavLink } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import {
  IconHome,
  IconLayoutDashboard,
  IconCalendarWeek,
  IconChecklist,
  IconChartBar,
  IconFolder,
} from '@tabler/icons-react';

const NAV_ITEMS = [
  { key: 'landing', label: 'Inicio', icon: IconHome },
  { key: 'overview', label: 'Información general', icon: IconLayoutDashboard },
  { key: 'politics', label: 'Políticas del curso', icon: IconCalendarWeek },
  { key: 'clases', label: 'Clases', icon: IconChecklist },
  { key: 'grading', label: 'Proyecto Final', icon: IconChartBar },
  { key: 'resources', label: 'Calificaciones', icon: IconFolder },
];

export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();

  return (
    <>
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const to = `/${key}`;
        return (
          <NavLink
            key={key}
            component={Link}
            to={to}
            label={label}
            leftSection={<Icon size={16} stroke={1.6} />}
            active={pathname === to || pathname.startsWith(`${to}/`)}
            onClick={onNavigate}
            variant="light"
            mb={2}
          />
        );
      })}
    </>
  );
}
