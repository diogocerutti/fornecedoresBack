export type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export function parseLoginInput(body: unknown): LoginInput {
  if (!body || typeof body !== "object") {
    throw new Error("Informe e-mail e senha.");
  }

  const input = body as Record<string, unknown>;
  const email =
    typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!email || !email.includes("@") || email.length > 255) {
    throw new Error("Informe um e-mail válido.");
  }

  if (!password || password.length > 512) {
    throw new Error("Informe sua senha.");
  }

  return {
    email,
    password,
    remember: input.remember === true,
  };
}
