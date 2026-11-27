import { useCallback, useState } from 'react';
import {
  ABOUT_TIMELINE_MILESTONES,
  AboutTimelineMilestone,
} from '@/constants/about-timeline-data';

/**
 * Custom Hook quản lý trạng thái tương tác hover/chọn cột mốc trên Lược đồ hình thành (08/2010 → 11/2026).
 */
export function useAboutTimeline() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleHoverMilestone = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleSelectMilestone = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const activeMilestone: AboutTimelineMilestone =
    ABOUT_TIMELINE_MILESTONES[activeIndex] || ABOUT_TIMELINE_MILESTONES[0];

  return {
    milestones: ABOUT_TIMELINE_MILESTONES,
    activeIndex,
    activeMilestone,
    handleHoverMilestone,
    handleSelectMilestone,
  };
}
