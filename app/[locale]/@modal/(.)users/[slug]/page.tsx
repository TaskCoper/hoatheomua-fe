import { UserProfileModalShell } from './_components/user-profile-modal-shell'

interface UserProfileModalPageProps {
  params: Promise<{ slug: string }>
}

export default async function UserProfileModalPage({ params }: UserProfileModalPageProps) {
  const { slug } = await params

  return <UserProfileModalShell slug={slug} />
}
