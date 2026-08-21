import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBuilding,
  IconChecklist,
  IconClock,
  IconCurrencyEuro,
} from "@tabler/icons-react";

const summaryItems = [
  {
    title: "Proyectos activos",
    value: "0",
    description: "Proyectos actualmente en ejecución",
    icon: IconBuilding,
  },
  {
    title: "Tareas pendientes",
    value: "0",
    description: "Tareas que requieren atención",
    icon: IconChecklist,
  },
  {
    title: "Próximos vencimientos",
    value: "0",
    description: "Vencimientos durante esta semana",
    icon: IconClock,
  },
  {
    title: "Presupuesto gestionado",
    value: "0 €",
    description: "Importe total de los proyectos",
    icon: IconCurrencyEuro,
  },
];

export const DashboardPage = () => {
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text c="dimmed" size="sm">
            Resumen general
          </Text>

          <Title order={1}>Dashboard</Title>
        </div>

        <Badge color="yellow" variant="light" size="lg">
          ICEL Spain
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
        {summaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} withBorder radius="md" padding="lg">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text size="sm" c="dimmed" fw={500}>
                    {item.title}
                  </Text>

                  <Text size="xl" fw={700} mt={4}>
                    {item.value}
                  </Text>
                </div>

                <ThemeIcon color="yellow" variant="light" size="lg" radius="md">
                  <Icon size={22} stroke={1.8} />
                </ThemeIcon>
              </Group>

              <Text size="xs" c="dimmed" mt="md">
                {item.description}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>

      <Card withBorder radius="md" padding="lg">
        <Title order={3}>Actividad reciente</Title>

        <Text c="dimmed" size="sm" mt="sm">
          La actividad de proyectos, tareas y presupuestos aparecerá aquí cuando
          esos módulos estén conectados.
        </Text>
      </Card>
    </Stack>
  );
};
