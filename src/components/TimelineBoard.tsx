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
  const nowLinePercent = getNowLinePercent(rangeHours, timelineHours);
  const contentWidthPercent = getTimelineContentWidthPercent(rangeHours, timelineHours);
  const timelineStyle = {
    width: `${contentWidthPercent}%`,
    '--now-position': `${nowLinePercent}%`,
  } as CSSProperties;

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const nowLineOffset = panel.scrollWidth * (nowLinePercent / 100);
    const viewportOffset = panel.clientWidth * (NOW_OFFSET_PERCENT / 100);
    panel.scrollLeft = Math.max(0, nowLineOffset - viewportOffset);
  }, [nowLinePercent, rangeHours, timelineHours]);

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
