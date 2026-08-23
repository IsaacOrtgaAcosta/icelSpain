import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Button,
  Card,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
  Text,
} from "@mantine/core";

import {
  createManagedUser,
  UsersApiError,
} from "@/app/features/users/api/usersApi";
import type { ManagedUserRole } from "@/app/features/users/types";

export const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ManagedUserRole>("employee");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoleChange = (value: string | null): void => {
    if (value === "site_manager" || value === "employee") {
      setRole(value);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 12 || password.length > 128) {
      setErrorMessage("La contraseña debe tener entre 12 y 128 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdUser = await createManagedUser(
        {
          email: email.trim(),
          full_name: fullName.trim(),
          password,
          role,
        },
      );

      setSuccessMessage(`Usuario ${createdUser.email} creado correctamente.`);

      setEmail("");
      setFullName("");
      setPassword("");
      setRole("employee");
    } catch (error) {
      if (error instanceof UsersApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al crear el usuario.");
      }
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
      maw="100%"
    >
      <Stack gap="lg">
        <Title order={2}>Crear usuario</Title>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Nombre completo"
            value={fullName}
            onChange={(event) => setFullName(event.currentTarget.value)}
            required
            maxLength={120}
            autoComplete="name"
          />

          <TextInput
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            autoComplete="email"
          />

          <Select
            label="Rol"
            value={role}
            onChange={handleRoleChange}
            data={[
              {
                value: "site_manager",
                label: "Encargado de obra",
              },
              {
                value: "employee",
                label: "Empleado",
              },
            ]}
            allowDeselect={false}
            required
          />
          <Stack gap={4}>
            <PasswordInput
              label="Contraseña inicial"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              aria-describedby="initial-password-help"
            />
            <Text id="initial-password-help" size="xs" c="dimmed">
              Debe contener entre 12 y 128 caracteres.
            </Text>
          </Stack>
        </SimpleGrid>

        {errorMessage && (
          <Alert color="red" title="No se pudo crear el usuario">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" title="Usuario creado">
            {successMessage}
          </Alert>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          color="yellow"
          c="black"
          maw={220}
        >
          Crear usuario
        </Button>
      </Stack>
    </Card>
  );
};
