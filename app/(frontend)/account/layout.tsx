import { getCurrentUser } from '@/lib/auth';
import AccountSidebar from '@/components/account/AccountSidebar';

async function getUserData() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    // Return user data from token
    return {
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      email: currentUser.email,
      role: currentUser.role,
    };
  } catch (error) {
    return null;
  }
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already checked auth, so we just get user data
  const user = await getUserData();

  return (
    <div className="container-custom py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AccountSidebar user={user} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
