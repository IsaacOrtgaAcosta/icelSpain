import { useState } from 'react';
import { Button, Progress, rgba, useMantineTheme } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import classes from './ButtonProgress.module.css';

export type ButtonProgressProps = {
  title?: string;
  inProgressTitle?: string;
  progressFinished?: string;
  // Add any props you want to pass to the ButtonProgress component
};

export const ButtonProgress = ({ title, inProgressTitle, progressFinished }: ButtonProgressProps) => {
  const theme = useMantineTheme();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20
  );

  return (
    <Button
      fullWidth
      className={classes.button}
      onClick={() => (loaded ? setLoaded(false) : !interval.active && interval.start())}
      radius="md"
    >
      <div className={classes.label}>
        {progress !== 0 ? (inProgressTitle)  : loaded ? (progressFinished) : (title)}
      </div>
      {progress !== 0 && (
        <Progress
          value={progress}
          className={classes.progress}
          color={rgba(theme.colors.blue[2], 0.35)}
          radius="sm"
        />
      )}
    </Button>
  );
}