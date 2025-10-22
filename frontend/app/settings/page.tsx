"use client";

export default function SettingsPage() {
  return (
    <div className="h-full flex items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">Settings</h1>
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Account</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">Manage your account settings</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">AI Models</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">Configure AI model preferences</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Appearance</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">Customize the app appearance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
