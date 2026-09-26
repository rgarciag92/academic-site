import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import CoursePage from './pages/CoursePage';
import ContentPage from './components/sections/ContentPage';
import ClassList from './components/sections/ClassList';
import ClassDetail from './components/sections/ClassDetail';
import { site } from './siteConfig';

// The first Sidebar row in the sheet is the home page.
const HOME = site.course.sidebar[0].page;

// Any other path is a page from the sheet's `Pages` tab (see SHEET_SETUP.md).
function SheetPage() {
  const { page } = useParams();
  if (!site.course.pages[page] && page !== HOME) return <Navigate to={`/${HOME}`} replace />;
  return <ContentPage key={page} page={page} />;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<CoursePage />}>
          <Route index element={<Navigate to={HOME} replace />} />
          <Route path="clases" element={<ClassList />} />
          <Route path="clases/:classId" element={<ClassDetail />} />
          <Route path=":page" element={<SheetPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
