import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import {
  getProjectProgress,
  ProjectsApiError,
} from "@/app/features/projects/api/projectsApi";
import type {
  DwellingProgressStage,
  ProjectProgress,
} from "@/app/features/projects/types";

type ProjectProgressSummaryProps = {
  projectId: string;
};

const progressStages: Array<{
  stage: DwellingProgressStage;
  label: string;
}> = [
  { stage: "structure", label: "Estructura" },
  { stage: "bracing", label: "Arriostramientos" },
  { stage: "interior_board", label: "Placa interior" },
  { stage: "insulation", label: "Aislamientos" },
  { stage: "exterior_board", label: "Tablero exterior" },
  { stage: "facade", label: "Fachada" },
  { stage: "roof", label: "Cubierta" },
  { stage: "carpentry", label: "Carpintería" },
];

export const ProjectProgressSummary = ({
  projectId,
}: ProjectProgressSummaryProps) => {
  const [progress, setProgress] =
    useState<ProjectProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const projectProgress =
          await getProjectProgress(projectId);

        if (!cancelled) {
          setProgress(projectProgress);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ProjectsApiError
              ? error.message
              : "Ocurrió un error al cargar el progreso.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (isLoading) {
    return (
      <Card withBorder radius="md" padding="xl">
        <Center>
          <Loader color="yellow" />
        </Center>
      </Card>
    );
  }

  if (errorMessage || !progress) {
    return (
      <Alert
        color="red"
        title="No se pudo cargar el progreso"
      >
        {errorMessage ??
          "El progreso del proyecto no está disponible."}
      </Alert>
    );
  }

  const percentages = new Map(
    progress.items.map((item) => [
      item.stage,
      item.percentage,
    ]),
  );

  const displayedProgress = [
    {
      key: "installations",
      label: "Instalaciones",
      percentage: progress.installations_percentage,
    },
    ...progressStages.map(({ stage, label }) => ({
      key: stage,
      label,
      percentage: percentages.get(stage) ?? 0,
    })),
  ];

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Title order={2}>Progreso del proyecto</Title>

            <Text size="sm" c="dimmed">
              Media calculada a partir de{" "}
              {progress.dwelling_count}{" "}
              {progress.dwelling_count === 1
                ? "vivienda"
                : "viviendas"}.
            </Text>
          </Stack>

          <Text fw={700} size="xl">
            {progress.overall_percentage.toFixed(1)}%
          </Text>
        </Group>

        <Progress
          value={progress.overall_percentage}
          color="yellow"
          size="lg"
          radius="xl"
        />

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {displayedProgress.map((item) => (
            <Stack key={item.key} gap={6}>
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  {item.label}
                </Text>

                <Text size="sm" c="dimmed">
                  {item.percentage.toFixed(1)}%
                </Text>
              </Group>

              <Progress
                value={item.percentage}
                color="yellow"
                size="md"
                radius="xl"
              />
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Card>
  );
};