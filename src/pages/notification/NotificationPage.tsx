import { NotificationList } from '@/features/notification';

export const NotificationPage = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <section className="px-4 py-5 sm:px-6 max-w-2xl mx-auto">
        <NotificationList />
      </section>
    </div>
  );
};
