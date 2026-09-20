import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CoursePage from './pages/CoursePage';
import Landing from './components/sections/Landing';
import Overview from './components/sections/Overview';
import Politics from './components/sections/Politics';
import ClassList from './components/sections/ClassList';
import ClassDetail from './components/sections/ClassDetail';
import Grading from './components/sections/Grading';
import Resources from './components/sections/Resources';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<CoursePage />}>
          <Route index element={<Navigate to="landing" replace />} />
          <Route path="landing" element={<Landing />} />
          <Route path="overview" element={<Overview />} />
          <Route path="politics" element={<Politics />} />
          <Route path="clases" element={<ClassList />} />
          <Route path="clases/:classId" element={<ClassDetail />} />
          <Route path="grading" element={<Grading />} />
          <Route path="resources" element={<Resources />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
