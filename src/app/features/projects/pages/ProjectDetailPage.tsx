import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconBuilding,
  IconHomePlus,
  IconMapPin,
} from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "@/app/features/auth/context/auth-context";
import {
  getProject,
  ProjectsApiError,
} from "@/app/features/projects/api/projectsApi";
import { CreateDwellingForm } from "@/app/features/projects/components/create-dwelling-form/CreateDwellingForm";
import { ProjectAssignmentsSection } from "../components/project-assignments-section/ProjectAssignmentsSection";
import { ProjectProgressSummary } from "../components/project-progress-summary/ProjectProgressSummary";
import type {
  ProjectDetail,
  ProjectStatus,
} from "@/app/features/projects/types";

const statusInformation: Record<
  ProjectStatus,
  { label: string; color: string }
> = {
  planning: {
    label: "Planificación",
    color: "gray",
  },
  active: {
    label: "En curso",
    color: "green",
  },
  paused: {
    label: "Pausado",
    color: "orange",
  },
  completed: {
    label: "Finalizado",
    color: "blue",
  },
};

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();
  const { user } = useAuth();

  const [dwellingModalOpened, dwellingModal] = useDisclosure(false);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  const canCreateDwellings =
    user?.role === "owner" || user?.role === "architect";

  useEffect(() => {
    let cancelled = false;

    const loadProject = async (): Promise<void> => {
      if (!projectId) {
        setErrorMessage("No se ha indicado ningún proyecto.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const projectDetail = await getProject(projectId);

        if (!cancelled) {
          setProject(projectDetail);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ProjectsApiError
              ? error.message
              : "Ocurrió un error al cargar el proyecto.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadAttempt]);

  const handleDwellingCreated = (): void => {
    dwellingModal.close();
    setReloadAttempt((current) => current + 1);
  };

  if (isLoading) {
    return (
      <Center mih={300}>
        <Loader color="yellow" />
      </Center>
    );
  }

  if (errorMessage || !project) {
    return (
      <Container size="xl">
        <Stack gap="lg">
          <Button
            component={Link}
            to="/projects"
            variant="subtle"
            color="dark"
            leftSection={<IconArrowLeft size={18} />}
            w="fit-content"
          >
            Volver a proyectos
          </Button>

          <Alert color="red" title="No se pudo cargar el proyecto">
            {errorMessage ?? "El proyecto no está disponible."}
          </Alert>
        </Stack>
      </Container>
    );
  }

  const status = statusInformation[project.status];

  return (
    <>
      <Container size="xl">
        <Stack gap="xl">
          <Button
            component={Link}
            to="/projects"
            variant="subtle"
            color="dark"
            leftSection={<IconArrowLeft size={18} />}
            w="fit-content"
          >
            Volver a proyectos
          </Button>

          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Group gap="sm">
                <Title order={1}>{project.name}</Title>

                <Badge color={status.color} variant="light">
                  {status.label}
                </Badge>
              </Group>

              <Text size="sm" c="dimmed" ff="monospace">
                {project.code}
              </Text>
            </Stack>

            {canCreateDwellings && (
              <Button
                color="yellow"
                c="black"
                leftSection={<IconHomePlus size={18} />}
                onClick={dwellingModal.open}
              >
                Añadir vivienda
              </Button>
            )}
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Card withBorder radius="md" padding="lg">
              <Stack gap="sm">
                <Group gap="xs">
                  <IconMapPin size={20} />

                  <Text fw={600}>Ubicación</Text>
                </Group>

                <Text>{project.address}</Text>

                <Text c="dimmed" size="sm">
                  {project.postal_code} {project.city}, {project.province}
                </Text>
              </Stack>
            </Card>

            <Card withBorder radius="md" padding="lg">
              <Stack gap="sm">
                <Text fw={600}>Descripción</Text>

                <Text c={project.description ? undefined : "dimmed"}>
                  {project.description ?? "Sin descripción."}
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <ProjectProgressSummary projectId={project.id} />

          <Stack gap="md">
            <Group justify="space-between">
              <Title order={2}>Viviendas</Title>

              <Badge variant="light" color="gray">
                {project.dwellings.length}
              </Badge>
            </Group>

            {project.dwellings.length === 0 ? (
              <Card withBorder radius="md" padding="xl">
                <Center>
                  <Stack align="center" gap="sm">
                    <IconBuilding size={40} stroke={1.5} />

                    <Text fw={600}>Todavía no hay viviendas</Text>

                    <Text size="sm" c="dimmed" ta="center">
                      Añade las viviendas que pertenecen a este proyecto.
                    </Text>
                  </Stack>
                </Center>
              </Card>
            ) : (
              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                  lg: 3,
                }}
              >
                {project.dwellings.map((dwelling) => (
                  <Card key={dwelling.id} withBorder radius="md" padding="lg" h="100%">
                    <Stack gap="sm" h="100%">
                      <Title order={3}>Vivienda {dwelling.number}</Title>

                      <Text size="xs" c="dimmed" ff="monospace">
                        {dwelling.code}
                      </Text>

                      <Text
                        size="sm"
                        c={dwelling.description ? undefined : "dimmed"}
                      >
                        {dwelling.description ?? "Sin descripción."}
                      </Text>
                      <Button
                        component={Link}
                        to={`/projects/${project.id}/dwellings/${dwelling.id}`}
                        variant="light"
                        color="yellow"
                        c="black"
                        mt="auto"
                      >
                        Ver progreso
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>

          <ProjectAssignmentsSection projectId={project.id} />
        </Stack>
      </Container>

      <Modal
        opened={dwellingModalOpened}
        onClose={dwellingModal.close}
        title="Añadir vivienda"
        centered
      >
        <CreateDwellingForm
          projectId={project.id}
          onCreated={handleDwellingCreated}
          onCancel={dwellingModal.close}
        />
      </Modal>
    </>
  );
};
