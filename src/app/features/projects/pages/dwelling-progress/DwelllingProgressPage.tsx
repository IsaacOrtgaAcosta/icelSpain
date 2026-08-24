import { useEffect, useState } from "react";
import { useAuth } from "@/app/features/auth/context/auth-context";
import {
  Alert,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Slider,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import {
  getDwellingProgress,
  getProject,
  ProjectsApiError,
  updateDwellingProgress,
} from "@/app/features/projects/api/projectsApi";
import type {
  Dwelling,
  DwellingProgress,
  DwellingProgressStage,
  Project,
  DwellingProgressItem,
} from "@/app/features/projects/types";

type ProgressStageInformation = {
  stage: DwellingProgressStage;
  label: string;
};

const mainStages: ProgressStageInformation[] = [
  { stage: "structure", label: "Estructura" },
  { stage: "bracing", label: "Arriostramientos" },
  { stage: "interior_board", label: "Placa interior" },
  { stage: "insulation", label: "Aislamientos" },
  { stage: "exterior_board", label: "Tablero exterior" },
  { stage: "facade", label: "Fachada" },
  { stage: "roof", label: "Cubierta" },
  { stage: "carpentry", label: "Carpintería" },
];

const installationStages: ProgressStageInformation[] = [
  { stage: "electricity", label: "Electricidad" },
  { stage: "plumbing", label: "Fontanería" },
  {
    stage: "air_conditioning",
    label: "Aire acondicionado",
  },
  { stage: "sanitation", label: "Saneamiento" },
  { stage: "home_automation", label: "Domótica" },
];

const createProgressValues = (
  items: DwellingProgressItem[],
): Partial<Record<DwellingProgressStage, number>> =>
  items.reduce<Partial<Record<DwellingProgressStage, number>>>(
    (values, item) => {
      values[item.stage] = item.percentage;
      return values;
    },
    {},
  );

export const DwellingProgressPage = () => {
  const { projectId, dwellingId } = useParams<{
    projectId: string;
    dwellingId: string;
  }>();

  const { user } = useAuth();

  const canEditProgress =
    user?.role === "owner" ||
    user?.role === "architect" ||
    user?.role === "site_manager";

  const [project, setProject] = useState<Project | null>(null);
  const [dwelling, setDwelling] = useState<Dwelling | null>(null);
  const [progress, setProgress] = useState<DwellingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressValues, setProgressValues] = useState<
    Partial<Record<DwellingProgressStage, number>>
  >({});
  const [savingStage, setSavingStage] = useState<DwellingProgressStage | null>(
    null,
  );

  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDwelling = async (): Promise<void> => {
      if (!projectId || !dwellingId) {
        setErrorMessage("No se ha indicado ninguna vivienda.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [projectDetail, dwellingProgress] = await Promise.all([
          getProject(projectId),
          getDwellingProgress(projectId, dwellingId),
        ]);

        const selectedDwelling = projectDetail.dwellings.find(
          (item) => item.id === dwellingId,
        );

        if (!selectedDwelling) {
          throw new ProjectsApiError("No se encontró la vivienda.", 404);
        }

        if (!cancelled) {
          setProject(projectDetail);
          setDwelling(selectedDwelling);
          setProgress(dwellingProgress);
          setProgressValues(createProgressValues(dwellingProgress.items));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ProjectsApiError
              ? error.message
              : "Ocurrió un error al cargar la vivienda.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDwelling();

    return () => {
      cancelled = true;
    };
  }, [projectId, dwellingId]);

  const handleProgressChange = (
    stage: DwellingProgressStage,
    percentage: number,
  ): void => {
    setProgressValues((current) => ({
      ...current,
      [stage]: percentage,
    }));
  };

  const handleProgressChangeEnd = async (
    stage: DwellingProgressStage,
    percentage: number,
  ): Promise<void> => {
    if (!projectId || !dwellingId || !canEditProgress) {
      return;
    }

    setSavingStage(stage);
    setSaveErrorMessage(null);

    try {
      const updatedProgress = await updateDwellingProgress(
        projectId,
        dwellingId,
        stage,
        { percentage },
      );

      setProgress(updatedProgress);
      setProgressValues(createProgressValues(updatedProgress.items));
    } catch (error) {
      setSaveErrorMessage(
        error instanceof ProjectsApiError
          ? error.message
          : "Ocurrió un error al guardar el progreso.",
      );

      if (progress) {
        setProgressValues(createProgressValues(progress.items));
      }
    } finally {
      setSavingStage(null);
    }
  };

  if (isLoading) {
    return (
      <Center mih={300}>
        <Loader color="yellow" />
      </Center>
    );
  }

  if (errorMessage || !project || !dwelling || !progress) {
    return (
      <Container size="xl">
        <Alert color="red" title="No se pudo cargar la vivienda">
          {errorMessage ?? "La vivienda no está disponible."}
        </Alert>
      </Container>
    );
  }

  const percentages = new Map(
    progress.items.map((item) => [item.stage, item.percentage]),
  );

  const renderStage = ({ stage, label }: ProgressStageInformation) => {
    const savedPercentage = percentages.get(stage) ?? 0;
    const percentage = progressValues[stage] ?? savedPercentage;
    const isSaving = savingStage === stage;

    return (
      <Stack key={stage} gap={6}>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {label}
          </Text>

          <Text size="sm" c="dimmed">
            {percentage}%
          </Text>
        </Group>

        {canEditProgress ? (
          <Slider
            value={percentage}
            onChange={(value) => handleProgressChange(stage, value)}
            onChangeEnd={(value) => void handleProgressChangeEnd(stage, value)}
            min={0}
            max={100}
            step={1}
            color="yellow"
            label={(value) => `${value}%`}
            disabled={savingStage !== null}
          />
        ) : (
          <Progress value={percentage} color="yellow" size="md" radius="xl" />
        )}

        {isSaving && (
          <Text size="xs" c="dimmed">
            Guardando…
          </Text>
        )}
      </Stack>
    );
  };

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Button
          component={Link}
          to={`/projects/${project.id}`}
          variant="subtle"
          color="dark"
          leftSection={<IconArrowLeft size={18} />}
          w="fit-content"
        >
          Volver al proyecto
        </Button>

        <Stack gap={4}>
          <Title order={1}>Vivienda {dwelling.number}</Title>

          <Text c="dimmed">{project.name}</Text>

          <Text size="xs" c="dimmed" ff="monospace">
            {dwelling.code}
          </Text>
        </Stack>

        {saveErrorMessage && (
          <Alert
            color="red"
            title="No se pudo guardar el progreso"
            withCloseButton
            onClose={() => setSaveErrorMessage(null)}
          >
            {saveErrorMessage}
          </Alert>
        )}

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={2}>Progreso general</Title>

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
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack gap="lg">
            <Group justify="space-between">
              <Title order={2}>Instalaciones</Title>

              <Text fw={700}>
                {progress.installations_percentage.toFixed(1)}%
              </Text>
            </Group>

            <Progress
              value={progress.installations_percentage}
              color="yellow"
              size="lg"
              radius="xl"
            />

            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {installationStages.map(renderStage)}
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack gap="lg">
            <Title order={2}>Fases de construcción</Title>

            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {mainStages.map(renderStage)}
            </SimpleGrid>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};
