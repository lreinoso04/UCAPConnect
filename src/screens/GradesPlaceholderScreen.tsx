import { FeaturePlaceholderScreen } from '../components/FeaturePlaceholderScreen';
import { useAuth } from '../context/AuthContext';
import { getFeaturePlaceholder, resolveSegment } from '../roles/segmentConfig';

export function GradesPlaceholderScreen() {
  const { user, isGuest } = useAuth();
  const segment = resolveSegment(isGuest, user?.rol);
  const p = getFeaturePlaceholder(segment, 'grades');
  return <FeaturePlaceholderScreen icon="ribbon-outline" title={p.title} description={p.description} />;
}
