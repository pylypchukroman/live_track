import { useEffect, useRef, type CSSProperties } from 'react';
import { INFO_COLUMN_PX, NOW_OFFSET_PERCENT } from '../constants/timeline';
import type { TimeMark, Tournament } from '../types';
import { getNowLinePercent, getTimelineContentWidthPercent } from '../utils/timeline';
import TimelineHeader from './TimelineHeader';
import TrackRow from './TrackRow';

type TimelineBoardProps = {
  tournaments: Tournament[];
  baseline: number;
  currentTime: number;
  rangeHours: number;
  timelineHours: number;
  timeMarks: TimeMark[];
  resolvedStarts: Map<string, number>;
  onSelectTournament: (tournament: Tournament) => void;
};

function TimelineBoard({
  tournaments,
  baseline,
  currentTime,
  rangeHours,
  timelineHours,
  timeMarks,
  resolvedStarts,
  onSelectTournament,
}: TimelineBoardProps) {
  const panelRef = useRef<HTMLElement>(null);
  const nowLinePercentRef = useRef(0);
  const nowLinePercent = getNowLinePercent(currentTime, rangeHours, timelineHours);
  const contentWidthPercent = getTimelineContentWidthPercent(currentTime, rangeHours, timelineHours);
  const timelineStyle = {
    width: `${contentWidthPercent}%`,
    '--info-col': `${INFO_COLUMN_PX}px`,
    '--now-frac': String(nowLinePercent / 100),
  } as CSSProperties;

  nowLinePercentRef.current = nowLinePercent;

  // Realign scroll only when the range changes; per-minute ticks must not
  // fight the user's manual scroll position.
  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    // Lanes start after the fixed info column, so the now-line offset is
    // computed within the lane area only.
    const laneWidth = panel.scrollWidth - INFO_COLUMN_PX;
    const nowLineOffset = INFO_COLUMN_PX + laneWidth * (nowLinePercentRef.current / 100);
    const viewportLaneWidth = panel.clientWidth - INFO_COLUMN_PX;
    const viewportTarget = INFO_COLUMN_PX + viewportLaneWidth * (NOW_OFFSET_PERCENT / 100);
    panel.scrollLeft = Math.max(0, nowLineOffset - viewportTarget);
  }, [rangeHours, timelineHours]);

  return (
    <section ref={panelRef} className="timeline-panel" aria-label="Tournament schedule timeline">
      <div className="timeline-content" style={timelineStyle}>
        <div className="now-line" aria-hidden="true">
          <span>NOW</span>
        </div>

        <TimelineHeader timeMarks={timeMarks} />

        <div className="tracks">
          {tournaments.map((tournament) => (
            <TrackRow
              key={tournament.id}
              tournament={tournament}
              startTime={resolvedStarts.get(tournament.id) ?? baseline}
              currentTime={currentTime}
              rangeHours={rangeHours}
              timelineHours={timelineHours}
              timeMarks={timeMarks}
              onSelectTournament={onSelectTournament}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TimelineBoard;
