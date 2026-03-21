import { Match, pipe } from "effect";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

export const formatCheckedAt = ({
  checkedAt,
}: {
  readonly checkedAt: number | null;
}) =>
  pipe(
    Match.value(checkedAt),
    Match.when(null, () => "Waiting for the first completed check"),
    Match.orElse((value) => `Last checked at ${timeFormatter.format(value)}`),
  );
