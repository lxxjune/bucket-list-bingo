import { createClient } from '@/utils/supabase/server';
import SiteHeader from './SiteHeader';

export default async function SiteHeaderServer() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return <SiteHeader isLoggedIn={!!user} email={user?.email} />;
}
