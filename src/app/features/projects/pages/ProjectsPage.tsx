import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBuilding,
  IconMapPin,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/app/features/auth/context/auth-context";
import {
  listProjects,
  ProjectsApiError,
} from "@/app/features/projects/api/projectsApi";
import type { Project, ProjectStatus } from "@/app/features/projects/types";

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

export const ProjectsPage = () => {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  const canCreateProjects =
    user?.role === "owner" || user?.role === "architect";

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const projectList = await listProjects();

        if (!cancelled) {
          setProjects(projectList);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ProjectsApiError
              ? error.message
              : "Ocurrió un error al cargar los proyectos.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [reloadAttempt]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    if (!normalizedSearch) {
      return projects;
    }

    return projects.filter((project) => {
      const searchableContent = [
        project.name,
        project.code,
        project.address,
        project.city,
        project.province,
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return searchableContent.includes(normalizedSearch);
    });
  }, [projects, search]);

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={4}>
            <Title order={1}>Proyectos</Title>

            <Text c="dimmed">
              Consulta y administra las obras de ICEL Spain.
            </Text>
          </Stack>

          {canCreateProjects && (
            <Button
              component={Link}
              to="/projects/new"
              color="yellow"
              c="black"
              leftSection={<IconPlus size={18} />}
            >
              Crear proyecto
            </Button>
          )}
        </Group>

        <TextInput
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Buscar por nombre, código, dirección o localidad"
          leftSection={<IconSearch size={18} />}
          aria-label="Buscar proyectos"
        />

        {isLoading && (
          <Center py="xl">
            <Loader color="yellow" />
          </Center>
        )}

        {!isLoading && errorMessage && (
          <Alert
            color="red"
            title="No se pudieron cargar los proyectos"
            icon={<IconAlertCircle size={20} />}
          >
            <Stack gap="sm">
              <Text size="sm">{errorMessage}</Text>

              <Button
                variant="light"
                color="red"
                w="fit-content"
                onClick={() => setReloadAttempt((current) => current + 1)}
              >
                Reintentar
              </Button>
            </Stack>
          </Alert>
        )}

        {!isLoading && !errorMessage && filteredProjects.length === 0 && (
          <Card withBorder radius="md" padding="xl">
            <Center>
              <Stack align="center" gap="sm">
                <IconBuilding size={40} stroke={1.5} />

                <Text fw={600}>
                  {projects.length === 0
                    ? "Todavía no hay proyectos"
                    : "No se encontraron resultados"}
                </Text>

                <Text size="sm" c="dimmed" ta="center">
                  {projects.length === 0
                    ? "Crea el primer proyecto para comenzar."
                    : "Prueba con otro término de búsqueda."}
                </Text>
              </Stack>
            </Center>
          </Card>
        )}

        {!isLoading && !errorMessage && filteredProjects.length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {filteredProjects.map((project) => {
              const status = statusInformation[project.status];

              return (
                <Card key={project.id} withBorder radius="md" padding="lg" h="100%" style={{display: 'flex', flexDirection: 'column'}}>
                  <Stack gap="md" style={{ flex: 1}}>
                    <Group
                      justify="space-between"
                      align="flex-start"
                      wrap="nowrap"
                    >
                      <Title order={3} lineClamp={2}>
                        {project.name}
                      </Title>

                      <Badge color={status.color} variant="light">
                        {status.label}
                      </Badge>
                    </Group>

                    <Text size="xs" c="dimmed" ff="monospace">
                      {project.code}
                    </Text>

                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <IconMapPin size={18} stroke={1.7} />

                      <Text size="sm">
                        {project.address}, {project.postal_code} {project.city},{" "}
                        {project.province}
                      </Text>
                    </Group>
                    <Button
                      component={Link}
                      to={`/projects/${project.id}`}
                      variant="light"
                      color="yellow"
                      c="black"
                      mt="auto"
                    >
                      Ver proyecto
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};
