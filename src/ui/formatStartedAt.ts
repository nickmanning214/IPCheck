const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

export const formatStartedAt = ({
  startedAt,
}: {
  readonly startedAt: number;
}) => `Started ${timeFormatter.format(startedAt)}`;
