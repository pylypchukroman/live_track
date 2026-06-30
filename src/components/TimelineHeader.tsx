import type { TimeMark } from '../types';

type TimelineHeaderProps = {
  timeMarks: TimeMark[];
};

function TimelineHeader({ timeMarks }: TimelineHeaderProps) {
  return (
    <div className="timeline-header">
      <div className="time-scale">
        {timeMarks.map((mark) => (
          <div
            className="time-mark"
            key={`${mark.label}-${mark.leftPercent}`}
            style={{ left: `${mark.leftPercent}%` }}
          >
            <span>{mark.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimelineHeader;
