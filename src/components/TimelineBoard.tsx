import { useEffect, useRef, type CSSProperties } from 'react';
import { NOW_OFFSET_PERCENT } from '../constants/timeline';
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
    '--now-position': `${nowLinePercent}%`,
  } as CSSProperties;

  nowLinePercentRef.current = nowLinePercent;

  // Realign scroll only when the range changes; per-minute ticks must not
  // fight the user's manual scroll position.
  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const nowLineOffset = panel.scrollWidth * (nowLinePercentRef.current / 100);
    const viewportOffset = panel.clientWidth * (NOW_OFFSET_PERCENT / 100);
    panel.scrollLeft = Math.max(0, nowLineOffset - viewportOffset);
  }, [rangeHours, timelineHours]);

  return (
    <section ref={panelRef} className="timeline-panel" aria-label="Tournament schedule timeline">
      <div className="timeline-content" style={timelineStyle}>
        <div className="now-line" aria-hidden="true" />

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
