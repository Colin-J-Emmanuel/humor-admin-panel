import { CaptionExampleForm } from "../_components/caption-example-form";

export default function NewCaptionExamplePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New caption example</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a few-shot example used to guide caption generation.
        </p>
      </div>
      <CaptionExampleForm />
    </div>
  );
}