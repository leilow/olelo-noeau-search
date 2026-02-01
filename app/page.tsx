import AboutProject from '@/components/home/AboutProject';
import DailyPull from '@/components/home/DailyPull';
import SubmitPoeticalPhraseForm from '@/components/home/SubmitPoeticalPhraseForm';
import VisitorCount from '@/components/metrics/VisitorCount';
import MembersCount from '@/components/metrics/MembersCount';
import { getDailyPullData } from '@/lib/daily-pull-server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialDailyPull = await getDailyPullData();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Free-form layout with varied spacing */}
        <div className="space-y-8 sm:space-y-12">
          {/* About Project - larger, prominent */}
          <div className="max-w-4xl">
            <AboutProject />
          </div>
          
          {/* Daily Pull and Metrics - side by side with varied widths */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 max-w-2xl">
              <DailyPull initialData={initialDailyPull} />
            </div>
            <div className="lg:w-64 space-y-6">
              <VisitorCount />
              <MembersCount />
            </div>
          </div>
          
          {/* Form - full width but offset */}
          <div className="max-w-3xl ml-auto">
            <SubmitPoeticalPhraseForm />
          </div>
        </div>
      </div>
    </div>
  );
}
