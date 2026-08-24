import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Checkbox,
  MultiSelect,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import { useAuth } from "@/app/features/auth/context/auth-context";
import type { AuthUser } from "@/app/features/auth/types";
import {
  assignUsersToProject,
  listProjectAssignments,
  ProjectsApiError,
  removeUserFromProject,
} from "@/app/features/projects/api/projectsApi";
import type { ProjectAssignment } from "@/app/features/projects/types";
import {
  listAssignableUsers,
  UsersApiError,
} from "@/app/features/users/api/usersApi";

type ProjectAssignmentsSectionProps = {
  projectId: string;
};

const getRequestErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ProjectsApiError || error instanceof UsersApiError) {
    return error.message;
  }

  return fallback;
};

const sortAssignments = (
  assignments: ProjectAssignment[],
): ProjectAssignment[] =>
  [...assignments].sort((first, second) => {
    const firstName = first.user.full_name ?? first.user.email;
    const secondName = second.user.full_name ?? second.user.email;

    return firstName.localeCompare(secondName, "es");
  });

export const ProjectAssignmentsSection = ({
  projectId,
}: ProjectAssignmentsSectionProps) => {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AuthUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] =
  useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canManageAssignments =
    user?.role === "owner" || user?.role === "architect";

  useEffect(() => {
    let cancelled = false;

    const loadAssignments = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const assignmentList = await listProjectAssignments(projectId);

        let availableUsers: AuthUser[] = [];

        if (canManageAssignments) {
          availableUsers = await listAssignableUsers();
        }

        if (!cancelled) {
          setAssignments(sortAssignments(assignmentList));
          setAssignableUsers(availableUsers);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getRequestErrorMessage(
              error,
              "No se pudo cargar el personal del proyecto.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [projectId, canManageAssignments]);

  const availableUserOptions = useMemo(() => {
    const assignedUserIds = new Set(
      assignments.map((assignment) => assignment.user_id),
    );

    return assignableUsers
      .filter((assignableUser) => !assignedUserIds.has(assignableUser.id))
      .map((assignableUser) => ({
        value: assignableUser.id,
        label: assignableUser.full_name
          ? `${assignableUser.full_name} — ${assignableUser.email}`
          : assignableUser.email,
      }));
  }, [assignments, assignableUsers]);

  const handleSelectAll = (): void => {
    setSelectedUserIds(availableUserOptions.map((option) => option.value));
  };

  const handleAssign = async (): Promise<void> => {
    if (selectedUserIds.length === 0) {
      return;
    }

    setIsAssigning(true);
    setErrorMessage(null);

    try {
      const createdAssignments = await assignUsersToProject(projectId, {
        user_ids: selectedUserIds,
      });

      setAssignments((current) =>
        sortAssignments([...current, ...createdAssignments]),
      );

      setSelectedUserIds([]);
    } catch (error) {
      setErrorMessage(
        getRequestErrorMessage(error, "No se pudieron asignar los empleados."),
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (assignment: ProjectAssignment): Promise<void> => {
    const employeeName = assignment.user.full_name ?? assignment.user.email;

    const confirmed = window.confirm(
      `¿Quieres retirar a ${employeeName} de este proyecto?`,
    );

    if (!confirmed) {
      return;
    }

    setRemovingUserId(assignment.user_id);
    setErrorMessage(null);

    try {
      await removeUserFromProject(projectId, assignment.user_id);

      setAssignments((current) =>
        current.filter(
          (currentAssignment) =>
            currentAssignment.user_id !== assignment.user_id,
        ),
      );
    } catch (error) {
      setErrorMessage(
        getRequestErrorMessage(error, "No se pudo retirar al empleado."),
      );
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Group gap="sm">
            <IconUsers size={24} stroke={1.7} />

            <Title order={2}>Personal asignado</Title>
          </Group>

          <Badge variant="light" color="gray">
            {assignments.length}
          </Badge>
        </Group>

        {canManageAssignments && (
          <Stack gap="xs">
            <MultiSelect
              label="Empleados"
              placeholder={
                availableUserOptions.length > 0
                  ? "Selecciona uno o varios empleados"
                  : "No hay empleados disponibles"
              }
              data={availableUserOptions}
              value={selectedUserIds}
              onChange={setSelectedUserIds}
              searchable
              clearable
              maxValues={100}
              maxDropdownHeight={320}
              disabled={
                isLoading || isAssigning || availableUserOptions.length === 0
              }
              renderOption={({ option, checked }) => (
                <Group gap="sm" wrap="nowrap">
                  <Checkbox
                    checked={checked}
                    readOnly
                    tabIndex={-1}
                    style={{
                      pointerEvents: "none",
                    }}
                  />

                  <Text size="sm">{option.label}</Text>
                </Group>
              )}
            />

            <Group justify="space-between">
              <Group gap="xs">
                <Button
                  variant="subtle"
                  color="dark"
                  size="compact-sm"
                  disabled={
                    isAssigning ||
                    availableUserOptions.length === 0 ||
                    selectedUserIds.length === availableUserOptions.length
                  }
                  onClick={handleSelectAll}
                >
                  Seleccionar todos
                </Button>

                {selectedUserIds.length > 0 && (
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    disabled={isAssigning}
                    onClick={() => setSelectedUserIds([])}
                  >
                    Limpiar selección
                  </Button>
                )}
              </Group>

              <Button
                color="yellow"
                c="black"
                leftSection={<IconUserPlus size={18} />}
                loading={isAssigning}
                disabled={selectedUserIds.length === 0 || isAssigning}
                onClick={() => void handleAssign()}
              >
                {selectedUserIds.length === 0
                  ? "Asignar empleados"
                  : selectedUserIds.length === 1
                    ? "Asignar empleado"
                    : `Asignar ${selectedUserIds.length} empleados`}
              </Button>
            </Group>
          </Stack>
        )}

        {errorMessage && (
          <Alert
            color="red"
            title="No se pudo completar la operación"
            icon={<IconAlertCircle size={20} />}
          >
            {errorMessage}
          </Alert>
        )}

        {isLoading ? (
          <Center py="lg">
            <Loader color="yellow" />
          </Center>
        ) : assignments.length === 0 ? (
          <Paper withBorder radius="md" p="xl">
            <Center>
              <Stack align="center" gap="xs">
                <IconUsers size={36} stroke={1.5} />

                <Text fw={600}>No hay personal asignado</Text>

                <Text size="sm" c="dimmed" ta="center">
                  {canManageAssignments
                    ? "Selecciona un empleado para incorporarlo al proyecto."
                    : "Todavía no se han asignado empleados a este proyecto."}
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="sm">
            {assignments.map((assignment) => (
              <Paper key={assignment.id} withBorder radius="md" p="md">
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Text fw={600}>
                      {assignment.user.full_name ?? assignment.user.email}
                    </Text>

                    {assignment.user.full_name && (
                      <Text size="sm" c="dimmed">
                        {assignment.user.email}
                      </Text>
                    )}
                  </Stack>

                  <Group gap="sm" wrap="nowrap">
                    <Badge variant="light" color="gray">
                      Empleado
                    </Badge>

                    {canManageAssignments && (
                      <Tooltip label="Retirar del proyecto">
                        <ActionIcon
                          color="red"
                          variant="light"
                          aria-label={`Retirar a ${
                            assignment.user.full_name ?? assignment.user.email
                          } del proyecto`}
                          loading={removingUserId === assignment.user_id}
                          disabled={removingUserId !== null}
                          onClick={() => void handleRemove(assignment)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
