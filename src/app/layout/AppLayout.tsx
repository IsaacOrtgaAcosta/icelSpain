import { useState } from "react";
import {
  AppShell,
  Badge,
  Box,
  Burger,
  Divider,
  Group,
  Image,
  NavLink,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconLogout,
  IconUsers,
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import Imagotipo from "@/../public/images/imagotipo.webp";
import { useAuth } from "../features/auth/context/auth-context";
import { logout } from "@/app/features/auth/api/authApi";
import type { UserRole } from "../features/auth/types";
import classes from "./AppLayout.module.css";

const roleLabels: Record<UserRole, string> = {
  owner: "Propietario",
  architect: "Arquitecto",
  site_manager: "Encargado",
  employee: "Empleado",
};

const roleColors: Record<UserRole, string> = {
  owner: "yellow",
  architect: "grape",
  site_manager: "blue",
  employee: "gray",
};

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: IconLayoutDashboard,
    ownerOnly: false,
  },
  {
    label: "Proyectos",
    path: "/projects",
    icon: IconBuildingCommunity,
    ownerOnly: false,
  },
  {
    label: "Usuarios",
    path: "/users",
    icon: IconUsers,
    ownerOnly: true,
  },
];

export const AppLayout = () => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);

    try {
      await logout();
      setUser(null);
      navigate("/", { replace: true });
    } catch {
      window.alert(
        "No se pudo cerrar la sesión. Comprueba la conexión e inténtalo de nuevo.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.full_name ?? user?.email ?? "Usuario";

  const visibleNavigationItems = navigationItems.filter(
    (item) => !item.ownerOnly || user?.role === "owner",
  );

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: {
          mobile: !mobileMenuOpened,
        },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Burger
            opened={mobileMenuOpened}
            onClick={() => setMobileMenuOpened((opened) => !opened)}
            hiddenFrom="sm"
            size="sm"
          />

          <Group gap="sm">
            <Image
              src={Imagotipo}
              alt="Imagotipo de ICEL"
              w={42}
              h={42}
              radius="md"
            />

            <Text fw={700} size="lg">
              ICEL Spain
            </Text>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Stack gap={2} align="flex-end">
              <Text size="sm" fw={600} truncate maw={{ base: 120, sm: 240 }}>
                {displayName}
              </Text>
            </Stack>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap="xs">
            {visibleNavigationItems.map((item) => (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.8} />}
                active={
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`)
                }
                onClick={() => setMobileMenuOpened(false)}
                className={classes.navigationLink}
              />
            ))}
          </Stack>

          <Stack gap="sm">
            <Divider />

            <Box className={classes.userInformation}>
              <Text size="sm" fw={600} truncate>
                {displayName}
              </Text>

              {user && (
                <>
                  <Text size="xs" c="dimmed" truncate>
                    {user.email}
                  </Text>

                  <Badge
                    color={roleColors[user.role]}
                    variant="light"
                    size="sm"
                    mt={6}
                  >
                    {roleLabels[user.role]}
                  </Badge>
                </>
              )}
            </Box>
          </Stack>

          <UnstyledButton
            className={classes.logoutButton}
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            <IconLogout size={20} stroke={1.8} />
            <Text size="sm" fw={500}>
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </Text>
          </UnstyledButton>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
