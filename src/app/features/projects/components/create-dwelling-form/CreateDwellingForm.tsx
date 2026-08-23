import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Button,
  Group,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";

import {
  createDwelling,
  ProjectsApiError,
} from "@/app/features/projects/api/projectsApi";


type CreateDwellingFormProps = {
  projectId: string;
  onCreated: () => void;
  onCancel: () => void;
};


export const CreateDwellingForm = ({
  projectId,
  onCreated,
  onCancel,
}: CreateDwellingFormProps) => {
  const [number, setNumber] = useState("");
  const [description, setDescription] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createDwelling(projectId, {
        number: number.trim(),
        description:
          description.trim() || null,
      });

      onCreated();
    } catch (error) {
      setErrorMessage(
        error instanceof ProjectsApiError
          ? error.message
          : "Ocurrió un error al crear la vivienda.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        <TextInput
          label="Número o identificación"
          description="Por ejemplo: 12, B-04 o Portal 2 - 1A"
          value={number}
          onChange={(event) =>
            setNumber(event.currentTarget.value)
          }
          required
          minLength={1}
          maxLength={60}
          autoFocus
        />

        <Textarea
          label="Descripción"
          value={description}
          onChange={(event) =>
            setDescription(
              event.currentTarget.value,
            )
          }
          maxLength={3000}
          minRows={3}
          autosize
        />

        {errorMessage && (
          <Alert
            color="red"
            title="No se pudo crear la vivienda"
          >
            {errorMessage}
          </Alert>
        )}

        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={onCancel}
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
            Crear vivienda
          </Button>
        </Group>
      </Stack>
    </form>
  );
};