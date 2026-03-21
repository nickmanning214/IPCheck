import { Match, pipe } from "effect";

export const pickFailureDetail = ({
  stderr,
  stdout,
}: {
  readonly stderr: string;
  readonly stdout: string;
}) =>
  pipe(stderr.trim(), (stderrText) =>
    pipe(
      Match.value(stderrText.length > 0),
      Match.when(true, () => stderrText),
      Match.orElse(() =>
        pipe(stdout.trim(), (stdoutText) =>
          pipe(
            Match.value(stdoutText.length > 0),
            Match.when(true, () => stdoutText),
            Match.orElse(() => "Connection check failed"),
          ),
        ),
      ),
    ),
  );
