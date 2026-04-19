import { FeaturePlaceholderScreen } from '../components/FeaturePlaceholderScreen';
import { useAuth } from '../context/AuthContext';
import { getFeaturePlaceholder, resolveSegment } from '../roles/segmentConfig';

export function MyCoursesPlaceholderScreen() {
  const { user } = useAuth();
  const isGuest = !user;
  const segment = resolveSegment(isGuest, user?.rol);
  const p = getFeaturePlaceholder(segment, 'myCourses');
  return <FeaturePlaceholderScreen icon="book-outline" title={p.title} description={p.description} />;
}
