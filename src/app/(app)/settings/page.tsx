import Link from "next/link";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSettings } from "@/components/theme-settings";
import { DeleteAccountButton } from "@/components/delete-account-button";

export const metadata = { title: "Settings — CareerAtlas" };

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Appearance, data export, and account controls." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSettings />
        </CardContent>
      </Card>

      {session?.user?.email ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Export your saved careers as a CSV file.</p>
              <Button variant="outline" asChild>
                <a href="/api/export/saved" download>
                  Export saved careers (CSV)
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Deleting your account removes your profile, saved careers, comparisons, and scenarios. This cannot be undone.
              </p>
              <DeleteAccountButton />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Sign in to manage your data and account.</p>
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
