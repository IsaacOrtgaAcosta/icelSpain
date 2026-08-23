import {
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { CreateProjectForm } from "@/app/features/projects/components/create-project-form/CreateProjectForm";


export const CreateProjectPage = () => {
  return (
    <Container size="sm">
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={1}>
            Crear proyecto
          </Title>

          <Text c="dimmed">
            Registra una nueva obra en ICEL Spain.
          </Text>
        </Stack>

        <CreateProjectForm />
      </Stack>
    </Container>
  );
};