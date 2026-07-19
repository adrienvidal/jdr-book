import { loginMj } from "@/app/actions/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";

export default async function MjLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-4 sm:p-6">
      <Card className="w-full max-w-sm border-2 border-moss/40 bg-card/70">
        <CardHeader className="text-center">
          <CardTitle className="font-cairn text-4xl text-moss leading-none">Interface MJ</CardTitle>
          <p className="text-muted-foreground text-sm">Réservé au Warden</p>
        </CardHeader>
        <CardContent>
          <form action={loginMj} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe MJ</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mot de passe MJ"
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
            <SubmitButton
              className="w-full bg-moss text-moss-fg hover:bg-moss/90"
              pendingLabel="Déverrouillage…"
            >
              Déverrouiller
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
