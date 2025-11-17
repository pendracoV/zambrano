// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  is_superuser: boolean; // <-- La clave del éxito
  is_staff: boolean;     // <-- Importante también
  first_name: string;
  last_name: string;
  // Agrega otros campos según tu API
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const loadUserFromToken = async () => {
      const storedToken = localStorage.getItem('authToken');

      if (storedToken) {
        try {
          // 1. Poner el token en el estado de React
          setToken(storedToken);

          // 2. Usar el token para pedir el perfil fresco
          const profileResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/profile/`,
            {
              headers: { Authorization: `Token ${storedToken}` }
            }
          );

          // 3. Guardar el usuario completo en el estado y localStorage
          const fullUser = profileResponse.data;
          setUser(fullUser);
          localStorage.setItem('user', JSON.stringify(fullUser)); // Actualizamos el storage

        } catch (error) {
          // El token era inválido (expiró, etc.)
          console.error('Error cargando perfil con token:', error);
          // Limpiamos todo
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUserFromToken();
  }, []); // Se ejecuta solo una vez al cargar la app

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}