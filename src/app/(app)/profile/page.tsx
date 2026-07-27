import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile — CareerAtlas" };

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" description="Sign in to personalize your dashboard and projections." />
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-up">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [profile, industries] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.industry.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" description="This powers your personalized dashboard, salary projections, and recommendations." />
      <Card>
        <CardContent className="pt-6">
          <ProfileForm profile={profile} industries={industries} />
        </CardContent>
      </Card>
    </div>
  );
}
