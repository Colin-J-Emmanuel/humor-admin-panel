import { ImageForm } from "../_components/image-form";

export default function NewImagePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New image</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add an image to the humor project library.
        </p>
      </div>
      <ImageForm />
    </div>
  );
}