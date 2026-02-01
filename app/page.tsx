import { Suspense } from 'react';
import AboutProject from '@/components/home/AboutProject';
import DailyPull from '@/components/home/DailyPull';
import SubmitPoeticalPhraseForm from '@/components/home/SubmitPoeticalPhraseForm';
import VisitorCount from '@/components/metrics/VisitorCount';
import MembersCount from '@/components/metrics/MembersCount';
import { getDailyPullData } from '@/lib/daily-pull-server';

export const dynamic = 'force-dynamic';

async function DailyPullWithData() {
  const initialDailyPull = await getDailyPullData();
  return <DailyPull initialData={initialDailyPull} />;
}

function DailyPullFallback() {
  return (
    <section
      className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm animate-pulse"
      style={{ backgroundColor: 'rgba(234, 234, 210, 0.7)' }}
    >
      <div className="h-8 w-32 bg-text/10 rounded mb-4" />
      <div className="h-4 w-full bg-text/10 rounded mb-2" />
      <div className="h-4 w-3/4 bg-text/10 rounded" />
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="space-y-8 sm:space-y-12">
          <div className="max-w-4xl">
            <AboutProject />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 max-w-2xl">
              <Suspense fallback={<DailyPullFallback />}>
                <DailyPullWithData />
              </Suspense>
            </div>
            <div className="lg:w-64 space-y-6">
              <VisitorCount />
              <MembersCount />
            </div>
          </div>

          <div className="max-w-3xl ml-auto">
            <SubmitPoeticalPhraseForm />
          </div>
        </div>
      </div>
    </div>
  );
}
