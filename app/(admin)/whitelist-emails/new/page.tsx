import { WhitelistEmailForm } from "../_components/whitelist-email-form";

export default function NewWhitelistEmailPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New whitelisted email</h1>
        <p className="mt-1 text-sm text-gray-600">
          Allow a specific email address to register.
        </p>
      </div>
      <WhitelistEmailForm />
    </div>
  );
}