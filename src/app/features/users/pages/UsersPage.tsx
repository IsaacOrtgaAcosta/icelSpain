import { Container, Stack, Text, Title } from "@mantine/core";

import { CreateUserForm } from "@/app/features/users/components/create-user-form/CreateUserForm";

export const UsersPage = () => {
  return (
    <Container size="xl">
      <Stack gap="xl" maw={760} w="100%" mx="auto">
        <Stack gap="xs">
          <Title order={1}>Usuarios</Title>

          <Text c="dimmed">Crea y administra los usuarios de ICEL Spain.</Text>
        </Stack>

        <CreateUserForm />
      </Stack>
    </Container>
  );
};
