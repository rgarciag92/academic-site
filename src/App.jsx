import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CoursePage from './pages/CoursePage';
import Landing from './components/sections/Landing';
import Overview from './components/sections/Overview';
import Politics from './components/sections/Politics';
import ClassList from './components/sections/ClassList';
import ClassDetail from './components/sections/ClassDetail';
import Project from './components/sections/Project';
import Exam from './components/sections/Exam';
import Grades from './components/sections/Grades';

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
          <Route path="project" element={<Project />} />
          <Route path="exam" element={<Exam />} />
          <Route path="grades" element={<Grades />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
