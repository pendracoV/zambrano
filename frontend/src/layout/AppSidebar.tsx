import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/Authcontext"; // ⭐ NUEVO
// ⭐ ACTUALIZADO: Agregamos roles a NavItem y SubItem
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[]; // Roles permitidos para ver este item
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
    roles?: string[]; // Roles permitidos para subitems
  }[];
};

// ⭐ ACTUALIZADO: Agregamos roles a cada item del menú
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ 
      name: "Ecommerce", 
      path: "/dashboard", 
      pro: false 
    }],
    // Sin roles = accesible para todos los usuarios autenticados
  },
  {
    icon: <ListIcon />,
    name: "Eventos",
    path: "/events",
    // Sin roles = accesible para todos
  },
  {
    icon: <PageIcon />,
    name: "Creación de evento",
    path: "/create-event",
    roles: ["Administrador", "Organizador"], // ⚠️ Solo estos roles
  },
  {
    icon: <ListIcon />,
    name: "Mis Eventos",
    path: "/organizer/my-events",
    roles: ["Administrador", "Organizador"], // ⚠️ Solo organizadores
  },
  {
    icon: <TaskIcon />,
    name: "Mis Entradas",
    path: "/my-tickets",
    roles: ["Participante", "Organizador", "Administrador"], // Usuarios que participan
  },
  {
    icon: <PageIcon />,
    name: "Gestión de Tipos de Boleta",
    path: "/ticket-types",
    roles: ["Administrador", "Staff"], // ⚠️ Solo admin/staff
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
    // Sin roles = accesible para todos
  },
  {
    icon: <UserCircleIcon />,
    name: "Admin Users",
    path: "/admin/user-management",
    roles: ["Administrador"], // ⚠️ Solo administradores
  },
];

const othersItems: NavItem[] = [

];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth(); // ⭐ NUEVO: Obtener usuario actual
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ⭐ NUEVA FUNCIÓN: Verificar si el usuario tiene acceso
  const hasAccess = useCallback((itemRoles?: string[]): boolean => {
    // Si no se especifican roles, es accesible para todos los autenticados
    if (!itemRoles || itemRoles.length === 0) return true;
    
    // Si no hay usuario logueado o no tiene roles, no tiene acceso
    if (!user || !user.role || !Array.isArray(user.role)) return false;
    
    // Verificar si el usuario tiene AL MENOS uno de los roles requeridos
    return user.role.some(userRole => itemRoles.includes(userRole));
  }, [user]);

  // ⭐ NUEVO: Filtrar items del menú según roles del usuario
  const filteredNavItems = navItems
    .filter(item => hasAccess(item.roles))
    .map(item => ({
      ...item,
      // Si tiene subItems, filtrarlos también por roles
      subItems: item.subItems?.filter(subItem => hasAccess(subItem.roles))
    }))
    // Eliminar items que quedaron sin subItems si originalmente los tenían
    .filter(item => !item.subItems || item.subItems.length > 0);

  const filteredOthersItems = othersItems
    .filter(item => hasAccess(item.roles))
    .map(item => ({
      ...item,
      subItems: item.subItems?.filter(subItem => hasAccess(subItem.roles))
    }))
    .filter(item => !item.subItems || item.subItems.length > 0);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // ⭐ ARREGLADO: Memoizar los items filtrados para evitar recreación infinita
  const memoizedFilteredNavItems = useMemo(() => 
    navItems
      .filter(item => hasAccess(item.roles))
      .map(item => ({
        ...item,
        subItems: item.subItems?.filter(subItem => hasAccess(subItem.roles))
      }))
      .filter(item => !item.subItems || item.subItems.length > 0),
    [hasAccess]
  );

  const memoizedFilteredOthersItems = useMemo(() =>
    othersItems
      .filter(item => hasAccess(item.roles))
      .map(item => ({
        ...item,
        subItems: item.subItems?.filter(subItem => hasAccess(subItem.roles))
      }))
      .filter(item => !item.subItems || item.subItems.length > 0),
    [hasAccess]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? memoizedFilteredNavItems : memoizedFilteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, memoizedFilteredNavItems, memoizedFilteredOthersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(memoizedFilteredNavItems, "main")}
            </div>
            {/* ⭐ Solo mostrar sección "Others" si hay items filtrados */}
            {memoizedFilteredOthersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(memoizedFilteredOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;