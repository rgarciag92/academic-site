import { NavLink } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import {
  IconHome,
  IconLayoutDashboard,
  IconCalendarWeek,
  IconChecklist,
  IconChartBar,
  IconFolder,
  IconBook,
  IconSchool,
  IconFileText,
  IconClipboardList,
  IconCode,
  IconUsers,
  IconClock,
  IconStar,
  IconLink,
  IconMessage,
  IconVideo,
  IconInfoCircle,
  IconBookUpload,
} from '@tabler/icons-react';

// Names usable in the sheet's Sidebar `icon` column (see SHEET_SETUP.md).
// Unknown or blank names fall back to `file`.
const ICONS = {
  home: IconHome,
  dashboard: IconLayoutDashboard,
  calendar: IconCalendarWeek,
  checklist: IconChecklist,
  chart: IconChartBar,
  folder: IconFolder,
  book: IconBook,
  school: IconSchool,
  file: IconFileText,
  clipboard: IconClipboardList,
  code: IconCode,
  users: IconUsers,
  clock: IconClock,
  star: IconStar,
  link: IconLink,
  message: IconMessage,
  video: IconVideo,
  info: IconInfoCircle,
  bookUpload: IconBookUpload
};

export default function Sidebar({ items, onNavigate }) {
  const { pathname } = useLocation();

  return (
    <>
      {items.map(({ page, label, icon }) => {
        const to = `/${page}`;
        const Icon = ICONS[icon] ?? IconFileText;
        return (
          <NavLink
            key={page}
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
