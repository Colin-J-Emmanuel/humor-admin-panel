import { SignupDomainForm } from "../_components/signup-domain-form";

export default function NewSignupDomainPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New signup domain</h1>
        <p className="mt-1 text-sm text-gray-600">
          Allow a new email domain to register.
        </p>
      </div>
      <SignupDomainForm />
    </div>
  );
}