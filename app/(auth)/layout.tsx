// Layout auth — affichage minimaliste sans navigation ni footer
// Utilisé pour login, signup, reset-password
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
