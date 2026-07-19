import { loginApp } from "@/app/actions/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-4 sm:p-6">
      <Card className="w-full max-w-sm border-2 bg-card/70">
        <CardHeader className="text-center">
          <CardTitle className="font-cairn text-5xl text-primary leading-none">Cairn</CardTitle>
          <p className="text-muted-foreground text-sm">Entrez pour rejoindre la table</p>
        </CardHeader>
        <CardContent>
          <form action={loginApp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mot de passe"
                autoFocus
                suppressHydrationWarning
                aria-invalid={!!error}
              />
              {error && (
                <p className="text-destructive text-sm" role="alert">
                  Mot de passe incorrect.
                </p>
              )}
            </div>
            <SubmitButton className="w-full" pendingLabel="Ouverture…">
              Entrer
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
