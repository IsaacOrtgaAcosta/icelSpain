import { useState } from "react";
import {
  AppShell,
  Burger,
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
} from "@tabler/icons-react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Imagotipo from "@/../public/images/imagotipo.webp";
import { authStorage } from "@/app/features/auth/authStorage";

import classes from "./AppLayout.module.css";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: IconLayoutDashboard,
  },
];

export const AppLayout = () => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    authStorage.clearAccessToken();
    navigate("/", { replace: true });
  };

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
        <Group h="100%" px="md">
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
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap="xs">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.8} />}
                active={location.pathname === item.path}
                onClick={() => setMobileMenuOpened(false)}
                className={classes.navigationLink}
              />
            ))}
          </Stack>

          <UnstyledButton
            className={classes.logoutButton}
            onClick={handleLogout}
          >
            <IconLogout size={20} stroke={1.8} />
            <Text size="sm" fw={500}>
              Cerrar sesión
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