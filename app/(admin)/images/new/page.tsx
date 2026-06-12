import { ImageUploader } from "../_components/image-uploader";

export default function NewImagePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload image</h1>
        <p className="mt-1 text-sm text-gray-600">
          Uploads through the caption pipeline and registers the image in the
          library.
        </p>
      </div>
      <ImageUploader />
    </div>
  );
}