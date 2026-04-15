import { FeaturePlaceholderScreen } from '../components/FeaturePlaceholderScreen';
import { useAuth } from '../context/AuthContext';
import { getFeaturePlaceholder, resolveSegment } from '../roles/segmentConfig';

export function SchedulePlaceholderScreen() {
  const { user, isGuest } = useAuth();
  const segment = resolveSegment(isGuest, user?.rol);
  const p = getFeaturePlaceholder(segment, 'schedule');
  return <FeaturePlaceholderScreen icon="calendar-outline" title={p.title} description={p.description} />;
}
