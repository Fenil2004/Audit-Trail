const API_URL = "http://127.0.0.1:5000/api/auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

async function authRequest(
  endpoint: string,
  data: Record<string, string>
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: AuthResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return authRequest("register", data);
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const result = await authRequest("login", data);

  if (result.token) {
    localStorage.setItem("authToken", result.token);
  }

  if (result.user) {
    localStorage.setItem("authUser", JSON.stringify(result.user));
  }

  return result;
}
