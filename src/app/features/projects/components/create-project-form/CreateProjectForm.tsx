import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";

import {
  createProject,
  ProjectsApiError,
} from "@/app/features/projects/api/projectsApi";
import type {
  ProjectStatus,
} from "@/app/features/projects/types";


export const CreateProjectForm = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] =
    useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] =
    useState("");
  const [projectStatus, setProjectStatus] =
    useState<ProjectStatus>("planning");

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const handleStatusChange = (
    value: string | null,
  ): void => {
    if (
      value === "planning" ||
      value === "active" ||
      value === "paused" ||
      value === "completed"
    ) {
      setProjectStatus(value);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createProject({
        name: name.trim(),
        description:
          description.trim() || null,
        address: address.trim(),
        postal_code: postalCode.trim(),
        city: city.trim(),
        province: province.trim(),
        status: projectStatus,
      });

      navigate("/projects", {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof ProjectsApiError
          ? error.message
          : "Ocurrió un error al crear el proyecto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      component="form"
      onSubmit={handleSubmit}
      withBorder
      shadow="sm"
      radius="md"
      padding="xl"
      w="100%"
    >
      <Stack gap="lg">
        <Title order={2}>
          Datos del proyecto
        </Title>

        <TextInput
          label="Nombre del proyecto"
          value={name}
          onChange={(event) =>
            setName(event.currentTarget.value)
          }
          required
          minLength={1}
          maxLength={160}
          autoComplete="organization"
        />

        <Textarea
          label="Descripción"
          value={description}
          onChange={(event) =>
            setDescription(event.currentTarget.value)
          }
          maxLength={3000}
          minRows={3}
          autosize
        />

        <TextInput
          label="Dirección"
          value={address}
          onChange={(event) =>
            setAddress(event.currentTarget.value)
          }
          required
          minLength={1}
          maxLength={255}
          autoComplete="address-line1"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Código postal"
            value={postalCode}
            onChange={(event) =>
              setPostalCode(
                event.currentTarget.value,
              )
            }
            required
            minLength={3}
            maxLength={20}
            autoComplete="postal-code"
          />

          <TextInput
            label="Localidad"
            value={city}
            onChange={(event) =>
              setCity(event.currentTarget.value)
            }
            required
            minLength={1}
            maxLength={120}
            autoComplete="address-level2"
          />

          <TextInput
            label="Provincia"
            value={province}
            onChange={(event) =>
              setProvince(
                event.currentTarget.value,
              )
            }
            required
            minLength={1}
            maxLength={120}
            autoComplete="address-level1"
          />

          <Select
            label="Estado inicial"
            value={projectStatus}
            onChange={handleStatusChange}
            data={[
              {
                value: "planning",
                label: "Planificación",
              },
              {
                value: "active",
                label: "En curso",
              },
              {
                value: "paused",
                label: "Pausado",
              },
              {
                value: "completed",
                label: "Finalizado",
              },
            ]}
            allowDeselect={false}
            required
          />
        </SimpleGrid>

        {errorMessage && (
          <Alert
            color="red"
            title="No se pudo crear el proyecto"
          >
            {errorMessage}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button
            component={Link}
            to="/projects"
            variant="default"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            color="yellow"
            c="black"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Crear proyecto
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};